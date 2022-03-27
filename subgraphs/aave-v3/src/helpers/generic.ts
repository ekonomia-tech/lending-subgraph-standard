import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"

export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = 0; i < decimals; i++) {
      bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export let zeroBD = BigDecimal.fromString('0')
export let zeroInt = BigInt.fromString('0');
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)

export const AAVE_V3_REGISTRY = "0x770ef9f4fe897e59daCc474EF11238303F9552b6"