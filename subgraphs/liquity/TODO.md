# TODO

## Initialize the repo feature branch:

- [ ] Create a new feature branch from main: sp/liquity-subgraph


### Understanding the Schema:
-  [ ] Understand the schema through and through. Then I will understand what entities I need to populate that fit within the liquity framework.
    - Comment within a copy of the schema for your own reference.

- [ ] Create a new subdirectory for its subgraph that will contain its: manifest, src folder (mappings), abis, and maybe contracts and a README --> use the README to outline TODOs and other important notes about it. Add TODO.md into .gitignore
    - [ ] Create these files by going through the quick start on the graph hosted service.
        - [ ] Going to need: the initial data source contract for Liquity to use to initialize the subgraph manifest.

### Post Schema Understanding:

    - Outline what contracts will likely need to be added after the fact.
    - I think these can be added at some other point.
- [ ] We need contracts that will have events, view functions, and possibly other functions within it (through bind) that we would need to populate the schema. 
    - LendingType: CDP
    - RiskType: liquity has both of these, because the global TCA is taken into account and activates different scenarios... Hmm how do I capture that? 


### Extra Notes

**Protocol Liquidations and Close Factor**

Liquity uses the stability pool as the first line of defence when it comes to paying off debt in 'at-risk' ICA troves. When one opens a trove, they pay a deposit that compensates the liquidator with 200 LUSD). The liquidator also gets 0.5% of the Trove's collateral as reward for this service. Wow.

The close factor is therefore: 100%, since all debt can be paid off when liquidation occurs, and it is paid off.

The liquidation is paid off by the stability pool, then if there is any more remaining debt, it is spread amongst active troves though.

**Liqudation Incentive**

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

**Smart Contracts**

The main three smart contracts involved are:

1. BorrowerOperations.sol
2. StabilityPool.sol
3. TroveManager.sol

These three contracts carry out the bulk of the creation of troves, records of individual accounts debts, ICRs, etc. They work with eachother to control Trove state updates and movements of Ether and LUSD tokens within the system.

Note: LUSD is never transferred to LUSD contracts aside from through the stability pool contract. Otherwise, they are minted or burnt in accordance to operations throughout the protocol.

*BorrowerOperations.sol:*

- Basic operations borrowers use to interact with their Trove: trove creation, eth top-up / withdrawal, stablecoin issuance and repayment.
- Sends issuance fees to LQTYStaking.sol (those staking LQTY get the issuance fees, aka borrow fees)
- This contract calls TroveManager.sol, which updates the actual Trove state.
- Calls into various pools too to instigate the movement of Ether/Tokens btw pools, AND btw pools and users.

*TroveManager.sol:*

- Liquidations and redemption functions are in here.
- Sends redemption fees to LQTYStaking contract.
- Has state of each Trove (collateral and debt)
- Does not hold value in this contract
- Calls into various pools to instigate movement of Ether/tokens between pools.

*LiquityBase.sol:*

- Parent contract LiquityBase containing global constants and some common functions.

*StabilityPool.sol:*

- Functions for stability pool operations: deposits, withdrawals of compounded deposits and accumulated ETH and LQTY gains.  <-- SP providers gets LQTY (inflationary) and ETH (liquidation) rewards.
- Holds LUSD deposits and ETH gains for depositors (from liquidations).

*LUSDToken.sol:*

- Implements ERC20 standard and EIP-2612 and mechanism blocking direct transfers to addresses: address(0) and StabilityPool.

*SortedTroves.sol:*

- Stores addresses of Trove owners, sorted by ICR in ascending order. 
- Only updates when positions are adjusted via addition or reduction in collateral or debt quantity. The lowering or increase in ICR that occurs through market fluctuations for collateral (ETH) influences all of the Troves, therefore sorted lists to not need to be adjusted when those events occur.

*PriceFeed.sol:*

- Has functions for getting current ETH:USD price that system uses for calculating colalteralization ratios. **Uses Chainlink, with Tellor as backup**

*HintHelpers.sol:*

- Read-only functionality for calculation of hints for borrower operations and redemptions.

*StabilityPool.sol:*

- Holds Ether and/or tokens for respective parts of protocol. 

*ActivePool.sol:*

- Holds Ether balance and records total stablecoin debt of active Troves.

*DefaultPool.sol:*

- Transitory holding place for Ether and LUSD records (debt) from liquidations to be distributed to active Troves. So when a liquidation occurs, the Ether is sent here from the liquidated Trove to be then moved through the call of BorrowerOperations.sol or TroveManager.sol via redemption or liquidation function calls. These will then give the active Troves ttheir pending ether/debt "rewards" that are in the DefaultPool.sol

*CollSurplusPool.sol:*

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
- 