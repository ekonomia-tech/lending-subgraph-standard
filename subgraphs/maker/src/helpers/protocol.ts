import { Address } from "@graphprotocol/graph-ts";
import { Protocol } from "../../generated/schema";

export function getOrCreateProtocol(protocolId: string): Protocol {
    let network = "ETHEREUM"
    let protocol = new Protocol(protocolId)
    protocol.network = network
    protocol.address = Address.empty()
    protocol.type = "CDP"
    protocol.priceOracle = null
    protocol.closeFactor = null
    protocol.maxAssets = null
    protocol.save()

    return protocol;
}

export function getNetwork(protocolAddress: string): string {
    return "ETHEREUM"
}