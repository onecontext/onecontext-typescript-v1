# Official OneContext TypeScript SDK
This is the official TypeScript SDK for the OneContext platform. Use this SDK to connect your Node backend applications, Node CLI tools, and front-end WebApps to OneContext's platform. 

## What is OneContext?
OneContext is a platform that enables software engineers to compose and deploy custom RAG pipelines on SOTA infrastructure. You define the pipeline in YAML, and OneContext takes care of the rest of the infra (SSL certs, DNS, Kubernetes cluster, GPUs, autoscaling, load balancing, etc).

## Where can I learn more about how it works?
Check out our docs page [here](https://docs.onecontext.ai/). The below examples will also help you get started, but they are intended as a quickstart, rather than a fundamental overview of the platform.

## Sounds great. How do I get started?
If you've already read the docs, or are just keen to learn by doing, you can follow the below steps to get started with the SDK in minutes.

## Setup

### Install the SDK

#### Get it from npm (recommended)

```zsh
npm install @onecontext/sdk
```

### Get an API key
You can get an API key [here](https://onecontext.ai/settings)

### Clone the [quickstart repo](https://github.com/onecontext/ts_sdk_quickstart) 
Clone the repo with the quickstart code. It's the fastest and easiest way to get started. Not only does it have a bunch of examples, but it also has an example tsconfig.json that works well straight out of the box.
```zsh
git clone https://github.com/onecontext/ts_sdk_quickstart
```
Change directory into the quickstart repo.
```zsh
cd ts_sdk_quickstart
```
Install the dependencies.
```zsh
npm install
```

### Pop your API key in an .env file in the root of the quickstart project
```ts
touch .env
```
Add your API key to this .env file like so:
```dotenv
API_KEY=your_api_key_here
```

## Play around 

### `quickstart.ts` has a lot of examples to get you started 
Let's go through some of the examples in the `quickstart.ts` file below.

#### First load your API key as an env variable
```ts
// Create a .env file and add your API_KEY 
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: __dirname + '/../.env'});

// Load the API key from the environment and make sure it's present
const API_KEY: string = process.env.API_KEY!;
```

#### Define some global variables which we'll use later 
```ts
const knowledgeBaseName: string = "demoKnowledgeBase" 
const vectorIndexName: string = "demoVectorIndex"
const indexPipelineName: string = "demoIndexPipeline"
const simpleRetrieverPipelineName: string = "simpleDemoRetrieverPipeline"
const involvedRetrieverPipelineName: string = "involvedDemoRetrieverPipeline"
```

#### Create a Knowledge Base (think of this as a file store) 

Knowledge Bases are used to store your data. They get connected (via pipelines) to vector indices (which are basically
just tables in a vector database). When you add data to a knowledge base, it automatically gets processed by the
connected pipeline, and the resulting vectors get stored in the connected vector index.

```ts
const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
}

await OneContext.createKnowledgeBase(knowledgeBaseCreateArgs)
```

#### Create a Vector Index (think of this as a vector database)
You'll connect this (via a pipeline) to your Knowledge Base in a moment. 
```ts
const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = {
API_KEY: API_KEY,
vectorIndexName: vectorIndexName,
modelName: "BAAI/bge-base-en-v1.5"
}

await OneContext.createVectorIndex(vectorIndexCreateArgs)
```

