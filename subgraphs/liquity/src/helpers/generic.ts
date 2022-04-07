import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}
export let ICR_min = BigDecimal.fromString('1.1')
export let TCR_min = BigDecimal.fromString('1.5')
export let EthToLUSD = BigDecimal.fromString('0.9')

export let zeroBD = BigDecimal.fromString('0')
export let zeroInt = BigInt.fromString('0')
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)

export const EthAddr = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const LUSDAddr = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'

export const LiquityBorrowerOpsAddr = '0x24179CD81c9e782A4096035f7eC97fB8B783e007'
