import { Borrow, LiquidateBorrow, Mint, Redeem, RepayBorrow, Transfer } from "../../generated/Comptroller/CToken";
import { Event } from "../../generated/schema";
import { AddToLiquidationCount, cTokenDecimals, cTokenDecimalsBD, exponentToBigDecimal, generateId, getOrCreateAccount, getOrCreateMarket, getOrCreateProtocol, markAccountAsBorrowed } from "../helpers";

export function handleMint(event: Mint): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.minter.toHexString())
    let mintId = generateId(event)

    let cTokenAmount = event.params.mintTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)

    let underlyingAmount = event.params.mintAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(market.underlyingDecimals))
        .truncate(market.underlyingDecimals)

    let mintEvent = new Event(mintId)
    mintEvent.eventType = "MINT"
    mintEvent.market = market.id
    mintEvent.protocol = protocol.id
    mintEvent.account = account.id
    mintEvent.amount = cTokenAmount
    mintEvent.underlyingAmount = underlyingAmount
    mintEvent.blockTime = event.block.timestamp.toI32()
    mintEvent.save()
}   


export function handleRedeem(event: Redeem): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.redeemer.toHexString())
    let redeemId = generateId(event)
    
    let cTokenAmount = event.params.redeemTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)

    let underlyingAmount = event.params.redeemAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(market.underlyingDecimals))
        .truncate(market.underlyingDecimals)

    let redeemEvent = new Event(redeemId)
    redeemEvent.eventType = "WITHDRAW"
    redeemEvent.market = market.id
    redeemEvent.protocol = protocol.id
    redeemEvent.account = account.id
    redeemEvent.amount = cTokenAmount
    redeemEvent.underlyingAmount = underlyingAmount
    redeemEvent.blockTime = event.block.timestamp.toI32()

    redeemEvent.save()
}

export function handleBorrow(event: Borrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let borrowId = generateId(event)

    markAccountAsBorrowed(account.id)

    let borrowAmount = event.params.borrowAmount
    .toBigDecimal()
    .div(exponentToBigDecimal(market.underlyingDecimals))
    .truncate(market.underlyingDecimals)

    let borrowEvent = new Event(borrowId)
    borrowEvent.protocol = protocol.id
    borrowEvent.eventType = "BORROW"
    borrowEvent.market = market.id
    borrowEvent.protocol = protocol.id
    borrowEvent.account = account.id
    borrowEvent.amount = borrowAmount
    borrowEvent.blockTime = event.block.timestamp.toI32()

    borrowEvent.save()
}


export function handleRepay(event: RepayBorrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let repayer = getOrCreateAccount(event.params.payer.toHexString())
    let repayId = generateId(event)

    let repayAmount = event.params.repayAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(market.underlyingDecimals))
        .truncate(market.underlyingDecimals)

    let repayEvent = new Event(repayId)
    repayEvent.protocol = protocol.id
    repayEvent.eventType = "REPAY"
    repayEvent.market = market.id
    repayEvent.protocol = protocol.id
    repayEvent.account = account.id
    repayEvent.payer = repayer.id
    repayEvent.amount = repayAmount
    repayEvent.blockTime = event.block.timestamp.toI32()

    repayEvent.save()
}


export function handleLiquidate(event: LiquidateBorrow): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.borrower.toHexString())
    let liquidator = getOrCreateAccount(event.params.liquidator.toHexString())
    let liquidationId = generateId(event)

    AddToLiquidationCount(account.id, true)
    AddToLiquidationCount(liquidator.id, false)

    let cTokenAmount = event.params.seizeTokens
        .toBigDecimal()
        .div(cTokenDecimalsBD)
        .truncate(cTokenDecimals)
    let underlyingRepayAmount = event.params.repayAmount
        .toBigDecimal()
        .div(exponentToBigDecimal(market.underlyingDecimals))
        .truncate(market.underlyingDecimals)

    let liquidationEvent = new Event(liquidationId)
    liquidationEvent.protocol = protocol.id
    liquidationEvent.eventType = "LIQUIDATION"
    liquidationEvent.market = market.id
    liquidationEvent.protocol = protocol.id
    liquidationEvent.account = account.id
    liquidationEvent.amount = cTokenAmount
    liquidationEvent.liquidator = liquidator.id
    liquidationEvent.underlyingAmount = underlyingRepayAmount
    liquidationEvent.blockTime = event.block.timestamp.toI32()

    liquidationEvent.save()
}


export function handleTransfer(event: Transfer): void {
    let market = getOrCreateMarket(event.address.toHexString())
    let protocol = getOrCreateProtocol(market.protocol)
    let account = getOrCreateAccount(event.params.from.toHexString())
    let to = getOrCreateAccount(event.params.to.toHexString())
    let transferId = generateId(event)
    let amountUnderlying = market.exchangeRate.times(
        event.params.amount
            .toBigDecimal()
            .div(cTokenDecimalsBD)
    )

    let transferAmount = event.params.amount
        .toBigDecimal()
        .div(cTokenDecimalsBD)
    
    let amountUnderlyingTruncated = amountUnderlying.truncate(market.underlyingDecimals)
    
    let transferEvent = new Event(transferId)
    transferEvent.protocol = protocol.id
    transferEvent.eventType = "TRANSFER"
    transferEvent.market = market.id
    transferEvent.protocol = protocol.id
    transferEvent.account = account.id
    transferEvent.to = to.id
    transferEvent.amount = transferAmount
    transferEvent.underlyingAmount = amountUnderlying
    transferEvent.blockTime = event.block.timestamp.toI32()

    transferEvent.save()
}