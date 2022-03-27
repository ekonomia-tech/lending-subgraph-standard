import { Protocol } from "../../generated/schema";

export function getOrCreateProtocol(protocolId: string): Protocol {
    let protocol = Protocol.load(protocolId);
    if (!protocol) {
        protocol = new Protocol(protocolId)
        protocol.network = "POLYGON"
        protocol.type = "POOLED"
        protocol.priceOracle = null
        protocol.closeFactor = null
        protocol.maxAssets = null
        protocol.save()
    }
    return protocol;
}
