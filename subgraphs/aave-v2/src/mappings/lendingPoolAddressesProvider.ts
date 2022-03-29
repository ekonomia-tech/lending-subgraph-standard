import { log } from '@graphprotocol/graph-ts'
import { Contract } from '../../generated/schema'
import { LendingPoolConfigurator, LendingPool } from '../../generated/templates'
import { LendingPoolConfiguratorUpdated, ProxyCreated } from '../../generated/templates/LendingPoolAddressesProvider/LendingPoolAddressesProvider'

export function handlePoolConfiguratorUpdated(event: LendingPoolConfiguratorUpdated): void {
    LendingPoolConfigurator.create(event.params.newAddress)
}

export function handleProxyCreated(event: ProxyCreated): void {
    let typeOfProxy = event.params.id.toString()
    log.warning("type: {}", [event.params.id.toString()])
    let contract = new Contract(event.params.newAddress.toHexString())

    if(typeOfProxy == "LENDING_POOL") {
        LendingPool.create(event.params.newAddress)    
        contract.name = "LENDING_POOL"
    } else if (typeOfProxy == "LENDING_POOL_CONFIGURATOR") {
        LendingPoolConfigurator.create(event.params.newAddress)
        contract.name = "LENDING_POOL_CONFIGURATOR"
    }
    contract.save()
}