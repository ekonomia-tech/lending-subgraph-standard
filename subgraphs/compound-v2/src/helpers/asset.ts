import { Asset } from "../../generated/schema";

export function getOrCreateAsset(assetId: string, symbol: string, name: string, decimals: number): Asset {
    let asset = Asset.load(assetId);
    if (asset) {
      return asset
    }
    asset = new Asset(assetId)
    asset.symbol = symbol
    asset.name = name
    asset.decimals = decimals
    return asset;
  }