import { Asset } from '../../generated/schema'
import { ERC20 } from '../../generated/BorrowerOperations/ERC20'
import { Address, log } from '@graphprotocol/graph-ts'
import { zeroInt } from '../../../compound-v2/src/helpers/generic'

// export function getOrCreateAsset(assetAddress: string): Asset {
//   let asset = Asset.load(assetAddress)
//   if (asset) {
//     return asset
//   }
//   let assetContract = ERC20.bind(Address.fromString(assetAddress))
//   asset = new Asset(assetAddress)

//   let assetName = assetContract.try_name()
//   let assetSymbol = assetContract.try_symbol()
//   let assetDecimals = assetContract.try_decimals()

//   asset.name = assetName.reverted ? '' : assetName.value
//   asset.symbol = assetSymbol.reverted ? '' : assetSymbol.value
//   asset.decimals = assetDecimals.reverted ? zeroInt.toI32() : assetDecimals.value

//   asset.save()
//   return asset
// }

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
