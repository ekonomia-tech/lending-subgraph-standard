// import { Event } from '../../generated/schema'

import {
  TroveUpdated,
  TroveLiquidated,
  Liquidation,
  Redemption,
  LTermsUpdated,
} from '../../generated/TroveManager/TroveManager'

/* ========== EVENT HANDLERS ========== */

export function handleTroveUpdated(event: TroveUpdated): void {}

export function handleTroveLiquidated(event: TroveLiquidated): void {}

export function handleLiquidation(event: Liquidation): void {}

export function handleRedemption(event: Redemption): void {}

export function handleLTermsUpdated(event: LTermsUpdated): void {}
