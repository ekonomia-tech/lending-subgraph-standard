import { Account } from "../../generated/schema";

export function getOrCreateAccount(accountId: string): Account {
    let account = Account.load(accountId);
    if (!account) {
      account = new Account(accountId)
    }
    return account;
}

export function markAccountAsBorrowed(accountId: string): void {
  let account = getOrCreateAccount(accountId);
  account.hasBorrowed = true;
  account.save()
}

export function AddToLiquidationCount(accountId: string, isLiquidated: Boolean): void {
  // Adds a count if account is liduidated or liquidating
  let account = getOrCreateAccount(accountId)
  if (isLiquidated) {
    account.liquidatedCount += 1
  } else {
    account.liquidatingCount += 1
  }
  account.save()
}
