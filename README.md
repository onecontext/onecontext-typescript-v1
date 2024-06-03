# Official OneContext TypeScript SDK
This is the official TypeScript SDK for the OneContext platform. Use this SDK to connect your Node backend applications, Node CLI tools, and front-end WebApps to OneContext's platform.

## What is OneContext?
OneContext is a platform that enables software engineers to compose and deploy custom RAG pipelines on SOTA infrastructure. You define the pipeline in YAML, and OneContext takes care of the rest of the infra (SSL certs, DNS, Kubernetes cluster, GPUs, autoscaling, load balancing, etc).

## Where can I learn more?
Check out our [docs](https://docs.onecontext.ai) for a in-depth treatment of how our platform works!

## Sounds great. How do I get started?

### General Set Up 

#### Get the SDK from npm
```zsh
npm install @onecontext/sdk
```
#### API Key

Access to the OneContext platform is via an API key. If you already have one, great, pop it in an .env file in the root
of your project, or export it from the command line as an environment variable.

If you've misplaced your API key, you can rotate your existing one [here](https://onecontext.ai/settings). 

If you've never had an API key before, we'd recommend you check out the quickstart section below: 

### Quickstart 

If this is your first time using OneContext, check out the below quickstart to get familiarised with the library. We'll
take you through how to set up an API key and the main things you can do with OneContext. You can also check
out our [Python SDK](https://github.com/onecontext/onecontext-python), and our [CLI tool](https://github.com/onecontext/onecontext-cli).
.
If you don't know what you're doing (yet), and want to play around with the library first, before you sign up, then follow the quick-start guide below.

#### Clone this repo 

Clone this repo. Change directory into the "quickstart" directory. In there, you'll find a file called `quickstart.ts`.
It's full of examples of things you can do with OneContext. It also has an example tsconfig.json that works well
straight out of the box (top-level await, etc.).
```zsh
git clone https://github.com/onecontext/onecontext-typescript
```
Change directory into the quickstart directory of the repo.
```zsh
cd onecontext-typescript/quickstart
```
Install the dependencies. This will automatically install the SDK for you.
```zsh
npm install
```
Jump back out of there. From now on, we'll run commands from the root of the repo.
```zsh
cd .. 
```

#### Get an API Key 
As in the general set up, you can get an API key [here](https://onecontext.ai/settings). It comes with 2,500 free credits to get you started.

#### Pop your API key in an .env file in the root of the repo (i.e. in the same directory as the package.json)
```ts
touch .env
```
Add your API key to this .env file like so:
```dotenv
API_KEY=your_api_key_here
```

## Play around

In the `quickstart` folder, you'll find a file called `quickstart.ts`. This file is full of examples of things you can do with the OneContext SDK.

### `quickstart/quickstart.ts` has a lot of examples to get you started
Let's go through what's going on in this file below.

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
const simpleRetrieverPipelineName: string = "demoSimpleRetrieverPipeline"
const involvedRetrieverPipelineName: string = "demoInvolvedRetrieverPipeline"
```

#### Create a `Knowledge Base`

A `Knowledge Base` is used to store your data. You can think of a `Knowledge Base` as a file store.

```ts
const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = OneContext.KnowledgeBaseCreateSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName
})

OneContext.createKnowledgeBase(knowledgeBaseCreateArgs).then((res) => {console.log(res)})
```

#### Create a `Vector Index`
You can think of a `Vector Index` as a table in a vector database.
```ts
const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = OneContext.VectorIndexCreateSchema.parse({
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName,
  modelName: "BAAI/bge-base-en-v1.5"
})

OneContext.createVectorIndex(vectorIndexCreateArgs).then((res) => {console.log(res)})
```

#### Create an `Index Pipeline`

An `Index Pipeline` is a `Pipeline` that connects a `Knowledge Base` (above) to a `Vector Index` (above). When you add data to
a `Knowledge Base`, it automatically gets processed by any `Pipelines` that are connected to the `Knowledge Base`, and the resulting vectors get saved to the connected `Vector Indices`.

A `Pipeline` is an ordered collection of `Steps`, defined entirely in a YAML file. You can see examples of Pipeline YAML files in the `example_yamls` folder in this repo. A `Step` is an atomic unit of work in a `Pipeline`. Examples of `Steps` include "Chunker", "LexRank", "Retriever", etc.

When data is "processed" by a `Pipeline`, it means that the data is passed through each `Step` in the `Pipeline` in order. Each `Step` takes the output of the previous `Step` as input, and produces some output. The final output of the `Pipeline` is the output of the last `Step`.

For a full treatment of what exactly is a `Step`, `Pipeline`, `Knowledge Base`, `Vector Index`, etc, please see the [OneContext docs](https://docs.onecontext.ai/).

```ts
const indexPipelineCreateArgs: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: indexPipelineName,
  pipelineYaml: "./quickstart/example_yamls/index.yaml",
})

