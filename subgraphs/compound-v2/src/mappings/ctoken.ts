import { AccrueInterest, Borrow, LiquidateBorrow, Mint, NewMarketInterestRateModel, NewReserveFactor, Redeem, RepayBorrow, Transfer } from "../../generated/Comptroller/CToken";
import { Event } from "../../generated/schema";
import { addToLiquidationCount, getOrCreateAccount, markAccountAsBorrowed, updateAccountStats } from "../helpers/account";
import { getOrCreateAsset } from "../helpers/asset";
import { cTokenDecimals, cTokenDecimalsBD, exponentToBigDecimal } from "../helpers/generic";
import { getOrCreateMarket, updateMarketStats } from "../helpers/market";
import { getOrCreateProtocol } from "../helpers/protocol";

export function handleMint(event: Mint): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.minter.toHexString())
    let mintId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

    let cTokenAmount = event.params.mintTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)

    let underlyingAmount = event.params.mintAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(asset.decimals))
        .truncate(asset.decimals)
    
    let eventEntry = new Event(mintId)
    eventEntry.eventType = "DEPOSIT"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.amount = underlyingAmount
    eventEntry.xTokenAmount = cTokenAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save()

    updateMarketStats(market.id, eventEntry.eventType, underlyingAmount)
    updateAccountStats(protocol.id, market.id, account.id, underlyingAmount, eventEntry.eventType)
}   


export function handleRedeem(event: Redeem): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.redeemer.toHexString())
    let redeemId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())
    
    let cTokenAmount = event.params.redeemTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)

    let underlyingAmount = event.params.redeemAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(asset.decimals))
        .truncate(asset.decimals)

    let eventEntry = new Event(redeemId)
    eventEntry.eventType = "WITHDRAW"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.amount = underlyingAmount
    eventEntry.xTokenAmount = cTokenAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateMarketStats(market.id, eventEntry.eventType, underlyingAmount)
    updateAccountStats(protocol.id, market.id, account.id, underlyingAmount, eventEntry.eventType)
}

export function handleBorrow(event: Borrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let borrowId = event.transaction.hash
    .toHexString()
    .concat('-')
    .concat(event.transactionLogIndex.toString())

    markAccountAsBorrowed(account.id)

    let underlyingAmount = event.params.borrowAmount
    .toBigDecimal()
    .div(exponentToBigDecimal(asset.decimals))
    .truncate(asset.decimals)

    let eventEntry = new Event(borrowId)
    eventEntry.protocol = protocol.id
    eventEntry.eventType = "BORROW"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.amount = underlyingAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateMarketStats(market.id, eventEntry.eventType, underlyingAmount)
    updateAccountStats(protocol.id, market.id, account.id, underlyingAmount, eventEntry.eventType)
}


export function handleRepayBorrow(event: RepayBorrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let repayer = getOrCreateAccount(event.params.payer.toHexString())
    let repayId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let underlyingAmount = event.params.repayAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(asset.decimals))
        .truncate(asset.decimals)

    let eventEntry = new Event(repayId)
    eventEntry.protocol = protocol.id
    eventEntry.eventType = "REPAY"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.payer = repayer.id
    eventEntry.amount = underlyingAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateMarketStats(market.id, eventEntry.eventType, underlyingAmount)
    updateAccountStats(protocol.id, market.id, account.id, underlyingAmount, eventEntry.eventType)
}


export function handleLiquidateBorrow(event: LiquidateBorrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let liquidator = getOrCreateAccount(event.params.liquidator.toHexString())
    let liquidationId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    addToLiquidationCount(account.id, true)
    addToLiquidationCount(liquidator.id, false)

    let cTokenAmount = event.params.seizeTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)
    let underlyingAmount = event.params.repayAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(asset.decimals))
        .truncate(asset.decimals)

    let eventEntry = new Event(liquidationId)
    eventEntry.protocol = protocol.id
    eventEntry.eventType = "LIQUIDATION"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.amount = underlyingAmount
    eventEntry.liquidator = liquidator.id
    eventEntry.xTokenAmount = cTokenAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    
    eventEntry.save()

    updateMarketStats(market.id, eventEntry.eventType, underlyingAmount)
    updateAccountStats(protocol.id, market.id, account.id, underlyingAmount, eventEntry.eventType)
}


export function handleTransfer(event: Transfer): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.from.toHexString())
    let to = getOrCreateAccount(event.params.to.toHexString())
    let transferId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())
    
    let transferAmount = event.params.amount
        .toBigDecimal()
        .div(cTokenDecimalsBD)
    
    let underlyingAmount = market.exchangeRate
    .times(transferAmount
        .truncate(asset.decimals)
    )

    let eventEntry = new Event(transferId)
    eventEntry.protocol = protocol.id
    eventEntry.eventType = "TRANSFER"
    eventEntry.market = market.id
    eventEntry.protocol = protocol.id
    eventEntry.account = account.id
    eventEntry.to = to.id
    eventEntry.amount = underlyingAmount
    eventEntry.xTokenAmount = transferAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    
    eventEntry.save()
}

export function handleAccrueInterest(event: AccrueInterest): void {}

export function handleNewReserveFactor(event: NewReserveFactor): void {}

export function handleNewMarketInterestRateModel(event: NewMarketInterestRateModel): void {}