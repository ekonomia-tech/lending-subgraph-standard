import { AddressesProviderRegistered } from '../../generated/LendingPoolAddressesProviderRegistry/LendingPoolAddressesProviderRegistry'
import { Contract } from '../../generated/schema'
import { LendingPoolAddressesProvider } from '../../generated/templates'
import { AAVE_V2_REGISTRY } from '../helpers/generic'
import { getOrCreateProtocol } from '../helpers/protocol'

export function handleAddressesProviderRegistered(event: AddressesProviderRegistered): void {
    LendingPoolAddressesProvider.create(event.params.newAddress)
    getOrCreateProtocol(AAVE_V2_REGISTRY)

    let contract = new Contract(AAVE_V2_REGISTRY)
    contract.name = "REGISTRY"
    contract.save()
}