import { Market } from '../../generated/schema'
import { cauldron } from '../../generated/templates/cauldron/cauldron'
import { getOrCreateAsset } from '../../../aave-v3/src/helpers/asset';
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts';
import { getProtocol } from './protocol';

export function getOrCreateMarket(marketAddress: string): Market {
    let market = Market.load(marketAddress);
    if (market) {
        return market;
    }
    
    let protocol = getProtocol("ABRACADABRA-ETHEREUM")
    let deployedContract = cauldron.bind(Address.fromString(marketAddress));
    let collateral = deployedContract.collateral();
    let collateralAsset = getOrCreateAsset(collateral.toHexString());
    let MIMAsset = getOrCreateAsset(deployedContract.magicInternetMoney().toHexString());
    market = new Market(marketAddress)
    market.protocol = protocol.id
    market.name = collateralAsset.name
    market.asset = collateralAsset.id
    market.symbol = collateralAsset.symbol
    market.collateralBackedAsset = MIMAsset.id;
    market.deposited = BigDecimal.zero()
    market.borrowed = BigDecimal.zero()
    market.exchangeRate = deployedContract.exchangeRate().toBigDecimal()
    market.collateralFactor = BigDecimal.zero()
    market.interestRateModelAddress = Address.empty()

    market.save()
    return market
}


export function updateMarketStats(marketId: string, eventType: string, amount: BigDecimal): void {
    let market = getOrCreateMarket(marketId)
    if (eventType == "DEPOSIT") {
        market.deposited = market.deposited.plus(amount)
    } else if (eventType == "WITHDRAW") {
        market.deposited = market.deposited.minus(amount)
    } else if (eventType == "BORROW") {
        market.borrowed = market.borrowed.plus(amount)
    } else if (["REPAY", "LIQUIDATION"].includes(eventType)) {
        market.borrowed = market.borrowed.minus(amount)
    }
    market.save()
}