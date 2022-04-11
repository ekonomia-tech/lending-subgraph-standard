import { BigInt } from '@graphprotocol/graph-ts'
import { Asset } from '../../generated/schema'
import { zeroInt } from './generic'

export function getOrCreateAsset(assetId: string): Asset {
  let asset = Asset.load(assetId)
  if (!asset) {
    asset = new Asset(assetId)
    asset.symbol = ''
    asset.name = ''
    asset.decimals = 0
    asset.save()
  }
  return asset
}
