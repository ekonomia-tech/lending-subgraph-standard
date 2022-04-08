import { Asset } from '../../generated/schema'

export function getOrCreateLUSD(LUSD: string): Asset {
  let asset = Asset.load(LUSD)
  if (asset) {
    return asset
  }
  asset = new Asset(LUSD)
  asset.name = 'LUSD Stablecoin'
  asset.symbol = 'LUSD'
  asset.decimals = 18

  asset.save()
  return asset
}

// hard coding ETHER as an asset
// ID for ETHER asset: 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
export function getOrCreateEther(ether: string): Asset {
  let asset = Asset.load(ether)
  if (asset) {
    return asset
  }
  asset = new Asset(ether)
  asset.name = 'Ether'
  asset.symbol = 'ETH'
  asset.decimals = 18

  asset.save()
  return asset
}
