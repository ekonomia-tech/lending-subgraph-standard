import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Account, AccountInMarket, AccountInProtocol } from '../../generated/schema'
import { zeroBD, zeroInt } from './generic'

export function getOrCreateAccount(accountId: string): Account {
  let account = Account.load(accountId)
  if (!account) {
    account = new Account(accountId)
    account.hasBorrowed = false
    account.liquidatedCount = 0
    account.liquidatingCount = 0
    account.save()
  }
  return account
}

export function markAccountAsBorrowed(accountId: string): void {
  let account = getOrCreateAccount(accountId)
  account.hasBorrowed = true
  account.save()
}

export function addToLiquidationCount(account: Account, isLiquidated: boolean): void {
  // Adds a count if account is liduidated or liquidating
  if (isLiquidated) {
    account.liquidatedCount += 1
  } else {
    account.liquidatingCount += 1
  }
  account.save()
}

export function getOrCreateAccountInProtocol(
  protocolId: string,
  accountId: string,
): AccountInProtocol {
  const acpId = protocolId.concat('-').concat(accountId)
  let acp = AccountInProtocol.load(acpId)
  if (!acp) {
    acp = new AccountInProtocol(acpId)
    acp.protocol = protocolId
    acp.account = accountId
    acp.depositCount = 0
    acp.withdrawCount = 0
    acp.borrowCount = 0
    acp.repayCount = 0
    acp.liquidatedCount = 0
    acp.save()
  }
  return acp
}

export function getOrCreateAccountInMarket(marketId: string, accountId: string): AccountInMarket {
  const acmId = marketId.concat('-').concat(accountId)
  let acm = AccountInMarket.load(acmId)
  if (!acm) {
    acm = new AccountInMarket(acmId)
    acm.market = marketId
    acm.account = accountId
    acm.deposited = zeroBD
    acm.borrowed = zeroBD
    acm.lifetimeBorrowed = zeroBD
    acm.lifetimeDeposited = zeroBD
    acm.lifetimeLiquidated = zeroBD
    acm.lifetimeRepaid = zeroBD
    acm.lifetimeWithdrawn = zeroBD
    acm.save()
  }
  return acm
}

/**
 * TODO: Update acp totals like lifetimeDepositedUSD WHEN we figure out how to best adjust respective token and its USD price at that point in time. I'll leave them as commented out updates though in my mapping.
 * @param protocolId Protocol Name
 * @param marketId Market-Creating Ext. Contract Address
 * @param accountId Ext. Address of account
 * @param amount
 * @param eventType VIP parameter dictating how acp and acm are updated
 */
export function updateAccountStats(
  protocolId: string,
  marketId: string,
  accountId: string,
  amount: BigDecimal,
  eventType: string,
): void {
  let acm = getOrCreateAccountInMarket(marketId, accountId)
  let acp = getOrCreateAccountInProtocol(protocolId, accountId)
  if (eventType == 'DEPOSIT') {
    acm.depositCount += 1
    acm.deposited = acm.deposited.plus(amount)
    acm.lifetimeDeposited = acm.lifetimeDeposited.plus(amount)
    // acp.lifetimeDepositedUSD = acp.lifetimeDepositedUSD.plus(amount) // TODO: convert to USD

    acp.depositCount += 1
  } else if (eventType == 'WITHDRAW') {
    acm.withdrawCount += 1
    acm.deposited = acm.deposited.minus(amount)
    acm.lifetimeWithdrawn = acm.lifetimeWithdrawn.plus(amount)
    // acp.lifetimeWithdrawnUSD = acp.lifetimeWithdrawnUSD.plus(amount) // TODO: convert to USD

    acp.withdrawCount += 1
  } else if (eventType == 'BORROW') {
    acm.borrowCount += 1
    acm.borrowed = acm.borrowed.plus(amount)
    acm.lifetimeBorrowed = acm.lifetimeBorrowed.plus(amount)
    // acp.lifetimeBorrowedUSD = acp.lifetimeBorrowedUSD.plus(amount) // TODO: convert to USD

    acp.borrowCount += 1
  } else if (eventType == 'REPAY') {
    acm.repayCount += 1
    acm.borrowed = acm.borrowed.minus(amount)
    acm.lifetimeRepaid = acm.lifetimeRepaid.plus(amount)
    // acp.lifetimeRepaidUSD = acp.lifetimeRepaidUSD.plus(amount) // TODO: convert to USD

    acp.repayCount += 1
  } else if (eventType == 'LIQUIDATION') {
    acm.liquidatedCount += 1
    acm.borrowed = acm.borrowed.minus(amount)
    acm.lifetimeLiquidated = acm.lifetimeLiquidated.plus(amount)
    // acp.lifetimeLiquidatedUSD = acp.lifetimeLiquidatedUSD.plus(amount) // TODO: convert to USD

    acp.liquidatedCount += 1
  }

  acm.save()
  acp.save()
}
