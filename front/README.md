# Metavote - Allow any project to bootstrap liquidity through staking on Meta Pool.
This prject contains an implementation of the front-end and NEAR protocol interaction via RPC API.


**Prerequisites**
In order to interact with the smart contract, we need it deployed. Once you have it, copy the smart contract account Id that we are going to use on the Dapp.
Metavote needs to interact with Metapool smart contract to fetch specific data, eg stNEAR price.


## Environment Setup

### Local Environment Setup
1. clone this repo locally
```bash
git clone https://github.com/Narwallets/meta-vote

```
2. install dependencies
```bash
yarn
```

````
3. run the development server
```bash
npm run dev
# or
yarn dev
```

### DEV Environment Setup
1. clone this repo locally (skip if already done on local env setup)
```bash
git clone ...
```
2. install dependencies (skip if already done on local env setup)
```bash
yarn
```
3. deploy
```bash
vercel
```
4. add CONTRACT_ID and METAPOOL_CONTRACT_ID env variables
```bash
vercel env add NEXT_PUBLIC_CONTRACT_ID 
vercel env add NEXT_PUBLIC_METAPOOL_CONTRACT_ID
vercel env add NEXT_PUBLIC_META_CONTRACT_ID

```

### DEV Production Setup
1. clone this repo locally (skip if already done on local/dev env setup)
```bash
git clone ... 
```
2. install dependencies (skip if already done on local/dev env setup)
```bash
yarn 
```
3. deploy
```bash
vercel --prod
```
4. add CONTRACT_ID env variable (skip if already done on dev env setup)
```bash
vercel env add NEXT_PUBLIC_CONTRACT_ID
vercel env add NEXT_PUBLIC_METAPOOL_CONTRACT_ID
```
