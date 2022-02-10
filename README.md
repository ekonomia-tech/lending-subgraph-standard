# Lending Protocol Subgraph Standard
This repository contains a standard schema for lending protocols. 

## Types of Lending Protocols
The existing decentralized lending protocol all have slightly different implementations of lending protocols. A non-exhaustive list is provided below.

- Aave & Comp - Pooled. Global risk. Multi-asset. Borrow assets that are deposited
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

## Implmentatin order
- Do the events first - straight forward. Check out the indexing speed
  - counts, presumably could be improved by improving the graphql interface for subgraphs, therefore it is a good idea to build it out compartmentalized into a single .ts file  
- Then do all the required stuff - real asset amounts held by accounts and protocols
- Then USD cuz it will be complicated and it will be nice to have it first, rather than add it into lines of code after the lifetimes part
- Then do lifetimes

# Single subgraph or multiple?
- The Indexing. Single or multiple subgraphs needed? We shall see. I can write a script that will change the manifests to deploy it as a single subgraph, or as multiple, 

# Future Work
- Incorporate borrow and supply rates
- Incorporate representations of collateral and debt, such as `cTokens` and `aTokens`.
- There is a possibility we could included CDP specific data in the future. But it might stay abstracted away from the Subgraph. Time will tell.
- Lifetime interest earned on Protocols and Markets
- Writing a test suite that confirms the numbers add up for lifetime values, split up and down the Accounts, Markets and Users. (It also makes me think, query time computation could calucate this. but it is always a battle of pre-compute vs. compute just-in-time)
# Open Questions
- Credit delegation can be implemented by separating the `sender` of transactions apart from the `from` or `to`, and also tracking the function calls that create delegation. But, every protocol implements this differently, and some not at all. The question is, how to implement this properly? It involves understanding how it works across all protocols and making sure that no events are screwed, as this can confuse the subgraph.
- Should gasPrice or transactionFee be included?
- How do Aave stable and variable debt tokens fit in here? Need to examine the code more.
- Should each protocol extend each event, such as `CompoundDeposit`, `AaveBorrow`, etc? It seems it might be worth it, but might add a lot of indexing time.
- What other information do data analysts want to see?
- How much historical data should be included? For example, a user's historical balance for borrows and deposits of their whole portfolio. This, of course would take a ton of indexing, such as how the uniswap.info subgraph takes a long time to sync. 
- Getting live data out of the subgraph is quite hard and complex - and this is particularly noticable in lending and borrowing protocols where you are earning interest or being charged interest. Subgraphs are not good at picking this up. The question is - how much of a detriment is this? Query time computation could provide a solution to this. 
- Is there any existing Subgraph standard out there? I think these could be defined better.

## Open Question around  Events derivedFrom
- Can I just filter queries for events on entity types? Reducing the schema a lot?
  - in some places yes, like Market and Protocol cuz the query is easy
  - but in Account , it is harder because of `to` and `from` both being used
