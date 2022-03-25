import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/Comptroller/ERC20";
import { Market } from "../../generated/schema";
import { CToken } from "../../generated/templates/CToken/CToken";
import { getOrCreateAsset } from "./asset";
import { CETH_ADDRESS , DAI_V1_ADDRESS , UNITROLLER_ADDRESS , zeroBD } from "./generic";
import { addMarketToProtocol, getOrCreateProtocol } from "./protocol";

export function getOrCreateMarket(marketAddress: string): Market {
    let market = Market.load(marketAddress);
    if (market) {
        return market
    }
    
    let contract = CToken.bind(Address.fromString(marketAddress))
    let protocol = getOrCreateProtocol(UNITROLLER_ADDRESS);
    let assetAddress: Address;
    let assetSymbol: string
    let assetName: string
    let assetDecimals: i32


    // It is CETH, which has a slightly different interface
    if (marketAddress == CETH_ADDRESS ) {
      market = new Market(marketAddress.toString())
      assetAddress = Address.fromString(
        '0x0000000000000000000000000000000000000000',
      )
      assetDecimals = 18
      assetName = 'Ether'
      assetSymbol = 'ETH'
      // It is all other CERC20 contracts
    } else {
      market = new Market(marketAddress)
      assetAddress = contract.underlying()
      let underlyingContract = ERC20.bind(assetAddress as Address)
      assetDecimals = underlyingContract.decimals()
      if (assetAddress.toHexString() != DAI_V1_ADDRESS) {
        assetName = underlyingContract.name()
        assetSymbol = underlyingContract.symbol()
      } else {
        assetName = 'Dai Stablecoin v1.0 (DAI)'
        assetSymbol = 'DAI'
      }
    }
  
    let interestRateModelAddress = contract.try_interestRateModel()

    let asset = getOrCreateAsset(assetAddress.toHexString());
    asset.name = assetName
    asset.symbol = assetSymbol
    asset.decimals = assetDecimals
    asset.save()

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
    market.collateralBackedAsset = null
    market.save()
    
    return market
}

export function updateMarketStats(marketId: string, eventType: string, amount: BigDecimal): void {
    let market = getOrCreateMarket(marketId)
    if (eventType == "DEPOSIT") {
        market.deposited.plus(amount)
    } else if (eventType == "WITHDRAW") {
        market.deposited.minus(amount)
    } else if (eventType == "BORROW") {
        market.borrowed.plus(amount)
    } else if (["REPAY", "LIQUIDATION"].includes(eventType)) {
        market.borrowed.minus(amount)
    }
    market.save()
}
