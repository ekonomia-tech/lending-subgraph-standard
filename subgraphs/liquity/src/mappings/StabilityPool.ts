import {
  UserDepositChanged,
  ETHGainWithdrawn,
  FrontEndRegistered,
  FrontEndTagSet,
} from '../../generated/StabilityPool/StabilityPool'

/* ========== EVENT HANDLERS ========== */

export function handleUserDepositChanged(event: UserDepositChanged): void {}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {}

export function handleFrontendRegistered(event: FrontEndRegistered): void {}

export function handleFrontendTagSet(event: FrontEndTagSet): void {}
