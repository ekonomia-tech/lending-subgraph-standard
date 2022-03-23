import { MarketListed, NewCollateralFactor, NewLiquidationIncentive, NewMaxAssets, NewPriceOracle } from "../../generated/Comptroller/Comptroller"
import { Protocol } from "../../generated/schema"
import { CToken } from "../../generated/templates"
import { getOrCreateMarket, getOrCreateProtocol, mantissaFactorBD, unitrollerAddress } from "../helpers"


export function handleMarketListed(event: MarketListed): void {
    // Dynamically index all new listed tokens
    CToken.create(event.params.cToken)
    // Create the market for this token, since it's now been listed.
    let market = getOrCreateMarket(event.params.cToken.toHexString())
    market.save()
}

export function handleNewPriceOracle(event: NewPriceOracle): void {
    let protocol = getOrCreateProtocol(unitrollerAddress)
    // This is the first event used in this mapping, so we use it to create the entity
    protocol.priceOracle = event.params.newPriceOracle
    protocol.save()
}

export function handleNewMaxAssets(event: NewMaxAssets): void {
    let protocol = Protocol.load(unitrollerAddress)
    protocol.maxAssets = event.params.newMaxAssets
    protocol.save()
}

export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
    let protocol = Protocol.load(unitrollerAddress)
    protocol.liquidationIncentive = event.params.newLiquidationIncentiveMantissa
    protocol.save()
}

export function handleNewCollateralFactor(event: NewCollateralFactor): void {
    let market = getOrCreateMarket(event.params.cToken.toHexString())
    market.collateralFactor = event.params.newCollateralFactorMantissa
    .toBigDecimal()
    .div(mantissaFactorBD)
    market.save()

}