import { LendingPool, LendingPoolConfigurator } from '../../generated/templates'
import {
  LendingPoolConfiguratorUpdated,
  ProxyCreated,
} from '../../generated/templates/LendingPoolAddressesProvider/LendingPoolAddressesProvider'

export function handlePoolConfiguratorUpdated(event: LendingPoolConfiguratorUpdated): void {
  LendingPoolConfigurator.create(event.params.newAddress)
}

export function handleProxyCreated(event: ProxyCreated): void {
  let typeOfProxy = event.params.id.toString()

  if (typeOfProxy == 'LENDING_POOL') {
    LendingPool.create(event.params.newAddress)
  } else if (typeOfProxy == 'LENDING_POOL_CONFIGURATOR') {
    LendingPoolConfigurator.create(event.params.newAddress)
  }
}
