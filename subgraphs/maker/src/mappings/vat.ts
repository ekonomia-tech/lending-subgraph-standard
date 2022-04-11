import { Market } from '../../generated/schema';
import { LogNote } from '../../generated/Vat/Vat'
import { getOrCreateAsset } from '../helpers/asset'
import { getOrCreateProtocol } from '../helpers/protocol';
import { DAI_V1_ADDRESS } from '../helpers/generic'
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { getOrCreateMarket } from '../helpers/market';

export function handleInitCollateralVault(event: LogNote): void {
    log.warning("Args: {}, {}, {}", [event.params.arg1.toString(), event.params.arg2.toString(), event.params.arg3.toString()])
    // let collateralAsset = getOrCreateAsset(event.params.arg1.toString())
    // let market = getOrCreateMarket(collateralAsset)
    // log.warning("Market created. Asset: {}", [collateralAsset.name])
}