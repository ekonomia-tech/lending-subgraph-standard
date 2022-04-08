import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { Event } from '../../generated/schema'
import { Market } from '../../generated/schema'
import { getOrCreateLUSD, getOrCreateEther } from '../helpers/asset'
import {
  TroveUpdated,
  LUSDBorrowingFeePaid,
  TroveManagerAddressChanged,
} from '../../generated/BorrowerOperations/BorrowerOperations'
import { getOrCreateAccount, markAccountAsBorrowed, updateAccountStats } from '../helpers/account'
import { updateMarketStats } from '../helpers/market'
import { getOrCreateACM } from '../helpers/acm'

import { createProtocol, getProtocol } from '../helpers/protocol'
import {
  EthToLUSD,
  TCR_min,
  zeroBD,
  zeroInt,
  EthAddr,
  LUSDAddr,
  exponentToBigDecimal,
  LiquityBorrowerOpsAddr,
} from '../helpers/generic'
import { getTroveOperationFromBorrowerOperation } from '../helpers/TroveOperation'

/* ========== EVENT HANDLERS ========== */

/**
 * @dev this could be from other liquity deployed contracts, but either way the params (contract addresses) are immutable no matter what contract and event you query from.
 * @param event TroveManagerAdddressChanged
 */
export function handleTroveManagerAddressChanged(event: TroveManagerAddressChanged): void {
  createProtocol(event.params._newTroveManagerAddress, 'LIQUITY')
}

/**
 * @notice Updates subgraph according to scenario that TroveUpdate is occurring in
 * @param event TroveUpdated
 */
export function handleTroveUpdated(event: TroveUpdated): void {
  let market = createOrGetMarket(LiquityBorrowerOpsAddr)
  let protocol = getProtocol(market.protocol)
  let asset = getOrCreateLUSD(market.collateralBackedAsset)
  let account = getOrCreateAccount(event.params._borrower.toHexString())
  let operation = getTroveOperationFromBorrowerOperation(event.params.operation)

  let collAmount = event.params._coll
    .toBigDecimal()
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)
  // this is requested borrow + LUSD_FEE (borrowing fee) + GAS Compensation FEE (LUSD) which is returned upon closing Trove or given to liquidator.
  let borrowAmount = event.params._debt
    .toBigDecimal()
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

  if (operation == 'openTrove') {
    // need two eventIDs because there are two typical lending events that happen in an openTrove() scenario'
    // TODO: but we need to signify the event ID somehow to discern the two, but that requires changing the schema. The additional concats are temporary.
    markAccountAsBorrowed(account.id)

    let eventId1 = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString())
      .concat('-')
      .concat('1')
    // this is the collateral, no fees applied. Fees applied in LUSD.

    let openTroveEventEntry1 = new Event(eventId1)
    openTroveEventEntry1.eventType = 'DEPOSIT'
    openTroveEventEntry1.market = market.id
    openTroveEventEntry1.account = account.id
    openTroveEventEntry1.amount = collAmount
    openTroveEventEntry1.blockTime = event.block.timestamp.toI32()
    openTroveEventEntry1.blockNumber = event.block.number.toI32()
    openTroveEventEntry1.save()
    updateMarketStats(market.id, 'DEPOSIT', collAmount)
    updateAccountStats(
      protocol.id,
      market.id,
      account.id,
      collAmount,
      openTroveEventEntry1.eventType,
    )

    // second event within openTrove() scenario
    let eventId2 = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString())
      .concat('-')
      .concat('2')
    let openTroveEventEntry2 = new Event(eventId2)
    openTroveEventEntry2.eventType = 'BORROW'
    openTroveEventEntry2.market = market.id
    openTroveEventEntry2.account = account.id

    // This is the amount initially borrowed, during openTrove() this includes all the fees.
    openTroveEventEntry2.amount = borrowAmount
    openTroveEventEntry2.blockTime = event.block.timestamp.toI32()
    openTroveEventEntry2.blockNumber = event.block.number.toI32()
    openTroveEventEntry2.save()
    updateMarketStats(market.id, 'BORROW', borrowAmount)
    updateAccountStats(
      protocol.id,
      market.id,
      account.id,
      borrowAmount,
      openTroveEventEntry2.eventType,
    )
    return
  }

  // 'closeTrove' triggers both 'REPAY' and 'WITHDRAW', 2 events within one.
  // TODO: reformat code: can move this into a better spot / think about better code reformat.
  const acmOld = getOrCreateACM(account.id.concat('-').concat(market.id), account.id)
  const accountOldDebt = acmOld.borrowed
  const accountOldColl = acmOld.deposited

  if (operation == 'closeTrove') {
    //repay debt in full

    let eventId1 = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString())
      .concat('-')
      .concat('1')

    let closeTroveEventEntry1 = new Event(eventId1)
    // TODO: I wonder if 'CLOSE' is a good addition to this field.
    closeTroveEventEntry1.eventType = 'REPAY'

    closeTroveEventEntry1.market = market.id
    closeTroveEventEntry1.account = account.id
    closeTroveEventEntry1.blockTime = event.block.timestamp.toI32()
    closeTroveEventEntry1.blockNumber = event.block.number.toI32()
    closeTroveEventEntry1.amount = accountOldDebt
    closeTroveEventEntry1.save()
    updateMarketStats(market.id, closeTroveEventEntry1.eventType, accountOldDebt)
    updateAccountStats(
      protocol.id,
      market.id,
      account.id,
      accountOldDebt,
      closeTroveEventEntry1.eventType,
    )

    // second event within closeTrove() scenario
    let eventId2 = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString())
      .concat('-')
      .concat('2')
    let closeTroveEventEntry2 = new Event(eventId2)
    closeTroveEventEntry2.eventType = 'WITHDRAW'

    closeTroveEventEntry2.market = market.id
    closeTroveEventEntry2.account = account.id
    closeTroveEventEntry2.blockTime = event.block.timestamp.toI32()
    closeTroveEventEntry2.blockNumber = event.block.number.toI32()

    closeTroveEventEntry2.amount = accountOldColl
    closeTroveEventEntry2.save()
    updateMarketStats(market.id, closeTroveEventEntry2.eventType, accountOldColl)
    updateAccountStats(
      protocol.id,
      market.id,
      account.id,
      accountOldColl,
      closeTroveEventEntry2.eventType,
    )
    return
  }

  // get event entity id if not openTrove() or closeTrove() scenario, must be adjustTrove() scenario then
  let eventId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
  // generate new event entity
  let eventEntry = new Event(eventId)
  let changedAmount: BigDecimal

  // We have multiple scenarios: TODO: not sure if I should 'xTokenAmount' for LUSD, or just use 'Amount' in schema for collateral and debt
  // 1. addColl() where either account or SP send ETH to trove position. (collAmount > previousCollAmount)
  // 2. withdrawColl() where ETH is withdrawn from Trove. (collAmount < previousCollAmount)
  // 3. withdrawLUSD() where debt is increased, assuming normal mode here and fee is added. TODO: figure out how 'recovery' mode would be situated in this. (borrowAmount > previousDebt)
  // 4. repayLUSD() where specified amount of LUSD of borrower's trove is burnt. (borrowAmount < previousDebt)
  if (collAmount > accountOldColl) {
    eventEntry.eventType = 'DEPOSIT'
    // get the amount that will be recorded in the event entity.
    // the amount used in event entity will be used in updateMarketStats and updateAccountStats (acm, and acp, respectively).
    // TODO: figure out arithemtic for BigDecimals again
    changedAmount = collAmount - accountOldColl
  } else if (collAmount < accountOldColl) {
    eventEntry.eventType = 'WITHDRAW'
    changedAmount = accountOldColl - collAmount
  } else if (borrowAmount < accountOldDebt) {
    eventEntry.eventType = 'BORROW'
    changedAmount = accountOldDebt - borrowAmount
  }

  eventEntry.market = market.id
  eventEntry.account = account.id
  eventEntry.amount = changedAmount
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()
  updateMarketStats(market.id, eventEntry.eventType, changedAmount)
  updateAccountStats(protocol.id, market.id, account.id, changedAmount, eventEntry.eventType)
}

