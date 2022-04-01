import { BigInt, log } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/DegenBox/ERC20';
import { Event } from '../../generated/schema';
import { DegenBox } from '../../generated/degenbox/degenbox';
import { LogAddCollateral, LogBorrow, LogRemoveCollateral, LogRepay, cauldron } from '../../generated/templates/cauldron/cauldron'
import { getOrCreateAccount, updateAccountStats } from '../helpers/account';
import { getOrCreateAsset } from '../helpers/asset';
import { getOrCreateMarket, updateMarketStats } from '../helpers/market'
import { exponentToBigDecimal } from '../helpers/generic'

const EIGHTEEN_DECIMALS = BigInt.fromI32(10).pow(18).toBigDecimal()

export function handleLogBorrow(event: LogBorrow): void {
    let market = getOrCreateMarket(event.address.toHexString())

    let account = getOrCreateAccount(event.params.to.toHexString()) 
    let borrowedAmount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS);

    let borrowId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(borrowId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = "BORROW"
    eventEntry.account = account.id
    eventEntry.amount = borrowedAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateAccountStats(market.protocol, market.id, account.id, borrowedAmount, "BORROW")
    updateMarketStats(market.id, "BORROW", borrowedAmount)
}

export function handleLogRepay(event: LogRepay): void {

    log.warning("Repayment/Liquidation: amount: {}, part: {}", [event.params.amount.toString(), event.params.part.toString()])
    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let invoker = getOrCreateAccount(event.params.from.toHexString())
    let account = getOrCreateAccount(event.params.to.toHexString()) 
    
    // Check if this is a repayment or a liquidation
    // let isLiquidation = [invoker.id, market.id].indexOf(account.id) == -1
    // Keep false until as actual liquidation is being logged in the handleLogRemoveCollateral that is beig called on liquidation
    let isLiquidation = false

    let amount = event.params.amount
        .divDecimal(exponentToBigDecimal(asset.decimals))

    let repayId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(repayId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    
    // If the user receiving the amount is not the one that invoked that repayment, the action is liquidation
    eventEntry.eventType = isLiquidation ? "LIQUIDATION" : "REPAY"
    eventEntry.liquidator = isLiquidation ? invoker.id : null

    eventEntry.account = account.id
    eventEntry.amount = amount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateAccountStats(market.protocol, market.id, account.id, amount, eventEntry.eventType)
    updateMarketStats(market.id, eventEntry.eventType, amount)

}

export function handleLogAddCollateral(event: LogAddCollateral): void {
    log.warning("Add Collateral: share: {}", [event.params.share.toString()])

    const deployedCauldron = cauldron.bind(event.address)
    const collateral = deployedCauldron.collateral()
    const deployedErc = ERC20.bind(collateral)

    let market = getOrCreateMarket(event.address.toHexString())
    let asset = getOrCreateAsset(market.asset)
    let account = getOrCreateAccount(event.params.from.toHexString()) 
    let to = getOrCreateAccount(event.params.to.toHexString());
    
    // Amount needs to be calculated differently as bentobox deals shares and amounts in a different way.
    // usage of toAmount function converts shares to actrual amount based on collateral
    const collateralAdded = DegenBox.bind(deployedCauldron.bentoBox())
        .toAmount(collateral, event.params.share, false)
        .divDecimal(exponentToBigDecimal(deployedErc.decimals()))

    let collId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(collId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = "DEPOSIT"
    eventEntry.account = account.id
    eventEntry.to = to.id
    eventEntry.amount = collateralAdded
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateAccountStats(market.protocol, market.id, account.id, collateralAdded, "DEPOSIT")
    updateMarketStats(market.id, "DEPOSIT", collateralAdded)
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
    log.warning("Remove Collateral: share: {}", [event.params.share.toString()])
    const deployedCauldron = cauldron.bind(event.address)
    const collateral = deployedCauldron.collateral()
    const deployedErc = ERC20.bind(collateral)
    
    let market = getOrCreateMarket(event.address.toHexString())
    let invoker = getOrCreateAccount(event.params.from.toHexString())
    let account = getOrCreateAccount(event.params.to.toHexString()) 

    // Check if this is a repayment or a liquidation
    let isLiquidation = [invoker.id, market.id].indexOf(account.id) == -1
    
    const collateralRemoved = DegenBox.bind(deployedCauldron.bentoBox())
        .toAmount(collateral, event.params.share, false)
        .divDecimal(exponentToBigDecimal(deployedErc.decimals())) 

    let collId = event.transaction.hash
        .toHexString()
        .concat('-')
        .concat(event.transactionLogIndex.toString())

    let eventEntry = new Event(collId)
    eventEntry.market = market.id
    eventEntry.protocol = market.protocol
    eventEntry.eventType = isLiquidation ? "LIQUIDATION" : "WITHDRAW"
    eventEntry.account = account.id
    eventEntry.amount = collateralRemoved
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()

    eventEntry.save()

    updateAccountStats(market.protocol, market.id, account.id, collateralRemoved, eventEntry.eventType)
    updateMarketStats(market.id, eventEntry.eventType, collateralRemoved)
}

