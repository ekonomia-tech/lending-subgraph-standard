import { AddressesProviderRegistered } from '../../generated/LendingPoolAddressesProviderRegistry/LendingPoolAddressesProviderRegistry'
import { LendingPoolAddressesProvider } from '../../generated/templates'
import { createProtocol } from '../helpers/protocol'

export function handleAddressesProviderRegistered(event: AddressesProviderRegistered): void {
  LendingPoolAddressesProvider.create(event.params.newAddress)
  createProtocol(event.address, 'AAVE-V2')
}
