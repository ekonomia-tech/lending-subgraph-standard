import { ethereum, Address, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
import { Event } from '../../generated/schema'
import { Market } from '../../generated/schema'
import { getOrCreateLUSD, getOrCreateEther } from '../helpers/asset'
import {
  TroveUpdated,
  LUSDBorrowingFeePaid,
  TroveManagerAddressChanged,
} from '../../generated/BorrowerOperations/BorrowerOperations'
import {
  addToLiquidationCount,
  getOrCreateAccount,
  markAccountAsBorrowed,
  updateAccountStats,
} from '../helpers/account'
import { getMarket, updateMarketStats } from '../helpers/market'
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
 * @dev     event TroveUpdated(address indexed _borrower, uint _debt, uint _coll, uint stake, BorrowerOperation operation);
 */
export function handleTroveUpdated(event: TroveUpdated): void {
  /**
   * @dev General things that have to be updated no matter what the TroveUpdate
   * market, protocol, asset, account, event. These things are used to update everything that is cookie-cutter with the basics of a lending position. topup, withdraw, increase loan, repay.
   */
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

  // get event entity id if not openTrove() scenario
  let eventId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
  // generate new event entity
  let eventEntry = new Event(eventId)
  if (operation == 'closeTrove') {
    //repay debt in full
    //TroveUpdate has the updated values for the now closed trove I would assume in full.
    // TODO: double check that it is in full, or if GAS COMPENSATION isn't factored here but factored elsewhere.
    // Assuming it's in full, then I just need to update MarketStats() with the full delta, which in this case is just the total amounts
    // updateAccountStats with just the full amounts too.

    // TODO: I wonder if 'CLOSE' is a good addition to this field.
    eventEntry.eventType = 'REPAY'
  }
  // must be adjustTrove, and Trove must exist or else this event wouldn't be emitted I believe. TODO: confirm that.
  // TODO: Also need to figure out how to discern which scenario it is within the AdjustTrove() event emission... we may need to bind to the contract to read the function _adjustTrove(). It will cause significant time usage in sync.
  // TODO: Could go about it and:
  // 1. Load the account, check to see if certain trove details have changed... if trove.debt != event.params.debt, then we know that more LUSD was withdrawn.
  if ('Insert check if it is addColl(), withdrawColl(), WithdrawLUSD(), repayLUSD()') {
  }
  // update event happens every time. Only difference is those highlighted below
  eventEntry.market = market.id
  eventEntry.account = account.id
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  // different and likely belongs in their own respective if statements.
  eventEntry.amount = borrowAmount
  eventEntry.borrowRate = event.params.borrowRate
  eventEntry.interestRateMode = event.params.borrowRateMode.toI32()
  eventEntry.save()
  updateMarketStats(market.id, eventEntry.eventType, borrowAmount)
  updateAccountStats(protocol.id, market.id, account.id, borrowAmount, eventEntry.eventType)
  /**
   * @dev This is the addColl()) scenario
   */
  /**
   * @dev This is the withdrawColl() scenario
   */
  /**
   * @dev this is the withdrawLUSD() scenario
   */
  /**
   * @dev this is the repayLUSD() scenario
   */
  /**
   * @dev This is the closeTrove() scenario
   * TroveUpdated emitted before the actual LUSD is moved from the msg.sender, decreased in the ActivePool contract, and burnt.
   */
}

export function handleLUSDBorrowingFeePaid(event: LUSDBorrowingFeePaid): void {}

function createOrGetMarket(marketAddr: string): Market {
  let market = Market.load(marketAddr)

  if (market != null) return market

  let protocol = getProtocol('LIQUITY-ETHEREUM')

  market = new Market(marketAddr)
  // let asset = getOrCreateAsset(event.params.asset.toHexString())
  let asset = getOrCreateEther(EthAddr)
  let LUSD = getOrCreateLUSD(LUSDAddr)
  // log.info('ActivePoolAddressChangedCALLED: {}', ['YAYYYYY'])

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

// export function createOrGetNFT(tokenId: string, nftValue: BigInt): NFT {
//   let nft = NFT.load(tokenId)
//   if (nft != null) return nft

//   nft = new NFT(tokenId)
//   // obtain nft fields throughs calculating off of encoded value
//   nft.value = nftValue
//   nft.mass = (nftValue % CLASS_MULTIPLIER) as BigInt
//   const bigIntTier: BigInt = nftValue / CLASS_MULTIPLIER
//   const tier = checkMergeClass(bigIntTier)
//   nft.tier = tier
//   nft.color = checkColor(tier)
//   nft.isAlpha = false
//   nft.mergeCount = 0
//   nft.save()

//   return nft
// }
