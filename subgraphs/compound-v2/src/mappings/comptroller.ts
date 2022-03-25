import { MarketEntered, MarketExited, MarketListed, NewCloseFactor, NewCollateralFactor, NewLiquidationIncentive, NewMaxAssets, NewPriceOracle } from "../../generated/Comptroller/Comptroller"
import { CToken } from "../../generated/templates"
import { getOrCreateAccount, getOrCreateAccountInMarket, getOrCreateAccountInProtocol } from "../helpers/account"
import { mantissaFactorBD  } from "../helpers/generic"
import { getOrCreateMarket } from "../helpers/market"
import { getOrCreateProtocol } from "../helpers/protocol"

export function handleMarketListed(event: MarketListed): void {
    // Dynamically index all new listed tokens
    CToken.create(event.params.cToken)
    // Create the market for this token, since it's now been listed.
    let market = getOrCreateMarket(event.params.cToken.toHexString())
}

export function handleMarketEntered(event: MarketEntered): void {
    let market = getOrCreateMarket(event.params.cToken.toHexString())
    let account = getOrCreateAccount(event.params.account.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    getOrCreateAccountInProtocol(protocol.id, account.id)
    getOrCreateAccountInMarket(market.id, account.id)
}

export function handleMarketExited(event: MarketExited): void {}

export function handleNewPriceOracle(event: NewPriceOracle): void {
    let protocol = getOrCreateProtocol(event.address.toHexString())
    // This is the first event used in this mapping, so we use it to create the entity
    protocol.priceOracle = event.params.newPriceOracle
    protocol.save()
}

export function handleNewMaxAssets(event: NewMaxAssets): void {
    let protocol = getOrCreateProtocol(event.address.toHexString())
    protocol.maxAssets = event.params.newMaxAssets
    protocol.save()
}

export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
    let protocol = getOrCreateProtocol(event.address.toHexString())
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

export function handleNewCloseFactor(event: NewCloseFactor): void {
    let protocol = getOrCreateProtocol(event.address.toHexString()) 
    protocol.closeFactor = event.params.newCloseFactorMantissa
    protocol.save()
  }