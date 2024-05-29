import * as OneContext from "@onecontext/ts-sdk"
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import * as util from "util";
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

// Create a .env file and add your API_KEY 
dotenv.config({path: __dirname + '/../.env'});

// make sure the env variables are being read correctly and instantiated as global variables
const API_KEY: string = process.env.API_KEY!;
const BASE_URL: string = process.env.BASE_URL!;

const knowledgeBaseName: string = "demoKnowledgeBase" 
const vectorIndexName: string = "demoVectorIndex"
const indexPipelineName: string = "demoIndexPipeline"
const simpleRetrieverPipelineName: string = "demoSimpleRetrieverPipeline"
const involvedRetrieverPipelineName: string = "demoInvolvedRetrieverPipeline"

const knowledgeBaseCreateArgs: OneContext.KnowledgeBaseCreateType = OneContext.KnowledgeBaseCreateSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName
})

OneContext.createKnowledgeBase(knowledgeBaseCreateArgs).then((res) => {console.log(res)})

const vectorIndexCreateArgs: OneContext.VectorIndexCreateType = OneContext.VectorIndexCreateSchema.parse({
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName,
  modelName: "BAAI/bge-base-en-v1.5"
})

OneContext.createVectorIndex(vectorIndexCreateArgs).then((res) => {console.log(res)})


// Create an index pipeline

const indexPipelineCreateArgs: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: indexPipelineName,
  pipelineYaml: "./quickstart/example_yamls/index.yaml",
})

OneContext.createPipeline(indexPipelineCreateArgs).then((res) => {console.log(res)})

// Create a "simple" retriever pipeline

const simpleRetrieverPipeline: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: simpleRetrieverPipelineName,
  pipelineYaml: "./quickstart/example_yamls/retrieve.yaml",
})

OneContext.createPipeline(simpleRetrieverPipeline).then((res) => {console.log(res)})


// Create an "involved" retriever pipeline

const involvedRetrieverPipelineCreateArgs: OneContext.PipelineCreateType = OneContext.PipelineCreateSchema.parse({
  API_KEY: API_KEY,
  pipelineName: involvedRetrieverPipelineName,
  pipelineYaml: "./quickstart/example_yamls/retrieve_filter_and_rerank.yaml",
})

OneContext.createPipeline(involvedRetrieverPipelineCreateArgs).then((res) => {console.log(res)})


// Upload a directory of books to the knowledge base, and tag them with "long_form"

const uploadDirectoryArgsLongForm: OneContext.UploadDirectoryType = OneContext.UploadDirectorySchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "./quickstart/demo_data/long_form/",
  metadataJson: {"tag": "longForm"} 
})

OneContext.uploadDirectory(uploadDirectoryArgsLongForm).then((res) => {console.log(res)})


const uploadDirectoryArgsML: OneContext.UploadDirectoryType = OneContext.UploadDirectorySchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  directory: "./quickstart/demo_data/machine_learning/",
  metadataJson: {"tag": "machine_learning"}
})

OneContext.uploadDirectory(uploadDirectoryArgsML).then((res) => {console.log(res)})

// // Have a look at the current running pipelines

const runResultsArgs: OneContext.RunResultsType = OneContext.RunResultsSchema.parse({
  API_KEY: API_KEY,
  limit: 10,
  sort: "date_created",
  dateCreatedGte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
})

OneContext.getRunResults(runResultsArgs).then((res) => {console.log(util.inspect(res,{showHidden: false, colors: true}))})

// // Once the index pipeline has finished running, the embeddings are now ready to be queried in the vector index. 
// // Another way of checking if the pipeline has finished running is to list the files available in the Knowledge Base 

const listFilesArgs: OneContext.ListFilesType = OneContext.ListFilesSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
})

OneContext.listFiles(listFilesArgs).then((res) => {console.log(res)})

// You can easily delete any files you no longer want in the Knowledge Base

const deleteFileArgs: OneContext.DeleteFilesType = OneContext.DeleteFilesSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName,
  fileNames: ["instruct_gpt.pdf"]
})

OneContext.deleteFiles(deleteFileArgs).then((res) => {console.log(res)})

// // Run a retriever pipeline to query the vector index (full of embeddings of the above files) for the most relevant chunks to a given query.

const simpleRetrieverPipelineRunArgs: OneContext.RunType = OneContext.RunSchema.parse({
  API_KEY: API_KEY,
  pipelineName: simpleRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
})

OneContext.runPipeline(simpleRetrieverPipelineRunArgs).then((res) => {console.log(util.inspect(res, {showHidden: true, colors: true}))})

// Try the more involved pipeline (more steps, higher latency, but more accurate results) and compare and contrast the results for yourself
// This pipeline filters the results to only include chunks tagged with a lexrank percentile score of > 0.5, and then passes the output of that filter through a reranker model.
// For more on lexrank, read our docs!

const involvedRetrieverPipelineRunArgs: OneContext.RunType = OneContext.RunSchema.parse({
  API_KEY: API_KEY,
  pipelineName: involvedRetrieverPipelineName,
  overrideArgs: {"retriever" : {"query" : "what did Charlie Munger have to say about having an opinion on something he was not an expert in?"}}
})

OneContext.runPipeline(involvedRetrieverPipelineRunArgs).then((res) => {console.log(util.inspect(res, {showHidden: true, colors: true}))})

// Delete the knowledge base you created earlier

const knowledgeBaseDeleteArgs: OneContext.KnowledgeBaseDeleteType = OneContext.KnowledgeBaseDeleteSchema.parse({
  API_KEY: API_KEY,
  knowledgeBaseName: knowledgeBaseName
})

OneContext.deleteKnowledgeBase(knowledgeBaseDeleteArgs).then((res) => {console.log(res)})

// // Delete the vector index you created earlier
const vectorIndexDeleteArgs: OneContext.VectorIndexDeleteType = OneContext.VectorIndexDeleteSchema.parse({
  API_KEY: API_KEY,
  vectorIndexName: vectorIndexName
})

OneContext.deleteVectorIndex(vectorIndexDeleteArgs).then((res) => {console.log(res)})

// // Delete the pipelines you created earlier
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
