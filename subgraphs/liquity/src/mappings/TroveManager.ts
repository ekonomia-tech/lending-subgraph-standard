// import { Event } from '../../generated/schema'
import { ethereum, Address, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'
import {
  TroveUpdated,
  TroveLiquidated,
  Liquidation,
  Redemption,
  LTermsUpdated,
} from '../../generated/TroveManager/TroveManager'
import { getProtocol } from '../helpers/protocol'
import { Market } from '../../generated/schema'
import { getOrCreateLUSD, getOrCreateEther } from '../helpers/asset'
import { EthToLUSD, TCR_min, zeroBD, zeroInt, EthAddr, LUSDAddr } from '../helpers/generic'
/**
 * @notice for subgraphv1, this only changes market and other high-level totals
/*

/* ========== EVENT HANDLERS ========== */

export function handleTroveUpdated(event: TroveUpdated): void {}

export function handleTroveLiquidated(event: TroveLiquidated): void {}

export function handleLiquidation(event: Liquidation): void {}

export function handleRedemption(event: Redemption): void {}

export function handleLTermsUpdated(event: LTermsUpdated): void {}
