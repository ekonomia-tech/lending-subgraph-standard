# Architecture
First, let's describe the stakeholders of this Subgraph Standard, so we can build out the architecture to optimally satisfy all of them. The stakeholders are:
- Subgraph developers (usually a member of a crypto protocol)
- Data analysts (crypto data companies like Messari, or traditional finance companies)
- Indexers
- Curators
- The Graph Foundation / Edge and Node / Streaming Fast / Other core teams

There are a few important architectural decisions that we need to come to consensus around:
- Should we deploy it as a single Subgraph? Or one Subgraph for each protocol?
- What should the base schema be for the lending protocols?
- How do we enable developers to build on top of the base schema? (Let's call them Peripheral Subgraphs for now).
- Where should this Subgraph code exist?
- How should it be documented.

Let's think about these questions from the angle of every stakeholder.

## Single Subgraph or Multiple Individual Subgraphs
- I would like to enable both, by having the repo setup for Single Subgraphs, and then having a script to combine them all into one subgraph manifest to deploy it together. Let's list the benefits to stakeholders below.
- Multiple Individual Subgraphs Benefits:
  - Makes it easier for users to fork the subgraph to add entities.
  - It will sync way faster.
  - It will allow a subgraph developer to come along and think only in the perspective of their subgraph.
- Single Subgraph Combined:
  - An unexplored opportunity in The Graph is cross-protocol Subgraphs. It highlights to power of Subgraphs as Open APIs. A Subgraph can be an API into a single protocol, a single account, or multiple protocols, or anything else you can think of. However, 95% of people only think of Subgraphs as a view into a single protocol - and this is likely due to how early we still are. Most subgraphs are purpose built for front ends, created by a single dev or dev team. This would provide awareness and marketing for The Graph / Subgraphs.
  - A general subgraph that can aggregate all lending data is a beautiful thing. In data science there is an term EXTRACT, TRANSFORM & LOAD (ETL). A general subgraph removes the EXTRACT and TRANSFORM and leaves just the LOAD (i.e. writing queries and loading into their DB) for a data analyst to do.
  - It is likely that a Subgraph of this size will take +2 weeks to sync. But when the [Fire Hose](https://github.com/streamingfast/firehose) upgrade is ready, this would be a perfect subgraph to test the limits of the indexing speed. 
  - We should be thinking about this in terms of the The Graph Decentralized Network. It is good for multiple reasons:
    - Core teams benefit by being able to test the economics of query fees on the decentralized network, test the indexing speed against a massive subgraph, and marketing for the protocol at large.
    - Indexers lives are easier as they only need to index 1 Subgraph. More queries for a single subgraph. Less transactions and mental overhead for the indexers (ETH is expensive for them to stake on a subgraph).
    - It makes curators lives easier as well as they need to discover less subgraphs.

The script should simply be a typescript file which combines all manifests into a single manifest, and deploys the subgraph. It will be executed with a node script in `package.json`.

Note - ultimately, as one big subgraph or as many small subgraphs - it is a decision of how to split up the indexing work. Example:
- If you create one big subgraph, you do all the indexing work ahead of time, and you require the Subgraph Developer to build the Subgraph to include all protocols.
- If you create many small subgraphs, you parallelize the indexing, but push the work out to Indexers, Curators, and Data Analysts to determine how to aggregate all the data. 

In both cases, queries must be written by the consumers in the end. Neither is right or wrong. What ultimately decides the usefulness of a Subgraph is how many queries it receives in the decentralized network.

## What should the base schema be for the lending protocols?
Some basic guidelines:
- It should be simple enough for a traditional finance data scientist to read the schema and query it and fully understand what is going on. No blockchain experience required.
- But it should be descriptive enough so that someone can get useful information out of it. Hence why it revolves around lending, and we need to standardize lending nomenclature.

Other than that, we need to come to consensus on the fields and the entities. We need to consider it from all angles. The existing schema is just a starting point. Input from all teams will be valuable. This is quite a subjective process, so let's hear each other out and consider all opinions.

## How to create Peripheral subgraphs
I have some current thoughts, but I am open to other suggestions:
- Each protocol has it's own folder in `/subgraphs`. 
- When someone wants to create a version with new entities in the schema, they should fork this repo, and create the schema locally in their fork.
- They can then deploy the Subgraph on their own account at will.

## Where should this Subgraph code exist?
I think it is okay under `davekaj` right now. But I would think it belongs under some organization in the future. Some sort of "DeFi Working Group". But I think we should delay thinking about this for now.

## How should it be documented?
This Subgraph should set a precedence for how community-collaborated subgraphs should be built. Here are some thoughts:
- The schema needs to be extremely well documented, with comments for every field. This helps data analysts who then do not have to analyze the mapping code at all to understand what the data is.
- The mappings should also be well documented. 
- Details of architecture and design decisions should be provided
- Details of current limitations should also be provided. This might be something like indexing speed, price oracles, or fields being left out due to query time computation not being available.

## Conclusion
Feedback on all of this is welcome, and we will discuss it in the video call meeting on Thursday, February 24th.