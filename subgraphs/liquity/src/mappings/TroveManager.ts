import {
  TroveUpdated,
  TroveLiquidated,
  Liquidation,
  Redemption,
  LTermsUpdated,
} from '../../generated/TroveManager/TroveManager'
import { Event, Market } from '../../generated/schema'
import { updateMarketStats } from '../helpers/market'

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
import { getProtocol } from '../helpers/protocol'
import { getOrCreateAccount, updateAccountStats, addToLiquidationCount } from '../helpers/account'
import { getOrCreateLUSD, getOrCreateEther } from '../helpers/asset'
import { getTroveOperationFromBorrowerOperation } from '../helpers/TroveOperation'
import { Address } from '@graphprotocol/graph-ts'

/**
 * @title TroveManager.ts
 * @notice this is the mapping that queries details from TroveManager.sol, the smart contract within Liquity protocol that handles liquidations and redemptions.
 */

/* ========== EVENT HANDLERS ========== */

//    event TroveUpdated(address indexed _borrower, uint _debt, uint _coll, uint _stake, TroveManagerOperation _operation);

export function handleTroveUpdated(event: TroveUpdated): void {}

/**
 * @notice handles scenarios where: trove is liquidated individually, through batch liquidation.
 * @param event TroveLiquidated
 * @dev  official event details:     event TroveLiquidated(address indexed _borrower, uint _debt, uint _coll, TroveManagerOperation _operation);
 */
export function handleTroveLiquidated(event: TroveLiquidated): void {
  let market = createOrGetMarket(LiquityBorrowerOpsAddr)
  let protocol = getProtocol(market.protocol)
  let asset = getOrCreateLUSD(market.collateralBackedAsset)
  let account = getOrCreateAccount(event.params._borrower.toHexString())
  let operation = getTroveOperationFromBorrowerOperation(event.params._operation)
  let collateralAsset = getOrCreateEther(EthAddr)

  addToLiquidationCount(account, true)
  // addToLiquidationCount(liquidator, false) TODO: figure out how to get liquidator (likely callHandler that is separate)
  let repayId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

  let LiquidateAmount = event.params._debt
    .toBigDecimal()
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

  let liquidatedCollateralAmount = event.params._coll
    .toBigDecimal()
    .div(exponentToBigDecimal(collateralAsset.decimals))
    .truncate(collateralAsset.decimals)

  let eventEntry = new Event(repayId)
  eventEntry.eventType = 'LIQUIDATION'
  eventEntry.market = market.id
  eventEntry.account = account.id
  // eventEntry.liquidator = liquidator.id
  eventEntry.xTokenAmount = liquidatedCollateralAmount // TODO: not sure if I should have this in here or not in accordance to schema
  eventEntry.amount = LiquidateAmount
  eventEntry.blockTime = event.block.timestamp.toI32()
  eventEntry.blockNumber = event.block.number.toI32()
  eventEntry.save()

  updateMarketStats(market.id, 'LIQUIDATION', LiquidateAmount)
  updateAccountStats(protocol.id, market.id, account.id, LiquidateAmount, eventEntry.eventType)
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

export function handleLTermsUpdated(event: LTermsUpdated): void {}

/**
 *
 * @param event Liquidation
 *  * @dev  official event details: event Liquidation(uint _liquidatedDebt, uint _liquidatedColl, uint _collGasCompensation, uint _LUSDGasCompensation);
 */
export function handleLiquidation(event: Liquidation): void {}

/**
 *
 * @param event Redemption
 *  * @dev  official event details: event Redemption(uint _attemptedLUSDAmount, uint _actualLUSDAmount, uint _ETHSent, uint _ETHFee);
 *  NOTES:
 * - when redemptions are called, there is an TroveUpdated emitted when the Trove is closed, and also when it is just adjusted.
 * - Thus, redemptions are just extra functions unique to the Liquity protocol when it comes to considering them within the scope of standardized lending protocols!
 */
export function handleRedemption(event: Redemption): void {}
