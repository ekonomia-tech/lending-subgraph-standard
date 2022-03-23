
import { Account, Asset, Market, Protocol } from "../generated/schema";
import { CToken } from "../generated/templates/CToken/CToken";
import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/templates/CToken/ERC20";

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = 0; i < decimals; i++) {
      bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
  }

export let zeroBD = BigDecimal.fromString('0')
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)
export let cTokenDecimalsBD: BigDecimal = exponentToBigDecimal(8)
export let cTokenDecimals = 8

export const unitrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
export const cUSDCAddress = '0x39aa39c021dfbae8fac545936693ac917d5e7563'
export const cETHAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
export const daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'


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
    return market
  }

export function getOrCreateProtocol(protocolId: string): Protocol {
    let protocol = Protocol.load(protocolId);
    if (!protocol) {
        protocol = new Protocol(protocolId)
        protocol.network = "ETHEREUM"
        protocol.type = "POOLED"
        protocol.priceOracle = null
        protocol.closeFactor = null
        protocol.maxAssets = null
    }
    return protocol;
}

export function generateId(event: any): string {
    return event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
}

export function getOrCreateAccount(accountId: string): Account {
    let account = Account.load(accountId);
    if (!account) {
      account = new Account(accountId)
    }
    return account;
}

export function getOrCreateAsset(assetId: string, symbol: string, name: string, decimals: number): Asset {
  let asset = Asset.load(assetId);
  if (asset) {
    return asset
  }
  asset = new Asset(assetId)
  asset.symbol = symbol
  asset.name = name
  asset.decimals = decimals
  return asset;
}

export function markAccountAsBorrowed(accountId: string): void {
  let account = getOrCreateAccount(accountId);
  account.hasBorrowed = true;
  account.save()
}

export function AddToLiquidationCount(accountId: string, isLiquidated: Boolean): void {
  let account = getOrCreateAccount(accountId)
  if (isLiquidated) {
    account.liquidatedCount += 1
  } else {
    account.liquidatingCount += 1
  }
  account.save()
}