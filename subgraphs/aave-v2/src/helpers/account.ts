import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Account, AccountInMarket, AccountInProtocol } from "../../generated/schema";
import { zeroBD, zeroInt } from "./generic";

export function getOrCreateAccount(accountId: string): Account {
    let account = Account.load(accountId);
    if (!account) {
      account = new Account(accountId)
      account.hasBorrowed = false
      account.liquidatedCount = 0
      account.liquidatingCount = 0
      account.save()
    }
    return account;
}

export function markAccountAsBorrowed(accountId: string): void {
  let account = getOrCreateAccount(accountId);
  account.hasBorrowed = true;
  account.save()
}

export function addToLiquidationCount(accountId: string, isLiquidated: boolean): void {
  // Adds a count if account is liduidated or liquidating
  let account = getOrCreateAccount(accountId)
  if (isLiquidated) {
    account.liquidatedCount += 1
  } else {
    account.liquidatingCount += 1
  }
  account.save()
}

export function getOrCreateAccountInProtocol(protocolId: string, accountId: string): AccountInProtocol {
  const acpId = protocolId.concat('-').concat(accountId);
  let acp = AccountInProtocol.load(acpId)
  if (!acp) {
    acp = new AccountInProtocol(acpId)
    acp.protocol = protocolId
    acp.account = accountId
    acp.depositCount = zeroInt
    acp.withdrawCount = zeroInt
    acp.borrowCount = zeroInt
    acp.repayCount = zeroInt
    acp.liquidatedCount = zeroInt
    acp.save()
  }
  return acp
}

export function getOrCreateAccountInMarket(marketId: string, accountId: string): AccountInMarket {
  const acmId = marketId.concat('-').concat(accountId);
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

export function updateAccountStats(protocolId: string, marketId: string, accountId: string, amount: BigDecimal, eventType: string): void {
  let acm = getOrCreateAccountInMarket(marketId, accountId)
  let acp = getOrCreateAccountInProtocol(protocolId, accountId)
  if (eventType == "DEPOSIT") {
    acm.depositCount = acm.depositCount.plus(new BigInt(1))
    acm.deposited = acm.deposited.plus(amount)
    acm.lifetimeDeposited = acm.lifetimeDeposited.plus(amount)

    acp.depositCount = acp.depositCount.plus(new BigInt(1))

  } else if (eventType == "WITHDRAW") {
    acm.withdrawCount = acm.withdrawCount.plus(new BigInt(1))
    acm.deposited = acm.deposited.minus(amount)
    acm.lifetimeWithdrawn = acm.lifetimeWithdrawn.plus(amount)

    acp.withdrawCount = acp.withdrawCount.plus(new BigInt(1))

  } else if (eventType == "BORROW") {
    acm.borrowCount = acm.borrowCount.plus(new BigInt(1))
    acm.borrowed = acm.borrowed.plus(amount)
    acm.lifetimeBorrowed = acm.lifetimeBorrowed.plus(amount)

    acp.borrowCount = acp.borrowCount.plus(new BigInt(1))

  } else if (eventType == "REPAY") {
    acm.repayCount = acm.repayCount.plus(new BigInt(1))
    acm.borrowed = acm.borrowed.minus(amount)
    acm.lifetimeRepaid = acm.lifetimeRepaid.plus(amount)

    acp.repayCount = acp.repayCount.plus(new BigInt(1))

  } else if (eventType == "LIQUIDATION") {
    acm.liquidatedCount = acm.liquidatedCount.plus(new BigInt(1))
    acm.borrowed = acm.borrowed.minus(amount)
    acm.lifetimeLiquidated = acm.lifetimeLiquidated.plus(amount)

    acp.liquidatedCount = acp.liquidatedCount.plus(new BigInt(1))

  }

  acm.save()
  acp.save()

}