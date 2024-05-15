import * as OneContext from "@onecontext/ts_sdk"
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
dotenv.config({path: __dirname + '/../.env'});

// make sure the env variables are being read correctly and instantiated as global variables
const API_KEY: string = process.env.API_KEY!;
const BASE_URL: string = process.env.BASE_URL!;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;

const knowledgeBaseName: string = "demoKnowledgeBase" 
const vectorIndexName: string = "demoVectorIndex"
const indexPipelineName: string = "demoIndexPipeline"
const simpleRetrieverPipelineName: string = "simpleDemoRetrieverPipeline"
const involvedRetrieverPipelineName: string = "involvedDemoRetrieverPipeline"

const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  knowledgeBaseName: knowledgeBaseName,
}

await OneContext.createKnowledgeBase(knowledgeBaseCreateArgs)

const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  vectorIndexName: vectorIndexName,
  modelName: "BAAI/bge-base-en-v1.5"
}

await OneContext.createVectorIndex(vectorIndexCreateArgs)

// Create an index pipeline

const indexPipelineCreateArgs: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/index.yaml",
}

await OneContext.createPipeline(indexPipelineCreateArgs)

// Create a "simple" retriever pipeline

const simpleRetrieverPipeline: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/retrieve.yaml",
}

await OneContext.createPipeline(simpleRetrieverPipeline)

// Create an "involved" retriever pipeline

const involvedRetrieverPipelineCreateArgs: OneContext.PipelineCreateType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  pipelineName: indexPipelineName,
  pipelineYaml: "example_yamls/retrieve_filter_and_rerank.yaml",
}

await OneContext.createPipeline(involvedRetrieverPipelineCreateArgs)


// Upload a directory of files to the knowledge base

const uploadDirectoryArgs: OneContext.UploadDirectoryType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  knowledgeBaseName: knowledgeBaseName,
  directory: "example_data",
  metadataJson: {"tag": "demo-data"} 
}





// Delete the knowledge base you created earlier

const knowledgeBaseDeleteArgs: OneContext.KnowledgeBaseDeleteType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  knowledgeBaseName: knowledgeBaseName
}

await OneContext.deleteKnowledgeBase(knowledgeBaseDeleteArgs)

// Delete the vector index you created earlier

const vectorIndexDeleteArgs: OneContext.VectorIndexDeleteType = {
  API_KEY: API_KEY,
  BASE_URL: BASE_URL,
  vectorIndexName: vectorIndexName
}

await OneContext.deleteVectorIndex(vectorIndexDeleteArgs)
  

