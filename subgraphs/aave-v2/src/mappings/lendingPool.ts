import { getOrCreateAsset } from '../../../compound-v2/src/helpers/asset';
import { Event } from '../../generated/schema';
import { Borrow, LiquidationCall, RebalanceStableBorrowRate, Repay, ReserveDataUpdated, Deposit, Withdraw } from '../../generated/templates/LendingPool/LendingPool';
import { addToLiquidationCount, getOrCreateAccount, markAccountAsBorrowed, updateAccountStats } from '../helpers/account';
import { AAVE_V2_REGISTRY, exponentToBigDecimal } from '../helpers/generic';
import { getMarket, updateMarketStats } from '../helpers/market';
import { getProtocol } from '../helpers/protocol';

export function handleBorrow(event: Borrow): void {
    
    let market = getMarket(event.params.reserve.toHexString());
    let protocol = getProtocol(market.protocol)
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString())
    let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString())
    markAccountAsBorrowed(account.id)
  
    let borrowId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());
    
    let borrowAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)
  
    let eventEntry = new Event(borrowId);
    eventEntry.eventType = "BORROW"
    eventEntry.market = market.id
    eventEntry.account = account.id
    eventEntry.onBehalfOf = onBehalfOf.id
    eventEntry.amount = borrowAmount;
    eventEntry.borrowRate = event.params.borrowRate;
    eventEntry.interestRateMode = event.params.borrowRateMode.toI32()
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save();

    updateMarketStats(market.id, "BORROW", borrowAmount)
    updateAccountStats(protocol.id, market.id, account.id, borrowAmount, eventEntry.eventType)
  }

export function handleDeposit(event: Deposit): void {
    
    let market = getMarket(event.params.reserve.toHexString());
    let protocol = getProtocol(market.protocol)
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString())
    let onBehalfOf = getOrCreateAccount(event.params.onBehalfOf.toHexString())

    let depositId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let depositAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)

    let eventEntry = new Event(depositId);
    eventEntry.eventType = "DEPOSIT"
    eventEntry.market = market.id
    eventEntry.account = account.id
    eventEntry.onBehalfOf = onBehalfOf.id
    eventEntry.amount = depositAmount;
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save();

    updateMarketStats(market.id, "DEPOSIT", depositAmount)
    updateAccountStats(protocol.id, market.id, account.id, depositAmount, eventEntry.eventType)
}

export function handleWithdraw(event: Withdraw): void {
   
    let market = getMarket(event.params.reserve.toHexString())
    let protocol = getProtocol(market.protocol)
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString())
    let to = getOrCreateAccount(event.params.to.toHexString())

    let depositId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let depositAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)

    let eventEntry = new Event(depositId);
    eventEntry.eventType = "WITHDRAW"
    eventEntry.market = market.id
    eventEntry.account = account.id
    eventEntry.amount = depositAmount;
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.to = to.id
    eventEntry.save();

    updateMarketStats(market.id, "WITHDRAW", depositAmount)
    updateAccountStats(protocol.id, market.id, account.id, depositAmount, eventEntry.eventType)
}

export function handleRepay(event: Repay): void {
   
    let market = getMarket(event.params.reserve.toHexString())
    let protocol = getProtocol(market.protocol)
    let asset = getOrCreateAsset(market.asset);
    let account = getOrCreateAccount(event.params.user.toHexString())
    let repayer = getOrCreateAccount(event.params.repayer.toHexString())

    let repayId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let repayAmount = event.params.amount
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)

    let eventEntry = new Event(repayId);
    eventEntry.eventType = "REPAY"
    eventEntry.market = market.id
    eventEntry.account = account.id
    eventEntry.payer = repayer.id
    eventEntry.amount = repayAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save();

    updateMarketStats(market.id, "REPAY", repayAmount)
    updateAccountStats(protocol.id, market.id, account.id, repayAmount, eventEntry.eventType)
}

export function handleLiquidate(event: LiquidationCall): void {
   
    let market = getMarket(event.params.debtAsset.toHexString())
    let protocol = getProtocol(market.protocol)
    let asset = getOrCreateAsset(market.asset);
    let collateralMarket = getMarket(event.params.collateralAsset.toHexString())
    let collateralAsset = getOrCreateAsset(collateralMarket.asset)
    let account = getOrCreateAccount(event.params.user.toHexString())
    let liquidator = getOrCreateAccount(event.params.liquidator.toHexString())

    addToLiquidationCount(account, true)
    addToLiquidationCount(liquidator, false)

    let repayId = event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(event.transactionLogIndex.toString());

    let LiquidateAmount = event.params.debtToCover
      .toBigDecimal()
      .div(exponentToBigDecimal(asset.decimals))
      .truncate(asset.decimals)

    let liquidatedCollateralAmount = event.params.liquidatedCollateralAmount
      .toBigDecimal()
      .div(exponentToBigDecimal(collateralAsset.decimals))
      .truncate(collateralAsset.decimals)

    let eventEntry = new Event(repayId);
    eventEntry.eventType = "LIQUIDATION"
    eventEntry.market = market.id
    eventEntry.account = account.id
    eventEntry.liquidator = liquidator.id
    eventEntry.amount = LiquidateAmount
    eventEntry.blockTime = event.block.timestamp.toI32()
    eventEntry.blockNumber = event.block.number.toI32()
    eventEntry.save();
    
    updateMarketStats(market.id, "LIQUIDATION", LiquidateAmount)
    updateAccountStats(protocol.id, market.id, account.id, LiquidateAmount, eventEntry.eventType)
}


export function handleReserveDataUpdated(event: ReserveDataUpdated): void {
  
  let market = getMarket(event.params.reserve.toHexString())
  market.liquidityRate = event.params.liquidityRate
  market.liquidityIndex = event.params.liquidityIndex
  market.stableBorrowRate = event.params.stableBorrowRate
  market.variableBorrowIndex = event.params.variableBorrowIndex
  market.variableBorrowRate = event.params.variableBorrowRate

  market.save()
}