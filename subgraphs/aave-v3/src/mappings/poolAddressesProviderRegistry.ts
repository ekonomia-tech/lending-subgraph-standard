import { AddressesProviderRegistered } from '../../generated/PoolAddressesProviderRegistry/PoolAddressesProviderRegistry' 
import { PoolAddressesProvider } from '../../generated/templates'
import { createProtocol } from '../helpers/protocol'

export function handleAddressesProviderRegistered(event: AddressesProviderRegistered): void {
    PoolAddressesProvider.create(event.params.addressesProvider)
    createProtocol(event.address, "AAVE-V3")
}