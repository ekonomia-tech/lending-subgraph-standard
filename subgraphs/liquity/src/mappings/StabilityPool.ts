import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'

import {
  UserDepositChanged,
  ETHGainWithdrawn,
  FrontEndRegistered,
  FrontEndTagSet,
} from '../../generated/StabilityPool/StabilityPool'

/**
 * @notice for subgraphv1, this only changes market and other high-level totals
 * @dev mapping mainly takes care of: keeping track of addresses that are obtaining liquidation rewards, accounts that are supporting the protocol. TODO: These are to be included in later versions of the lending subgraph standards.
 * Reasoning for delay: Liquidated troves result in the trove owner losing their collateral (~10%) and then that collateral bonus is given to SP contributors. The 'market' of the protocol as a whole loses that collateral bonus.
 * So keeping track of the market changes is important actually... so keeping track of total changes is important, but not necessarily the individual amounts being distributed to each SP contributor.
 * TODO: If the amount leaving the protocol (collateral) is signified by user-driven withdrawals of rewards from SP contributors... then I would possibly just have the market change whenever those events were emitted.
 */

/* ========== EVENT HANDLERS ========== */

export function handleUserDepositChanged(event: UserDepositChanged): void {}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {}

export function handleFrontendRegistered(event: FrontEndRegistered): void {}

export function handleFrontendTagSet(event: FrontEndTagSet): void {}
