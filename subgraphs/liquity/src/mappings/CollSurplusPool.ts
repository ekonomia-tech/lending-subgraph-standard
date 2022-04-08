import { CollBalanceUpdated } from '../../generated/CollSurplusPool/CollSurplusPool'

/** 
 * @dev TODO: include this in future parts of the subgraph possibly. Not pertinent to the scope of this version.
@dev Details about contract: - Holds ETH surplus from Troves that were redeemed against. These will go back to the respective owning borrower when told to do so from BorrowerOperations.sol
- Also holds ETH surplus from Troves with ICR > MCR that were liquidated in Recovery Mode.
*/

/* ========== EVENT HANDLERS ========== */

export function handleCollSurplusBalanceUpdated(event: CollBalanceUpdated): void {}
