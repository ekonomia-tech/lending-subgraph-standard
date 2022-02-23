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
## Priority of implementing the Subgraph
- Events and Counts first - as they are straight forward. Test the indexing speed here (and at the next steps).
- Then do all the required stuff - real asset amounts held by accounts and protocols.
- Then USD because it will be complicated and it will be nice to have before the Lifetime aggregation.
- Then do Lifetime aggregation amounts.
