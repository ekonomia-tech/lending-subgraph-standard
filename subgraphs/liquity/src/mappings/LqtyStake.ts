import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'

import { StakeChanged, StakingGainsWithdrawn } from '../../generated/LQTYStaking/LQTYStaking'

/* ========== EVENT HANDLERS ========== */

export function handleStakeChanged(event: StakeChanged): void {}

export function handleStakeGainsWithdrawn(event: StakingGainsWithdrawn): void {}
