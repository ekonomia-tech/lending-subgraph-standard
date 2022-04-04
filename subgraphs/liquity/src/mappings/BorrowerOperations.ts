import { ethereum, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Market } from '../../generated/schema'
import { getOrCreateAsset, getOrCreateEther } from '../helpers/asset'
import {
  TroveUpdated,
  LUSDBorrowingFeePaid,
  TroveManagerAddressChanged,
  ActivePoolAddressChanged,
} from '../../generated/BorrowerOperations/BorrowerOperations'
import { createProtocol, getProtocol } from '../helpers/protocol'
import { EthToLUSD, TCR_min, zeroBD, zeroInt } from '../helpers/generic'

/* ========== EVENT HANDLERS ========== */

/**
 * @dev this could be from other liquity deployed contracts, but either way the params (contract addresses) are immutable no matter what contract and event you query from.
 * @param event TroveManagerAdddressChanged
 */
export function handleTroveManagerAddressChanged(event: TroveManagerAddressChanged): void {
  createProtocol(event.params._newTroveManagerAddress, 'LIQUITY')
}

/**
 * @dev hardcoding in details here since we only have one market (ETHER = lendingAsset, LUSD = borrowAsset)
 * @param event ActivePoolAddressChanged
 */
export function handleActivePoolAddressChanged(event: ActivePoolAddressChanged): void {
  let protocol = getProtocol('LIQUITY-ETHEREUM')
  let market = new Market(event.params._activePoolAddress.toHexString())
  // let asset = getOrCreateAsset(event.params.asset.toHexString())
  let asset = getOrCreateEther('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
  let LUSD = getOrCreateAsset('0x5f98805A4E8be255a32880FDeC7F6728C6568bA0')
  market.name = asset.name
  market.protocol = protocol.id
  market.asset = asset.id
  market.collateralBackedAsset = LUSD.id
  market.symbol = asset.symbol
  market.deposited = zeroBD
  market.borrowed = zeroBD
  market.interestRateModelAddress = null //may need to be zeroAdress
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
}