OneContext.createPipeline(indexPipelineCreateArgs).then((res) => {console.log(res)})


```

#### Create a (simple) `Retriever Pipeline`
We now create a `Retriever Pipeline`. A `Retriever Pipeline` is a `Pipeline` that is used to retrieve data from a `Vector Index` and output it to your application.

(so, whereas an `Index Pipeline` processes data and saves it to a `Vector Index`, a `Retriever Pipeline` retrieves data from a `Vector Index` and outputs it to your application)

Here we first create a "simple" `Retriever Pipeline`. This pipeline is simple because it only has one `Step` in it, which is a `Retriever` `Step`. This retriever step just does a cosine similarity in the Vector Index and retrieves the most similar vectors to the input query.
You can check out the specification of this `Retriever Pipeline` in the `example_yamls` folder in this repo, in the file "retrieve.yaml".

```ts
const simpleRetrieverPipeline: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: simpleRetrieverPipelineName,
  pipelineYaml: "./quickstart/example_yamls/retrieve.yaml",
})

OneContext.createPipeline(simpleRetrieverPipeline).then((res) => {console.log(res)})

```

#### Create a more involved `Retriever Pipeline`
Let's also create a more complicated retriever pipeline. We can easily compare and contrast the results later on.

The specification for this pipeline is in the file "retrieve_filter_and_rerank.yaml" in the `example_yamls` folder in this repo.

This pipeline has three steps in it: a `Retriever` step, a `FilterInMemory` step, and a `Reranker` step. The `Retriever` step
retrieves the most similar vectors to the input query, the `FilterInMemory` step only passes through vectors which score more than 0.5 on the `LexRank Percentile Score` (this was added to the vectors by the `LexRank` step in the `Indexing Pipeline`). Finally,
the `Reranker` step passes the resultant vectors through a `ReRanker` model, which is a special machine learning model which re-ranks vectors for relevancy to a query.

For more on `ReRanker` models, see the [OneContext docs](https://docs.onecontext.ai/).

```ts
const involvedRetrieverPipelineCreateArgs: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: involvedRetrieverPipelineName,
  pipelineYaml: "./quickstart/example_yamls/retrieve_filter_and_rerank.yaml",
})

OneContext.createPipeline(involvedRetrieverPipelineCreateArgs).then((res) => {console.log(res)})

```

#### Upload a directory of files related to Charlie Munger to the `Knowledge Base`

We'll include a metadataJson field to tag them with the tag "charlie_munger". This can be useful later as we can filter on metadata when we want to retrieve these files.

```ts
const uploadDirectoryArgsLongForm: OneContext.UploadDirectoryType = OneContext.UploadDirectorySchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "./quickstart/demo_data/long_form/",
  metadataJson: {"tag": "longForm"}
})

OneContext.uploadDirectory(uploadDirectoryArgsLongForm).then((res) => {console.log(res)})

```

#### Upload another directory of files related to Machine Learning to the same `Knowledge Base`

We could also of course have created a different `Knowledge Base` for this data if we wanted to. For ease, let's just upload to the same `Knowledge Base` and we'll tag these files with a different tag.

```ts
const uploadDirectoryArgsML: OneContext.UploadDirectoryType = OneContext.UploadDirectorySchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "./quickstart/demo_data/machine_learning/",
  metadataJson: {"tag": "machine_learning"}
})

OneContext.uploadDirectory(uploadDirectoryArgsML).then((res) => {console.log(res)})


```
#### You can also just upload one file at a time 

```ts
const uploadFileArgs: OneContext.UploadFilesType = OneContext.UploadFilesSchema.parse({
API_KEY: API_KEY,
knowledgeBaseName: knowledgeBaseName,
file: "./quickstart/demo_data/instruct_gpt.pdf",
metadataJson: {"tag": "longForm"}
})

