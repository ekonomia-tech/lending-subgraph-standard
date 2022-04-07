import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Account, AccountInMarket, AccountInProtocol } from '../../generated/schema'
import { zeroBD, zeroInt } from './generic'

export function getOrCreateACM(acmId: string, account: string): AccountInMarket {
  let acm = AccountInMarket.load(acmId)
  if (!acm) {
    acm = new AccountInMarket(acmId)
    acm.account = account // pass in account ID
    acm.deposited = zeroBD
    acm.borrowed = zeroBD
    acm.lifetimeDeposited = zeroBD
    acm.lifetimeWithdrawn = zeroBD
    acm.lifetimeWithdrawnUSD = zeroBD
    acm.lifetimeBorrowed = zeroBD
    acm.lifetimeBorrowedUSD = zeroBD
    acm.lifetimeRepaid = zeroBD
    acm.lifetimeLiquidated = zeroBD
    acm.lifetimeLiquidatedUSD = zeroBD
    acm.depositCount = 0
    acm.withdrawCount = 0
    acm.borrowCount = 0
    acm.repayCount = 0
    acm.liquidatedCount = 0

    acm.save()
  }
  return acm
}
