# Lending Protocol Subgraph Standard
This repository contains a standard schema for lending protocols. 

# Types of Lending Protocols
The existing decentralized lending protocol all have slightly different twists to how lending works. A non-exhaustive list is provided below.

- Aave & Comp - Pooled. Global risk. Multi-asset. Borrow assets that are deposited
- Maker & Abracadabra - Collateralized Debt Positions (CDPs). Isolated. Borrow a single synthetic asset minted, such as DAI or MIM.
- Synthetix - Pooled. Global risk. Single asset as collateral (SNX). sUSD and many other synthetic assets minted. 
- RAI, Liquity - CDP, single asset as collateral, ETH. Borrow a single synthetic asset, RAI or LUSD.

## Generalizing a lending protocol
Each protocol implements their functions, their events, their token minting and token transfers, differently. This means we have to make a very general schema to support all of these possibilities.

Below is a general framework

- `Deposit` - Deposit collateral into a protocol
- `Withdraw` - Withdraw collateral from a protocol
- `Borrow` - Borrow an asset from a protocol
- `Repay` - Repay a borrowed asset from a protocol
- `Liquidate` - Liquidate a user for profit
- `FlashLoan implements Borrow` - A Flashloan is an under-collateralized single block `Borrow`

# Other thoughts
## Basic Transfers
- If you transfer a cToken from one account to another, it needs to be withdrew from the original account, and then deposited into the new account. (Note - this makes for a complex scenario when a cToken or aToken has appreciated in value).
## Minting and Supplying
- Often you `Deposit` a collateral token, and you immediately mint a lending protocol token (i.e. supply USDC, get cUSDC in Compound)
- When opening a CDP, you supply collateral, and you immediately mint a collateral backed asset like DAI.
- HOWEVER - if your CDP contains ETH, and ETH went up in value, then you can mint more DAI without supplying anything
- The point I am making here is that `Deposit` is often connected to the minting and/or `Borrow` of a token, but not always. So I have decided to keep them separate. They can be linked through `txHash`. But that does not tell the whole story, as someone could do multiple `Deposit`s and `Borrow`s in one transaction, as we often see with leverage.
  
## cTokens, aTokens, etc.
- I deliberately exclude `cTokens` and `aTokens` from the schema, as they are representation of collateral, and not the collateral itself.
- This has the downside of not being able to understand how the collateral is growing.
- This will be included in Future Work.

## How to record CDPs
- We aggregate all the CDPs/Vaults that users create into one `Market`.
## Seperate Pools under one protocol
- Aave has two "Pools" on mainnet ethereum. One for normal ERC-20 assets, and another for AMM tokens. 
- We split these into two protocols, as they are completely isolated in reality. 


## Having a USD price and an ETH price
- Should we include a price in eth for the debts and collaterals? I would say no, because if this is to be generalized, then it could be on a protocol like Polygon. Or some non-EVM chain. Thus, I am excluding it for now.
- USD price is included because it is general, and so much lending in crypto revolves around stablecoins and leverage.

# Future Work
- Incorporate borrow and supply rates
- Incorporate representations of collateral and debt, such as `cTokens` and `aTokens`.
- There is a possibility we could included CDP specific data in the future. But it might stay abstracted away from the Subgraph. Time will tell.
# Open Questions
- Credit delegation can be implemented by separating the `sender` of transactions apart from the `from` or `to`, and also tracking the function calls that create delegation. But, every protocol implements this differently, and some not at all. The question is, how to implement this properly? It involves understanding how it works across all protocols and making sure that no events are screwed, as this can confuse the subgraph.
- Should gasPrice or transactionFee be included?
- How do Aave stable and variable debt tokens fit in here? Need to examine the code more.
- Should each protocol extend each event, such as `CompoundDeposit`, `AaveBorrow`, etc? It seems it might be worth it, but might add a lot of indexing time.
- What other information do data analysts want to see?
- How much historical data should be included? For example, a user's historical balance for borrows and deposits of their whole portfolio. This, of course would take a ton of indexing, such as how the uniswap.info subgraph takes a long time to sync. 
- Getting live data out of the subgraph is quite hard and complex - and this is particularly noticable in lending and borrowing protocols where you are earning interest or being charged interest. Subgraphs are not good at picking this up. The question is - how much of a detriment is this? Query time computation could provide a solution to this. 