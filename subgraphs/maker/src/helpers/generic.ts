import { BigDecimal } from "@graphprotocol/graph-ts"


export function exponentToBigDecimal(decimals: i32): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = 0; i < decimals; i++) {
      bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export const DAI_V1_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'