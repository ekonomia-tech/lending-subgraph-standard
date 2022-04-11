import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { Asset, Market } from "../../generated/schema";
import { DAI_V1_ADDRESS } from "./generic";
import { getOrCreateProtocol } from "./protocol";


export function getOrCreateMarket(collateralAsset: Asset): Market {
    let market = Market.load(collateralAsset.id);
    if (market) {
        return market
    }

    let protocol = getOrCreateProtocol("MAKERDAO-ETHREUM");
    market = new Market(collateralAsset.id)
    market.collateralBackedAsset = DAI_V1_ADDRESS 
    market.protocol = protocol.id
    market.asset = collateralAsset.id
    market.name = collateralAsset.name
    market.symbol = collateralAsset.symbol
    market.deposited = BigDecimal.zero()
    market.borrowed = BigDecimal.zero()
    market.interestRateModelAddress = Address.empty()
    market.collateralFactor = BigDecimal.zero()
    market.exchangeRate = BigDecimal.zero()

    market.save();
    return market;
}