import { PoolConfigurator, Pool } from '../../generated/templates'
import {
  PoolConfiguratorUpdated,
  ProxyCreated,
} from '../../generated/templates/PoolAddressesProvider/PoolAddressesProvider'

export function handlePoolConfiguratorUpdated(event: PoolConfiguratorUpdated): void {
  PoolConfigurator.create(event.params.newAddress)
}

export function handleProxyCreated(event: ProxyCreated): void {
  let typeOfProxy = event.params.id.toString()

  if (typeOfProxy == 'POOL') {
    Pool.create(event.params.proxyAddress)
  } else if (typeOfProxy == 'POOL_CONFIGURATOR') {
    PoolConfigurator.create(event.params.proxyAddress)
  }
}