OneContext.uploadFiles(uploadFileArgs).then((res) => {console.log(res)})
```


#### List all the currently running `Pipelines`

Here we are only listing the latest 10 pipelines initiated in the last week.

```ts
const runResultsArgs: OneContext.RunResultsType = OneContext.RunResultsSchema.parse({
  API_KEY: API_KEY,
  limit: 10,
  sort: "date_created",
  dateCreatedGte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
})

OneContext.getRunResults(runResultsArgs).then((res) => {console.log(util.inspect(res,{showHidden: false, colors: true}))})


```

#### We can also view the files which are in a particular `Knowledge Base`

```ts
const listFilesArgs: OneContext.ListFilesType = OneContext.ListFilesSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
})

OneContext.listFiles(listFilesArgs).then((res) => {console.log(res)})
```

#### See any files you don't want in the `Knowledge Base`? Delete them. You can pass a list of strings as file names.

```ts 
const deleteFileArgs: OneContext.DeleteFilesType = OneContext.DeleteFilesSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  fileNames: ["instruct_gpt.pdf"]
})

OneContext.deleteFiles(deleteFileArgs).then((res) => {console.log(res)})
```

#### Run the "simple" retriever pipeline to query the vector index (full of embeddings of the above files) for the most relevant chunks to a given query.

```ts
const simpleRetrieverPipelineRunArgs: OneContext.RunType = OneContext.RunSchema.parse({
  API_KEY: API_KEY,
  pipelineName: simpleRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
})

OneContext.runPipeline(simpleRetrieverPipelineRunArgs).then((res) => {console.log(util.inspect(res, {showHidden: true, colors: true}))})
```

#### Run the more "involved" retriever pipeline to first query the vector index, then filter for embeddings with a relevancy score of > 0.5, and finally rerank the results using a reranker model.

This pipeline will take longer to run, but should give better results. We can compare and contrast these results between the two pipelines.

For more on LexRank and how it works, read our [docs!](https://docs.onecontext.ai/)

```ts 
const involvedRetrieverPipelineRunArgs: OneContext.RunType = OneContext.RunSchema.parse({
  API_KEY: API_KEY,
  pipelineName: involvedRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
})

OneContext.runPipeline(involvedRetrieverPipelineRunArgs).then((res) => {console.log(util.inspect(res, {showHidden: true, colors: true}))})
```

#### When you're finished with the `Knowledge Base`, you can delete it. This will delete all the data in the `Knowledge Base`, along with any chunks, and embeddings connected to it.

```ts 
const knowledgeBaseDeleteArgs: OneContext.KnowledgeBaseDeleteType = OneContext.KnowledgeBaseDeleteSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName
})

OneContext.deleteKnowledgeBase(knowledgeBaseDeleteArgs).then((res) => {console.log(res)})
```

#### You can also delete the `Vector Index`. It will already have no data in it (as the chunks and embeddings were cascade deleted after you deleted the `Knowledge Base` above), but it's good practice to delete it anyway.

```ts 
const vectorIndexDeleteArgs: OneContext.VectorIndexDeleteType = OneContext.VectorIndexDeleteSchema.parse({
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName
})

OneContext.deleteVectorIndex(vectorIndexDeleteArgs).then((res)=>{console.log(res)})
```

#### Finally, we can delete the `Pipelines` we created. Again, no real need to, but for the sake of ending the example, we'll delete them. 

```ts 
const pipelineDeleteList: Array<OneContext.PipelineDeleteType> = [
  OneContext.PipelineDeleteSchema.parse({API_KEY: API_KEY, pipelineName: "demoIndexPipeline"}),
  OneContext.PipelineDeleteSchema.parse({API_KEY: API_KEY, pipelineName: "demoSimpleRetrieverPipeline"}),
  OneContext.PipelineDeleteSchema.parse({API_KEY: API_KEY, pipelineName: "demoInvolvedRetrieverPipeline"}),
]

pipelineDeleteList.forEach((pipe) => {
  OneContext.deletePipeline(pipe).then((res) => {
    if (res.ok)
    {console.log(`Deleted pipeline ${pipe.pipelineName} successfully`)}
  })
})
```
  

