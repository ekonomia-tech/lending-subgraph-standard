import {
  UserDepositChanged,
  ETHGainWithdrawn,
  FrontEndRegistered,
  FrontEndTagSet,
  BorrowerOperationsAddressChanged,
} from '../../generated/StabilityPool/StabilityPool'

/**
 * @dev TODO: include this in future parts of the subgraph possibly. Not pertinent to the scope of this version.
 */

/* ========== TBD FUNCTIONS ========== */

/**
 * @dev hardcoding in details here since we only have one market (ETHER = lendingAsset, LUSD = borrowAsset)
 * @param event ActivePoolAddressChanged
 */
export function handleBorrowerOperationsAddressChanged(
  event: BorrowerOperationsAddressChanged,
): void {}

export function handleUserDepositChanged(event: UserDepositChanged): void {}

export function handleETHGainWithdrawn(event: ETHGainWithdrawn): void {}

export function handleFrontendRegistered(event: FrontEndRegistered): void {}

export function handleFrontendTagSet(event: FrontEndTagSet): void {}
