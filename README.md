# Lending Protocol Subgraph Standard
This repository contains a standard schema for lending protocols. 

## Types of Lending Protocols
The existing decentralized lending protocol all have slightly different implementations of lending protocols. A non-exhaustive list is provided below.

- Aave & Comp - Pooled. Global risk. Multi-asset. Borrow assets that are deposited.
- Maker & Abracadabra - Collateralized Debt Positions (CDPs). Isolated. Borrow a single synthetic asset minted, such as DAI or MIM.
- Synthetix - Pooled. Global risk. Single asset as collateral (SNX). sUSD and many other synthetic assets minted. 
- RAI, Liquity - CDP, single asset as collateral, ETH. Borrow a single synthetic asset, RAI or LUSD.

## Generalizing a lending protocol
Each protocol implements their own functions, events, token minting and token transfers. This means we have to make a very general schema to support all of these possibilities. Below is a general framework:
- `Deposit` - Deposit collateral into a protocol.
- `Withdraw` - Withdraw collateral from a protocol.
- `Borrow` - Borrow an asset from a protocol.
- `Repay` - Repay a borrowed asset from a protocol.
- `Liquidate` - Liquidate a user for profit.

## Indexing Speed
- Will we be able to deploy the Subgraph as a single Subgraph, or will we have to split it into multiple to speed up indexing?
  - Time will tell, but there are a lot of improves coming to `graph-node`. I would assume one day it will be possible, if it isn't already today.
  - A solution right now would be to create a script that can edit the manifest(s) to deploy as a single Subgraph, or as separate Subgraphs.
- The plan is to deploy it as a single subgraph, measure the time it takes to sync, and decide then how to deploy it in the short term.

## Priority of implementing the Subgraph
- Events and Counts first - as they are straight forward. Test the indexing speed here (and at the next steps).
- Then do all the required stuff - real asset amounts held by accounts and protocols.
- Then USD because it will be complicated and it will be nice to have before the Lifetime aggregation.
- Then do Lifetime aggregation amounts.

## Future Work
- Incorporate borrow and supply rates.
- Incorporate representations of collateral and debt, such as `cTokens` and `aTokens`. (Or decide to eliminate the idea completely).
- There is a possibility we could included CDP specific data in the future. But it might stay abstracted away from the Subgraph. TBD.
- Lifetime interest earned on Protocols and Markets
- Writing a test suite that confirms the numbers add up for lifetime values, split up and down the Accounts, Markets and Users. (NOTE - Might be able to use [Matchstick](https://www.youtube.com/watch?v=cB7o2n-QrnU&list=PLTqyKgxaGF3SNakGQwczpSGVjS_xvOv3h&index=1)).
  - It also makes me think, query time computation could calculate this. but it is always a battle of pre-compute vs. compute just-in-time.
## Open Questions
- Credit delegation can be implemented by separating the `sender` of transactions apart from the `from` or `to`, and also tracking the function calls that create delegation. But, every protocol implements this differently, and some not at all.
  - The question is, how to implement this properly? It involves understanding how it works across all protocols and making sure that no events are screwed, as this can confuse the subgraph.
- Should gasPrice or transactionFee be included?
- How do Aave stable and variable debt tokens fit in here? Need to examine the code more.
- Should each protocol extend each event, such as `CompoundDeposit`, `AaveBorrow`, etc? It seems it might be worth it, but might add a lot of indexing time.
- How much historical data should be included? For example, a user's historical balance for borrows and deposits of their whole portfolio. This, of course would take a ton of indexing, such as how the uniswap.info subgraph takes a long time to sync. 
- Is there any existing Subgraph standard out there?
- Can we just filter queries for events like `Deposit`on entity types, and remove most usage of `@derivedFrom`?
  - In some places yes, like Market and Protocol cuz the query is easy.
  - But in Account , it is harder because of `to` and `from` both being used.
  - For now, we are leaving them in.
