import { BigDecimal } from "@graphprotocol/graph-ts"

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = 0; i < decimals; i++) {
      bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export let zeroBD = BigDecimal.fromString('0')
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)
export let cTokenDecimalsBD: BigDecimal = exponentToBigDecimal(8)
export let cTokenDecimals = 8

export const unitrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
export const cUSDCAddress = '0x39aa39c021dfbae8fac545936693ac917d5e7563'
export const cETHAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
export const daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'

export function generateId(event: any): string {
  return event.transaction.hash
  .toHexString()
  .concat('-')
  .concat(event.transactionLogIndex.toString())
}