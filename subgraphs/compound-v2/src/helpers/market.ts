import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/Comptroller/ERC20";
import { Market } from "../../generated/schema";
import { CToken } from "../../generated/templates/CToken/CToken";
import { getOrCreateAsset } from "./asset";
import { cETHAddress, daiAddress, unitrollerAddress, zeroBD } from "./generic";
import { addMarketToProtocol, getOrCreateProtocol } from "./protocol";

export function getOrCreateMarket(marketAddress: string): Market {
    let market = Market.load(marketAddress);
    if (market) {
        return market
    }
    
    let contract = CToken.bind(Address.fromString(marketAddress))
    let protocol = getOrCreateProtocol(unitrollerAddress);

    // It is CETH, which has a slightly different interface
    if (marketAddress == cETHAddress) {
      market = new Market(marketAddress)
      market.underlyingAddress = Address.fromString(
        '0x0000000000000000000000000000000000000000',
      )
      market.underlyingDecimals = 18
      market.underlyingName = 'Ether'
      market.underlyingSymbol = 'ETH'
      // It is all other CERC20 contracts
    } else {
      market = new Market(marketAddress)
      market.underlyingAddress = contract.underlying()
      let underlyingContract = ERC20.bind(market.underlyingAddress as Address)
      market.underlyingDecimals = underlyingContract.decimals()
      if (market.underlyingAddress.toHexString() != daiAddress) {
        market.underlyingName = underlyingContract.name()
        market.underlyingSymbol = underlyingContract.symbol()
      } else {
        market.underlyingName = 'Dai Stablecoin v1.0 (DAI)'
        market.underlyingSymbol = 'DAI'
      }
    }
  
    let interestRateModelAddress = contract.try_interestRateModel()

    let asset = getOrCreateAsset(
      market.underlyingAddress.toHexString(), 
      market.underlyingSymbol, 
      market.underlyingName, 
      market.underlyingDecimals
    )

    market.deposited = zeroBD
    market.borrowed = zeroBD
    market.collateralFactor = zeroBD
    market.exchangeRate = zeroBD
    market.interestRateModelAddress = interestRateModelAddress.reverted
      ? Address.fromString('0x0000000000000000000000000000000000000000')
      : interestRateModelAddress.value
    market.name = contract.name()
    market.symbol = contract.symbol()
    market.protocol = protocol.id
    market.asset = asset.id
    
    addMarketToProtocol(protocol.id, market.id)
    return market
}

export function updateMarketStats(marketId: string, eventType: string, amount: BigDecimal): void {
    let market = getOrCreateMarket(marketId)
    if (eventType === "DEPOSIT") {
        market.deposited.plus(amount)
    } else if (eventType === "WITHDRAW") {
        market.deposited.minus(amount)
    } else if (eventType === "BORROW") {
        market.borrowed.plus(amount)
    } else if (["REPAY", "LIQUIDAION"].includes(eventType)) {
        market.borrowed.minus(amount)
    }
    market.save()
}
