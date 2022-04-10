# 👀 README

This subgraph focuses on recording pertinent data as per the "Lending Subgraph Standard." _See references for further information on the concept and public good initiative_.

### 📝 Some notes to consider when looking over this repo as this is a WIP:

- Schema is still a WIP for overall lending standard subgraph
  - Therefore the schema will adapt as more lending protocols are included within this comprehensive subgraph showcasing accounts that having lending-related on-chain activity.

### 💧 Liquity-Specific Notes:

Subgraph entities are primarily updated through leveraging: `Event TroveUpdated()` and `Event TroveLiquidated()` that are called in `BorrowerOperations.sol` and `TroveManager.sol`, respectively.

**Liquidation**

- Recovery mode: there are different functions called depending on whether recovery or normal mode is enacted within the Liquity protocol.
  - `event TroveLiquidated` and `TroveUpdated` are emitted after each successful liquidation function call.
  - Rewards (shared pro-rata liquidation rewards from previous liquidated troves shared amongs active troves if SP cannot support those liquidations first) are distributed to the respective to-be-liquidated-account prior to liquidation. This way the actual totals on the subgraph for each respective AccountInProtocol (acp) and AccountInMarket(acm) will be updated properly / should reflect the on-chain data.
    - This note is important because accounts are created from handling the `TroveUpdated` event. When these events are emitted, it is logical to question whether or not rewards accumulated throughout the protocol for that respective account are actually somehow accounted for within the subgraph. As long as that happens, then when liquidations occur, we will not end up with differeing LUSD and ETH totals within the protocol, acp, and acm entities.
- Redemptions also are covered within this subgraph, without the need of extra code in the mappings files atop those used within `TroveUpdated` event hanlder functions within `BorrowingOperations` and `TroveLiquidated` event within `TroveManager.sol`
  - Redemptions can be seen to update the subgraph, since our mappings focus on leveraging `emit TroveUpdated()` and that event is emitted within inherent function `_redeemCollateralFromTrove()` within `TroveManager.sol` that occurs during a redemption scenario!

## ✏️ Glossary (WIP)

**Redemption:** An account redeeming LUSD for ETH, at face value. Face-value swapping (redemption) of LUSD for ETH is a key component of this protocol and would occur likely automatically via arbitrage bots monitoring markets.

**Recovery Mode:**

**Normal Mode:**

## TODO:

**TroveManager.ts:**

- [ ] FINALLY, update the person who liquidated the account, do that through callHandler on liquidated-related functions. Based on last review of contracts, there is no event outlining the ext. address of the liquidator.
- [ ] Find agreement between what is `xTokenAmount` and what is `amount` in `Event entity`

**BorrowerOperations.ts:**

- [ ] We may need to signify the event ID somehow to discern two `internal events` happening within a single `emit event` as seen around lines 63 for `'openTrove'` scenario, but that requires changing the schema. The additional concats are temporary.

- [ ] _old note from before that may not be applicable:_ possibly need to look at `withdrawLUSD()` scenario where debt is increased, assuming normal mode here and fee is added and if `'recovery'` mode would be situated in this. (borrowAmount > previousDebt)

**Helper Functions:**

- [ ] `protocol.priceOracle = null` --> Update this as Liquity uses chainlink and something else as their backup. Are we recording backup priceOracles?

**General Subgraph Standard Suggestions and Thoughts/Changes:**

- [ ] I think that capturing fees paid for a lending protocol is of interest in a lending protocol standard. For the purposes of our subgraph it is not important though.
- [ ] Add a `'CLOSE'` option to the `eventType` field to `Event` entity
- [ ] Not sure if I should 'xTokenAmount' for LUSD, or just use 'Amount' in schema for collateral and debt _occurs in both `BorrowerOperations.t`s and `TroveManager.ts`_
- [ ] `account.ts:` Update acp totals like lifetimeDepositedUSD when we figure out how to best adjust respective token and its USD price at that point in time. I'll leave them as commented out updates though in my mapping.

## 👴🏼 Extra Reference Notes

These are some of the rough notes that I took when looking through the Liquity docs and smart contracts.

<details markdown='1'><summary>Notes</summary>

### Extra Notes

**Protocol Liquidations and Close Factor**

The close factor is therefore: 100%, since all debt can be paid off when liquidation occurs, and it is paid off.

The liquidation is paid off by the stability pool, then if there is any more remaining debt, it is spread amongst active troves though.

**Liquidation Incentive**

The liquidator gets 0.5% of the liquidated Trove's collateral. That is pretty good. + 200 LUSD.
--> is liquidationIncentive seen as a discount percentage of the position's collateral, or...?

All in all, we have several entities to populate, of which include:

