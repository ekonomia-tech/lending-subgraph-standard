import { AddressesProviderRegistered } from '../../generated/PoolAddressesProviderRegistry/PoolAddressesProviderRegistry' 
import { PoolAddressesProvider } from '../../generated/templates'
import { AAVE_V3_REGISTRY } from '../helpers/generic'
import { getOrCreateProtocol } from '../helpers/protocol'

export function handleAddressesProviderRegistered(event: AddressesProviderRegistered): void {
    PoolAddressesProvider.create(event.params.addressesProvider)
    getOrCreateProtocol(AAVE_V3_REGISTRY)
}