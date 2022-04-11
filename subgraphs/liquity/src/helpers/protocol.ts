import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Protocol } from '../../generated/schema'

/**
 * @notice This protocol-entity helper function is fairly in line with that used within other lending protocol subgraphs within Ekonomia-tech so far.
 */

export function createProtocol(protocolAddress: Address, name: string): Protocol {
  let network = getNetwork(protocolAddress.toHexString())
  let protocolId = name.concat('-').concat(network) // TODO: SP: shouldn't this just be name of the protocol, w/o the network concat acc. to schema?
  let protocol = new Protocol(protocolId)
  protocol.network = network
  protocol.address = protocolAddress
  protocol.type = 'CDP'
  protocol.priceOracle = null // TODO: Update this as Liquity uses chainlink and something else as their backup. Are we recording backup priceOracles?
  protocol.closeFactor = null // TODO: Is there a point in outlining null when it defaults to null in the first place and is not a required field?
  protocol.maxAssets = BigInt.fromI32(1)
  protocol.save()

  return protocol
}

// Since protocol is only instantiated once when it is deployed, having createOrGetProtocol() seems unnecessary.
export function getProtocol(protocolId: string): Protocol {
  let protocol = Protocol.load(protocolId)
  if (protocol) {
    return protocol
  }
  return new Protocol('')
}

export function getNetwork(protocolAddress: string): string {
  return 'ETHEREUM'
}
