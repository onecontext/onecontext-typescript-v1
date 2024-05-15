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

#### Create a Knowledge Base 

A `Knowledge Base` is used to store your data. You can think of a `Knowledge Base` as a file store. 

```ts
const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
}

await OneContext.createKnowledgeBase(knowledgeBaseCreateArgs)
```

#### Create a Vector Index 
You can think of a `Vector Index` as a table in a vector database. 
```ts
const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = {
API_KEY: API_KEY,
vectorIndexName: vectorIndexName,
modelName: "BAAI/bge-base-en-v1.5"
}

await OneContext.createVectorIndex(vectorIndexCreateArgs)
```

#### Create an Index Pipeline

An `Index Pipeline` is a `Pipeline` that connects a `Knowledge Base` (above) to a `Vector Index` (above). When you add data to
a `Knowledge Base`, it automatically gets processed by any `Pipelines` that are connected to the `Knowledge Base`, and the resulting vectors get saved to the connected `Vector Indices`.

A `Pipeline` is an ordered collection of `Steps`, defined entirely in a YAML file. You can see examples of Pipeline YAML files in the `example_yamls` folder in this repo. A `Step` is an atomic unit of work in a `Pipeline`. Examples of `Steps` include "Chunker", "LexRank", "Retriever", etc.

When data is "processed" by a `Pipeline`, it means that the data is passed through each `Step` in the `Pipeline` in order. Each `Step` takes the output of the previous `Step` as input, and produces some output. The final output of the `Pipeline` is the output of the last `Step`.

For a full treatment of what exactly is a `Step`, `Pipeline`, `Knowledge Base`, `Vector Index`, etc, please see the [OneContext docs](https://docs.onecontext.ai/).

```ts

const indexPipelineCreateArgs: OneContext.PipelineCreateType = {
API_KEY: API_KEY,
pipelineName: indexPipelineName,
pipelineYaml: "example_yamls/index.yaml",
}

await OneContext.createPipeline(indexPipelineCreateArgs)
```

#### Create a (simple) Retriever Pipeline
We now create a `Retriever Pipeline`. A `Retriever Pipeline` is a `Pipeline` that is used to retrieve data from a `Vector Index` and output it to your application. 

(so, whereas an `Index Pipeline` processes data and saves it to a `Vector Index`, a `Retriever Pipeline` retrieves data from a `Vector Index` and outputs it to your application)

Here we first create a "simple" `Retriever Pipeline`. This pipeline is simple because it only has one `Step` in it, which is a `Retriever` `Step`. This retriever step just does a cosine similarity in the Vector Index and retrieves the most similar vectors to the input query. 
You can check out the specification of this `Retriever Pipeline` in the `example_yamls` folder in this repo, in the file "retrieve.yaml".

```ts
