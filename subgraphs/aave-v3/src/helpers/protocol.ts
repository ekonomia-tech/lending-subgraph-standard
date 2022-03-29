import { Address } from "@graphprotocol/graph-ts";
import { Protocol } from "../../generated/schema";

export function createProtocol(protocolAddress: Address, name: string): Protocol {
    let network = getNetwork(protocolAddress.toHexString())
    let protocolId = name.concat('-').concat(network)
    let protocol = new Protocol(protocolId)
    protocol.network = network
    protocol.address = protocolAddress
    protocol.type = "POOLED"
    protocol.priceOracle = null
    protocol.closeFactor = null
    protocol.maxAssets = null
    protocol.save()

    return protocol;
}

export function getProtocol(protocolId: string): Protocol {
    let protocol = Protocol.load(protocolId);
    if (protocol) {
        return protocol;
    }
    return new Protocol("");
}

export function getNetwork(protocolAddress: string): string {
    return "POLYGON"
}