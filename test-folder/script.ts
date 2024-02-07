import * as OneContext from 'onecontext'
import fs from "fs";
import YAML from 'yaml';
import * as dotenv from "dotenv";
import {runMany} from "../rmUtils";

// import the variables from the .env
dotenv.config({path: __dirname + '/../.env'});

const API_KEY: string = process.env.API_KEY!;
const BASE_URL: string = process.env.BASE_URL!;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;

const path = __dirname+"/../simple.yaml"
const overridePath = __dirname+"/../new.yaml"
const file: string = fs.readFileSync(path, 'utf8')
const overrideFile: string = fs.readFileSync(overridePath, 'utf8')

// const pipeCreate: OneContext.PipelineCreateType = {pipelineName: 'rm-dev', pipelineYaml: file, BASE_URL: BASE_URL, API_KEY: API_KEY}
// const a = OneContext.createPipeline(pipeCreate).then((res)=>{console.log(res)})

const pipeDelete: OneContext.PipelineDeleteType = {pipelineName: 'rm-dev', BASE_URL: BASE_URL, API_KEY: API_KEY}
OneContext.deletePipeline(pipeDelete).then((res)=>{console.log(res)})

// const listPipes: OneContext.ListPipelinesType = {BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.listPipelines(listPipes).then((res)=>{console.log(res)})

// const deletePipes: OneContext.PipelineDeleteType = {pipelineName: 'hi', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.deletePipeline(deletePipes).then((res)=>{console.log(res)})

// const listFiles: OneContext.ListFilesType = {pipelineName: 'hi', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.listFiles(listFiles).then((res)=>{console.log(res)})

// const getChunksArgs: OneContext.GetChunksType = {pipelineName: 'hi', metaDataJson: {"file_name": {"in": ["Implicit_representations.pdf"]}}, BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.getChunks(getChunksArgs).then((res) => {console.log(res)})

// const queryArgs: OneContext.QuerySingleArgType = {pipelineName: 'hi', override_oc_yaml: overrideFile, BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.query(queryArgs).then((res) => {
//     console.log(res)
// })

// const uploadFileArgs: OneContext.UploadFileType = {files: [{path: "/Users/rossmurphy/embedpdf/Implicit_representations.pdf"}], metadataJson: {"description": "hello"}, pipelineName: "hi", BASE_URL: BASE_URL, API_KEY: API_KEY, stream: false}
// OneContext.uploadFile(uploadFileArgs).then((res) => {
//     console.log(res)
// })

// const awaitEmbeddingArgs: OneContext.AwaitEmbeddingsType = {pipelineName: "hi", fileName: "Implicit_representations.pdf", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.awaitEmbeddings(awaitEmbeddingArgs).then((res)=>{console.log(res)})

// const checkPipelineArgs: OneContext.CheckPipelineType = {pipelineName: "hi", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.checkPipelineStatus(checkPipelineArgs).then((res)=>{console.log(res)})

// const generateQuizArgs: OneContext.GenerateQuizType = {userPromptPerTopic: "Please create a multiple choice quiz for me about the topic of {topic}. Base the questions in your quiz on the information contained in the following pieces of text {chunks}. There should be {num_questions_topic} questions on this topic. For each multiple choice question, include 1 correct answer, and 3 plausible (but incorrect) answers. Clearly state which is the correct answer at the end of each question.", metaDataFilters: {"file_name": {"$in": ["Implicit_representations.pdf"]}}, pipelineName: "hi", scorePercentileLabel: "lexrank_percentile_test", clusterLabel: "louvain_cluster_test", totalNumberOfQuestions: 8, extractPercentage: 0.8, BASE_URL: BASE_URL, API_KEY: API_KEY, OPENAI_API_KEY: OPENAI_API_KEY}
// OneContext.generateQuiz(generateQuizArgs).then((res) => {
//     console.log(res)
// })

// const callPipeArgs: OneContext.CallPipelineType = {pipelineName: "hi", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.callPipelineHooks(callPipeArgs).then((res) => {console.log(res)})

// const checkHooksArgs: OneContext.CheckHooksType = {pipelineName: "hi", callId: "41ef38daeebd4d3dac2b4d1fe5ce8334", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.checkHooksCall(checkHooksArgs).then((res) => {console.log(res)})

// const runit = async () => {
//     const r = await OneContext.parseYaml({yaml: file, verboseErrorHandling: false})
//     return r
// }
// ( async () => await runit() )()

// runMany({n: 1}).then((res) => {console.log(res)})