/* ========== HELPER FUNCTIONS ========== */

function createOrGetMarket(marketAddr: string): Market {
  let market = Market.load(marketAddr)

  if (market != null) return market

  let protocol = getProtocol('LIQUITY-ETHEREUM')

  market = new Market(marketAddr)

  let asset = getOrCreateEther(EthAddr)
  let LUSD = getOrCreateLUSD(LUSDAddr)

  market.name = asset.name
  market.protocol = protocol.id
  market.asset = asset.id
  market.collateralBackedAsset = LUSD.id
  market.symbol = LUSD.symbol
  market.deposited = zeroBD
  market.borrowed = zeroBD
  market.interestRateModelAddress = Address.empty()
  market.exchangeRate = EthToLUSD // TODO: If attainable from raw Event data or from contract getter, then connect it to that so we have the raw format
  market.collateralFactor = TCR_min // TODO: If attainable from raw Event data or from contract getter, then connect it to that so we have the raw format --> also, should this be 110% (aka 110) or 1.1 in the end? As well, should we have a TCR?
  market.stableInterestDebtToken = null
  market.variableInterestDebtToken = null
  market.liquidityRate = zeroInt
  market.stableBorrowRate = zeroInt
  market.variableBorrowRate = zeroInt
  market.liquidityIndex = zeroInt
  market.variableBorrowIndex = zeroInt

  market.save()
  return market
}

/* ========== TBD FUNCTIONS ========== */

// TODO: I think that capturing fees paid for a lending protocol is of interest in a lending protocol standard. For the purposes of our subgraph it is not important though.
export function handleLUSDBorrowingFeePaid(event: LUSDBorrowingFeePaid): void {}
