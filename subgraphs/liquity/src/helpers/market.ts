import { BigDecimal } from '@graphprotocol/graph-ts'
import { Market } from '../../generated/schema'

/**
 * @notice This market-entity helper function is fairly in line with that used within other lending protocol subgraphs within Ekonomia-tech so far.
 * @dev NOTE: `handleReserveInitialized()` within `lendingPoolConfigurator.ts` is where the `market` is initialized for this protocol.
 */

export function getMarket(marketId: string): Market {
  let market = Market.load(marketId)
  if (market) {
    return market
  }
  return new Market('')
}

export function updateMarketStats(marketId: string, eventType: string, amount: BigDecimal): void {
  let market = getMarket(marketId)
  if (eventType == 'DEPOSIT') {
    market.deposited = market.deposited.plus(amount)
  } else if (eventType == 'WITHDRAW') {
    market.deposited = market.deposited.minus(amount)
  } else if (eventType == 'BORROW') {
    market.borrowed = market.borrowed.plus(amount)
  } else if (['REPAY', 'LIQUIDATION'].includes(eventType)) {
    market.borrowed = market.borrowed.minus(amount)
  }
  market.save()
}
