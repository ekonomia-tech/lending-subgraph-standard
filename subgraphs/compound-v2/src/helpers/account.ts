import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Account, AccountInMarket, AccountInProtocol } from "../../generated/schema";
import { zeroBD, zeroInt } from "./generic";

export function getOrCreateAccount(accountId: string): Account {
    let account = Account.load(accountId);
    if (!account) {
      account = new Account(accountId)
      account.hasBorrowed = false
      account.liquidatedCount = zeroInt
      account.liquidatingCount = zeroInt
      account.save()
    }
    return account;
}

export function markAccountAsBorrowed(accountId: string): void {
  let account = getOrCreateAccount(accountId);
  account.hasBorrowed = true;
  account.save()
}

export function AddToLiquidationCount(accountId: string, isLiquidated: boolean): void {
  // Adds a count if account is liduidated or liquidating
  let account = getOrCreateAccount(accountId)
  if (isLiquidated) {
    account.liquidatedCount.plus(new BigInt(1))
  } else {
    account.liquidatingCount.plus(new BigInt(1))
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
  if (eventType === "DEPOSIT") {
    acm.depositCount.plus(new BigInt(1))
    acm.deposited.plus(amount)
    acm.lifetimeDeposited.plus(amount)

    acp.depositCount.plus(new BigInt(1))

  } else if (eventType === "WITHDRAW") {
    acm.withdrawCount.plus(new BigInt(1))
    acm.deposited.minus(amount)
    acm.lifetimeWithdrawn.plus(amount)

    acp.withdrawCount.plus(new BigInt(1))

  } else if (eventType === "BORROW") {
    acm.borrowCount.plus(new BigInt(1))
    acm.borrowed.plus(amount)
    acm.lifetimeBorrowed.plus(amount)

    acp.borrowCount.plus(new BigInt(1))

  } else if (eventType === "REPAY") {
    acm.repayCount.plus(new BigInt(1))
    acm.borrowed.minus(amount)
    acm.lifetimeRepaid.plus(amount)

    acp.repayCount.plus(new BigInt(1))

  } else if (eventType === "LIQUIDATION") {
    acm.liquidatedCount.plus(new BigInt(1))
    acm.borrowed.minus(amount)
    acm.lifetimeLiquidated.plus(amount)

    acp.liquidatedCount.plus(new BigInt(1))

  }

}