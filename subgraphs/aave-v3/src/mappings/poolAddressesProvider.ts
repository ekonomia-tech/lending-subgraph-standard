import { PoolConfigurator, Pool } from '../../generated/templates'
import { PoolConfiguratorUpdated, ProxyCreated } from '../../generated/templates/PoolAddressesProvider/PoolAddressesProvider'
import { Contract } from '../../generated/schema'

export function handlePoolConfiguratorUpdated(event: PoolConfiguratorUpdated): void {
    PoolConfigurator.create(event.params.newAddress)
}

export function handleProxyCreated(event: ProxyCreated): void {
    let typeOfProxy = event.params.id.toString()
    let contract: Contract

    if(typeOfProxy == "POOL") {
        Pool.create(event.params.proxyAddress)
        contract = new Contract(event.params.proxyAddress.toHexString())
        contract.name = "Pool Proxy"
    } else if (typeOfProxy == "POOL_CONFIGURATOR") {
        PoolConfigurator.create(event.params.proxyAddress)
        contract = new Contract(event.params.proxyAddress.toHexString())
        contract.name = "Pool Configurator"
    }

    contract.save() 
}