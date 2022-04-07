import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'

import {
  UserDepositChanged,
  ETHGainWithdrawn,
  FrontEndRegistered,
  FrontEndTagSet,
  BorrowerOperationsAddressChanged,
} from '../../generated/StabilityPool/StabilityPool'
import { getProtocol } from '../helpers/protocol'
import { Market } from '../../generated/schema'
import { getOrCreateLUSD, getOrCreateEther } from '../helpers/asset'
import { EthToLUSD, TCR_min, zeroBD, zeroInt, EthAddr, LUSDAddr } from '../helpers/generic'
/**
 * @notice for subgraphv1, this only changes market and other high-level totals
 * @dev mapping mainly takes care of: keeping track of addresses that are obtaining liquidation rewards, accounts that are supporting the protocol. TODO: These are to be included in later versions of the lending subgraph standards.
 * Reasoning for delay: Liquidated troves result in the trove owner losing their collateral (~10%) and then that collateral bonus is given to SP contributors. The 'market' of the protocol as a whole loses that collateral bonus.
 * So keeping track of the market changes is important actually... so keeping track of total changes is important, but not necessarily the individual amounts being distributed to each SP contributor.
 * TODO: If the amount leaving the protocol (collateral) is signified by user-driven withdrawals of rewards from SP contributors... then I would possibly just have the market change whenever those events were emitted.
 */

/* ========== EVENT HANDLERS ========== */

/**
 * @dev hardcoding in details here since we only have one market (ETHER = lendingAsset, LUSD = borrowAsset)
 * @param event ActivePoolAddressChanged
 */
export function handleBorrowerOperationsAddressChanged(
  event: BorrowerOperationsAddressChanged,
): void {
  // let protocol = getProtocol('LIQUITY-ETHEREUM')
  // let market = new Market(event.params._newBorrowerOperationsAddress.toHexString())
  // // let asset = getOrCreateAsset(event.params.asset.toHexString())
  // let asset = getOrCreateEther(EthAddr)
  // let LUSD = getOrCreateLUSD(LUSDAddr)
  // // log.info('ActivePoolAddressChangedCALLED: {}', ['YAYYYYY'])
  // market.name = asset.name
  // market.protocol = protocol.id
  // market.asset = asset.id
  // market.collateralBackedAsset = LUSD.id
  // market.symbol = LUSD.symbol
  // market.deposited = zeroBD
  // market.borrowed = zeroBD
  // market.interestRateModelAddress = Address.empty()
  // market.exchangeRate = EthToLUSD // TODO: If attainable from raw Event data or from contract getter, then connect it to that so we have the raw format
  // market.collateralFactor = TCR_min // TODO: If attainable from raw Event data or from contract getter, then connect it to that so we have the raw format --> also, should this be 110% (aka 110) or 1.1 in the end? As well, should we have a TCR?
  // market.stableInterestDebtToken = null
  // market.variableInterestDebtToken = null
  // market.liquidityRate = zeroInt
  // market.stableBorrowRate = zeroInt
  // market.variableBorrowRate = zeroInt
  // market.liquidityIndex = zeroInt
  // market.variableBorrowIndex = zeroInt
  // market.save()
}

export function handleUserDepositChanged(event: UserDepositChanged): void {}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {}

export function handleFrontendRegistered(event: FrontEndRegistered): void {}

export function handleFrontendTagSet(event: FrontEndTagSet): void {}