1. Protocol itself
2. Assets involved (liquity, it's just LUSD, and ETH)
3. Market (Liquity: just the summation of the total protocol)
4. Account (holistic across all lending protocols in subgraph)
5. AccountInProtocol (specific protocol)
6. AccountInMarket (specific market)
7. Event (storage of all events that have occurred relevant to reputation score subgraph)

Of these entities, some quick questions:

1. Where does the price conversion come from for USD from lending and borrowing assets at event emission time?

---

Now, I just need to look through the smart contracts and find out which one is the main contract. I have a holistic understanding and just need to skim over SCs for 1-2 hours and then set up the subgraph itself. From there I can start to stub out what needs to be done in the mapping to populate the subgraphs. Get it working, then start to clean it up.

# **Smart Contracts**

The main three smart contracts involved are:

1. BorrowerOperations.sol
2. StabilityPool.sol
3. TroveManager.sol

These three contracts carry out the bulk of the creation of troves, records of individual accounts debts, ICRs, etc. They work with eachother to control Trove state updates and movements of Ether and LUSD tokens within the system.

Note: LUSD is never transferred to LUSD contracts aside from through the stability pool contract. Otherwise, they are minted or burnt in accordance to operations throughout the protocol.

## _BorrowerOperations.sol:_

- Basic operations borrowers use to interact with their Trove: trove creation, eth top-up / withdrawal, stablecoin issuance and repayment.
- Sends issuance fees to LQTYStaking.sol (those staking LQTY get the issuance fees, aka borrow fees)
- This contract calls TroveManager.sol, which updates the actual Trove state.
- Calls into various pools too to instigate the movement of Ether/Tokens btw pools, AND btw pools and users.

### More Detail:

## _TroveManager.sol:_

- Liquidations and redemption functions are in here.
  **- `liquidate()`, `setAddresses()`, `batchLiquidateTroves()`, `redeemCollateral()` are all the external / public functions that kick off major scenarios. All the other external functions are helpers or view functions**
  - Events:
- Sends redemption fees to LQTYStaking contract.
- Has state of each Trove (collateral and debt)
- Does not hold value in this contract
- Calls into various pools to instigate movement of Ether/tokens between pools.

### More Detail:

- address mapping and structs are used to store Trove data
- Good comment in the beginning of the code defining `L_ETH` and `L_LUSDDebt` which are the accumulated **liquidation** rewards per unit staked.
- updateTroveRewards() updates a mapping of each **Active** trove's RewardSnapshots (which are structs consisting of a trove's total L_ETH and L_LUSD). From there, the actual rewardsPerUnitStaked is calculated based off of the respective liquidation reward asset multiplied by the stake of the Trove at the time.
- `_movePendingTroveRewardsToActivePool()` actually moves / changes the records of ETH and debt, respectively to the activePool contract from the defaultPool contract. The records of each Trove are managed by the `TroveManager.sol` where the mapping of structs is updated accordingly.
- `_sendGasCompensation()` takes care of sending the gas LUSD put aqside for liquidators. Although I am confused about where the 0.5% of the liquidated Trove is in the function calls. It's supposed to go to the liquidator.

## _LiquityBase.sol:_

- Parent contract LiquityBase containing global constants and some common functions.

## _StabilityPool.sol:_

- Functions for stability pool operations: deposits, withdrawals of compounded deposits and accumulated ETH and LQTY gains. <-- SP providers gets LQTY (inflationary) and ETH (liquidation) rewards.
- Holds LUSD deposits and ETH gains for depositors (from liquidations).

## _LUSDToken.sol:_

- Implements ERC20 standard and EIP-2612 and mechanism blocking direct transfers to addresses: address(0) and StabilityPool.

## _SortedTroves.sol:_

- Stores addresses of Trove owners, sorted by ICR in ascending order.
- Only updates when positions are adjusted via addition or reduction in collateral or debt quantity. The lowering or increase in ICR that occurs through market fluctuations for collateral (ETH) influences all of the Troves, therefore sorted lists to not need to be adjusted when those events occur.

## _PriceFeed.sol:_

- Has functions for getting current ETH:USD price that system uses for calculating colalteralization ratios. **Uses Chainlink, with Tellor as backup**

## _HintHelpers.sol:_

- Read-only functionality for calculation of hints for borrower operations and redemptions.

## _StabilityPool.sol:_

- Holds Ether and/or tokens for respective parts of protocol.

## _ActivePool.sol:_

- Holds Ether balance and records total stablecoin debt of active Troves.

## _DefaultPool.sol:_

- Transitory holding place for Ether and LUSD records (debt) from liquidations to be distributed to active Troves. So when a liquidation occurs, the Ether is sent here from the liquidated Trove to be then moved through the call of BorrowerOperations.sol or TroveManager.sol via redemption or liquidation function calls. These will then give the active Troves ttheir pending ether/debt "rewards" that are in the DefaultPool.sol

## _CollSurplusPool.sol:_

- Holds ETH surplus from Troves that were redeemed against. These will go back to the respective owning borrower when told to do so from BorrowerOperations.sol
- Also holds ETH surplus from Troves with ICR > MCR that were liquidated in Recovery Mode.

TODO: NOTE - Going to have to take care of odd edge cases in later updates. For now just take care of those that are the basic scenarios:

Normal Mode:

- Creation of Trove (LUSD-debt and Collateral-ETH)
- Update of Trove
- Liquidation of Trove
  - Straight liquidation of Trove because it was below 110% ICR
- Redeeming LUSD for Collateral from protocol (thereby liquidating Trove)
- Providing to Stability pool

  - This is important to the system and could be seen as a good credit move? It's peripheral... I suppose it is the same as providing money as a lender within Compound and Aave.
  - Arguably, provision of collateral is similar to being a lender. In COMP and AAVE, you supply collateral, get an `internal token` and then choose to borrow from whatever lending pools are available. Then you create a borrow position. They keep track of your borrow position, but not necessarily your CDP.
    - So that's the big difference. Lending and borrowing are decoupled aspects in Pool-type lending protocols. Whereas they are coupled within CDP-type lending protocols.
  - The other way you 'lend' to the protocol, is through providing LUSD to stability pools. When you do that... you are giving a backstop to the protocol when liquidations occur. You essentially are maintaining the protocol to have ICR of 110%. The CDPs are wiped when they are liquidated, the 10% or so is given to stability providers, the 100% left can be redeemed by the borrower that got liquidated, and then the protocol is left at an even amount of ETH to LUSD at the very least. If the LUSD was < 1 USD, then fees are increased to deter more borrowing, and redemption fees are increased too to deter more redemption. This maintains the system to keep the ability of redeeming LUSD 1:1. When LUSD > 1, people will just take CDPs and then convert their LUSD to another stable coin for arbitrage opportunities. Ceiling of 110% is seen though naturally.

 </details>
