import * as OneContext from "@onecontext/ts_sdk"
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 


// Create a .env file and add your API_KEY 
dotenv.config({path: __dirname + '/../.env'});

// make sure the env variables are being read correctly and instantiated as global variables
const API_KEY: string = process.env.API_KEY!;

const knowledgeBaseName: string = "demoKnowledgeBase" 
const vectorIndexName: string = "demoVectorIndex"
const indexPipelineName: string = "demoIndexPipeline"
const simpleRetrieverPipelineName: string = "simpleDemoRetrieverPipeline"
const involvedRetrieverPipelineName: string = "involvedDemoRetrieverPipeline"

const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
}

await OneContext.createKnowledgeBase(knowledgeBaseCreateArgs)

const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = {
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName,
  modelName: "BAAI/bge-base-en-v1.5"
}

await OneContext.createVectorIndex(vectorIndexCreateArgs)

// Create an index pipeline

const indexPipelineCreateArgs: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/index.yaml",
}

await OneContext.createPipeline(indexPipelineCreateArgs)

// Create a "simple" retriever pipeline

const simpleRetrieverPipeline: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/retrieve.yaml",
}

await OneContext.createPipeline(simpleRetrieverPipeline)

// Create an "involved" retriever pipeline

const involvedRetrieverPipelineCreateArgs: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/retrieve_filter_and_rerank.yaml",
}

await OneContext.createPipeline(involvedRetrieverPipelineCreateArgs)


// Upload a directory of files related to Charlie Munger to the knowledge base, and tag them with "charlie_munger"

const uploadDirectoryArgsMunger: OneContext.UploadDirectoryType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "demo_data/long_form",
  metadataJson: {"tag": "charlie_munger"} 
}

await OneContext.uploadDirectory(uploadDirectoryArgsMunger)

// Upload a directory of files related to Charlie Munger to the knowledge base, and tag them with "charlie_munger"

const uploadDirectoryArgsML: OneContext.UploadDirectoryType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "demo_data/machine_learning",
  metadataJson: {"tag": "machine_learning"}
}

await OneContext.uploadDirectory(uploadDirectoryArgsML)

// Have a look at the current running pipelines

const runResultsArgs: OneContext.RunResultsType = {
  API_KEY: API_KEY,
  limit: 10,
  sort: "date_created",
  dateCreatedGte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
}

await OneContext.getRunResults(runResultsArgs)

// Once the index pipeline has finished running, the embeddings are now ready to be queried in the vector index. 
// Another way of checking if the pipeline has finished running is to list the files available in the Knowledge Base 

const listFilesArgs: OneContext.ListFilesType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
}

await OneContext.listFiles(listFilesArgs)

// You can easily delete any files you no longer want in the Knowledge Base

const deleteFileArgs: OneContext.DeleteFilesType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  fileNames: ["instruct_gpt.pdf"]
}

await OneContext.deleteFiles(deleteFileArgs)

// Run a retriever pipeline to query the vector index (full of embeddings of the above files) for the most relevant chunks to a given query.

const simpleRetrieverPipelineRunArgs: OneContext.RunArgsType = {
  API_KEY: API_KEY,
  pipelineName: simpleRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
}

await OneContext.runPipeline(simpleRetrieverPipelineRunArgs)

// Try the more involved pipeline (more steps, higher latency, but more accurate results) and compare and contrast the results for yourself
// This pipeline filters the results to only include chunks tagged with a lexrank percentile score of > 0.5, and then passes the output of that filter through a reranker model.
// For more on lexrank, read our docs!

const involvedRetrieverPipelineRunArgs: OneContext.RunArgsType = {
  API_KEY: API_KEY,
  pipelineName: involvedRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
}

await OneContext.runPipeline(involvedRetrieverPipelineRunArgs)


// Delete the knowledge base you created earlier

const knowledgeBaseDeleteArgs: OneContext.KnowledgeBaseDeleteType = {
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName
}

await OneContext.deleteKnowledgeBase(knowledgeBaseDeleteArgs)

// Delete the vector index you created earlier

const vectorIndexDeleteArgs: OneContext.VectorIndexDeleteType = {
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName
}

await OneContext.deleteVectorIndex(vectorIndexDeleteArgs)
  

