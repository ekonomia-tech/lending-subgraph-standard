# Implementation Details
After examining Compound and Aave Solidity code, I have some thoughts about how the mappings might need to handle the uniqueness of each protocol. 

## Basic Transfers
- Anytime you transfer an asset that represents a deposit, such as a `cToken` or `aToken` - it should be recorded as a `Withdraw` for the sender and a `Deposit` for the receiver.
  - Note - we will have to handle the interest for the sender at the time of the transfer.

## Minting and Supplying
- Often you `Deposit` a collateral token, and you immediately mint a lending protocol token (i.e. supply USDC, get cUSDC in Compound).
- When opening a CDP, you supply collateral, and you immediately mint a collateral backed asset like DAI.
- HOWEVER - if your CDP contains ETH, and ETH went up in value, then you can mint more DAI without supplying anything.
- The point I am making here is that `Deposit` is often connected to the minting and/or `Borrow` of a token, but not always. So I have decided to keep Supplying and Minting separate.
  - We can maybe link them in the future through the transaction hash, or some joint entity.
  
## cTokens, aTokens, etc.
- I deliberately exclude `cTokens` and `aTokens` from the schema, as they are representation of collateral, and not the collateral itself.
- This has the downside of not being able to understand how the collateral is growing, since both tokens auto-calculate the interest.
- This will be included in Future Work.

## How to record CDPs
- We aggregate all the CDPs/Vaults that users create into one `Market`.

## Separate Pools under one protocol
- Aave has two "Pools" on mainnet ethereum. One for normal ERC-20 assets, and another for AMM tokens. 
- We split these into two protocols, as they are completely isolated in reality. The main point is the RISK is isolated, which should be the main driver to make them seperate protocols.

## Having a USD price and an ETH price
- Price of asset in ETH is not included, as to support other L1s, and be more generalized.
- USD price is included because it is general, and so much lending in crypto revolves around stablecoins and leverage.

## Calculating USD in the protocol is too messy, and even in Markets a bit messy
- Total Protocol USD is too hard because it aggregates many markets, of many different assets, and then must apply the USD price to each asset, and add them together.
  - This can't be done in the subgraph. It can be done with the right query, and an off-subgraph aggregator.
- Markets have the same problem, albeit less severe than Protocols. Since Protocol is just the aggregate of all its Markets.

## New mention about USD price
- For lifetime USD values, it is calculated at the moment. The reason for this is because it doesn't really make sense to just multiple the lifetime asset deposits by the current price when queried. If you deposit 1 ETH a day for 100 days, and it averaged 4000 USD a day, we should say you deposited 400,000 USD. Otherwise, let's say ETH crashed to 1000. Then we calculate with the live price, and you only deposited 100,000 USD. But you don't feel that way. 
- For current, it must be calculate as `priceUSD * asset`. We cannot add up USD values at each event. In the example above, it would should 400,000, when really you only have 100,000. 
- You can see a similar concept on Etherscan transactions. It will show you the USD value the moment of the transaction, but it will also provide you with the current USD value if you want.

## Counts of Events
- One day `graph-node` will have better aggregation queries, but for now the best way to get a count of events is to implement counters, which I have done for `Protocol`, `Market`, `Account`.

## Open Questions
- Credit delegation can be implemented by separating the `sender` of transactions apart from the `from` or `to`, and also tracking the function calls that create delegation. But, every protocol implements this differently, and some not at all.
  - The question is, how to implement this properly? It involves understanding how it works across all protocols and making sure that no events are screwed, as this can confuse the subgraph.
- Should gasPrice or transactionFee be included?
- How do Aave stable and variable debt tokens fit in here? Need to examine the code more.
- Should each protocol extend each event, such as `CompoundDeposit`, `AaveBorrow`, etc? It seems it might be worth it, but might add a lot of indexing time.
- How much historical data should be included? For example, a user's historical balance for borrows and deposits of their whole portfolio. This, of course would take a ton of indexing, such as how the uniswap.info subgraph takes a long time to sync. 
- Is there any existing Subgraph standard out there?
- Can we just filter queries for events like `Deposit` on entity types, and remove most usage of `@derivedFrom`?
  - In some places yes, like Market and Protocol because the query is straight forward.
  - But in Account , it is harder because of `to` and `from` both being used.
  - For now, we are leaving them in.

## Future Work
- Incorporate borrow and supply rates.
- Incorporate representations of collateral and debt, such as `cTokens` and `aTokens`. (Or decide to eliminate the idea completely).
- There is a possibility we could included CDP specific data in the future. But it might stay abstracted away from the Subgraph. TBD.
- Lifetime interest earned on Protocols and Markets
- Writing a test suite that confirms the numbers add up for lifetime values, split up and down the Accounts, Markets and Users. (NOTE - Might be able to use [Matchstick](https://www.youtube.com/watch?v=cB7o2n-QrnU&list=PLTqyKgxaGF3SNakGQwczpSGVjS_xvOv3h&index=1)).
  - It also makes me think, query time computation could calculate this. but it is always a battle of pre-compute vs. compute just-in-time.
