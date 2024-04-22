import * as OneContext from 'onecontext'
import { performance } from 'perf_hooks';
import fs from "fs";
import YAML from 'yaml';
import * as dotenv from "dotenv";
import {awaitEmbeddings, getRunResults, PipelineSchema} from "onecontext";
import {runMany, textWithColor} from "../src/rmUtils.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

import pl from 'nodejs-polars';
// import {runMany} from "../rmUtils";
import util from "util"

// import the variables from the .env
dotenv.config({path: __dirname + '/../.env'});

// make sure they are being read correctly and instantiate as global variables
const API_KEY: string = process.env.API_KEY!;
const BASE_URL: string = process.env.BASE_URL!;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;

// define a default yaml, and an override yaml
const fpath = __dirname+"/../example_yamls/query.yaml"
const otherPath = __dirname+"/../example_yamls/query.yaml"
const file: string = fs.readFileSync(fpath, 'utf8')
const otherFile: string = fs.readFileSync(otherPath, 'utf8')

// The first step is to create a pipeline
// here we create one with the configuration in the "simple" yaml file

// const pipeCreate: OneContext.PipelineCreateType = {pipelineName: 'rm_query', pipelineYaml: file, BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.createPipeline(pipeCreate).then((res)=>{})

// const vectorIndexCreate: OneContext.VectorIndexCreateType = {vectorIndexName: 'rm_test_vi', modelName: "BAAI/bge-base-en-v1.5", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.createVectorIndex(vectorIndexCreate).then((res)=>{})

// const knowledgeBaseCreate: OneContext.KnowledgeBaseCreateType = {knowledgeBaseName: 'rm_test', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.createKnowledgeBase(knowledgeBaseCreate).then((res)=>{})

// list your current pipelines to confirm that the above pipeline now exists
// const listPipes: OneContext.ListPipelinesType = {BASE_URL: BASE_URL, API_KEY: API_KEY, verbose: false}
// OneContext.listPipelines(listPipes).then((res)=>{console.log(res)})


// You can then upload a whole directory of files through the pipeline
// const uploadDirectoryArgs: OneContext.UploadDirectoryType = {
//     directory: "/Users/rossmurphy/embedpdf/",
//     metadataJson: {"description": "demo_example"},
//     knowledgeBaseName: "rm_test",
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY,
// }
// const runId = OneContext.uploadDirectory(uploadDirectoryArgs).then((res) => {
//   if (res.data) {
//     console.log(res.data)
//   }
// })

// const out = getRunResults({BASE_URL: BASE_URL, API_KEY: API_KEY, runID: "b4e35f2f7cab424da752dc54f6da1569"}).then((res) => {console.log(res)})

// Of course, you can also choose to upload just one file, or an array of files, if you prefer

// const uploadFileArgs: OneContext.UploadFileType = {
//     files: [{path: "/Users/rossmurphy/embedpdf/faith_and_fate.pdf"}, {path: "/Users/rossmurphy/embedpdf/Implicit_representations.pdf"}],
//     metadataJson: {"description": "hello"},
//     pipelineName: "retainit_example",
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY,
//     stream: false
// }
// OneContext.uploadFile(uploadFileArgs).then((res) => {
//     console.log(res)
// })


// check on how that's going
// const checkPipelineArgs: OneContext.CheckPipelineType = {pipelineName: "rm_test", BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.checkPipelineStatus(checkPipelineArgs).then((res)=>{console.log(res)})

// look at the statuses of files you have uploaded through the pipeline
// const listFiles: OneContext.ListFilesType = {pipelineName: 'rm_prod', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.listFiles(listFiles).then((res)=>{console.log(res)})

// QUERY DEMO
// run the query pipeline. here we are passing the simple yaml we defined above
// you don't actually need to pass the yaml if you just want to run the default one attached to the pipeline

// const wildcardPath = __dirname + "/../example_yamls/simple.yaml"
// const wildcardFile: string = fs.readFileSync(wildcardPath, 'utf8')
const runPipeArgs: OneContext.RunArgsType = {
    pipelineName: 'rm_query',
    overrideArgs: {},
    BASE_URL: BASE_URL,
    API_KEY: API_KEY
}
// const t0 = performance.now()
// OneContext.runPipeline(runPipeArgs).then((res) => {
//     const t1 = performance.now()
//     console.log(` the total time taken was ${textWithColor((t1 - t0).toFixed(3),"green")} milliseconds.`)
//     console.log(util.inspect(res, {showHidden: false, depth: null, colors: true}) )
// })

// @ts-ignore
OneContext.poll({fnArgs: runPipeArgs, method: OneContext.aRunPipeline}).then((res) => {console.log(res)})

// OneContext.arun(queryArgs).then((res) => {console.log(res)})
// OneContext.runSummary(queryArgs).then((res) => {console.log(res)})
//

// Run this call multiple times concurrently and see how long it takes
// For reference, 100 concurrent calls should take around (800 miliseconds), or 8 miliseconds per call
// const queryArgs: OneContext.RunArgsType = {
//     pipelineName: 'rm_prod',
//     overrideOcYaml: wildcardFile,
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY
// }
// const runManyArgs = {
//     n: 100,
//     callable: (args: any) => {OneContext.run(args)},
//     callableArgs: queryArgs
// }
// //
// runMany(runManyArgs).then((res) => {console.log("Complete!")})
//


// OVERRIDES

// If the yaml you created your pipeline with has wildcards, you can override them at runtime.

// let's create a pipeline with wildcards so we can have a look at how to do this
// const pipeCreate: OneContext.PipelineCreateType = {pipelineName: 'chat', pipelineYaml: wildcardFile, BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.createPipeline(pipeCreate).then((res)=>{console.log(res)})

// list your current pipelines to confirm that the above pipeline now exists

// const listPipes: OneContext.ListPipelinesType = {BASE_URL: BASE_URL, API_KEY: API_KEY, verbose: true}
// OneContext.listPipelines(listPipes).then((res)=>{console.log(res)})

// let's upload some files again, but now to this new "wildcard" pipeline.
// Here, we're not going to use the uploadDirectory method, but instead the uploadFile method, and we are
// also going to make use of the await Embeddings method to make sure that the embeddings are ready before we continue

// const uploadFileArgs: OneContext.UploadFileType = {
//     files: [{path: "/Users/rossmurphy/embedpdf/faith_and_fate.pdf"}],
//     metadataJson: {"description": "debug"},
//     pipelineName: "chat",
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY,
//     stream: false
// }
//
// OneContext.uploadFile(uploadFileArgs).then((res) => {
//     awaitEmbeddings({pipelineName: "chat", fileName: "faith_and_fate.pdf", BASE_URL: BASE_URL, API_KEY: API_KEY}).then((res) => {
//         console.log("Uploaded and embedded")
//     })
// })

// Now let's check once more on the status of the files in the pipeline, just to double-check
// const listFiles: OneContext.ListFilesType = {pipelineName: 'wildcard', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.listFiles(listFiles).then((res)=>{console.log(res)})

// now let's go and run the pipeline, overriding the wildcard variables at runtime
// here is an example of how to do this with the parseYaml method
// for example if you look at the wildcards.yaml file,
// you will see that this step will retrieve the top 20 chunks pertaining to the supplied query
// it will then add a lexrank score and a louvain cluster to each of those 20 (in the context of the 20)
// and then extract the top 50% of them, and return them to us. i.e. we can expect around 10 chunks in the response.
// const wildCards = OneContext.parseYaml({
//     yaml: wildcardFile,
//     verboseErrorHandling: true,
//     overrides: {
//         wildcardOverrides: {
//             "$QUERY": "transformer architectures and how they apply to large language models",
//             "$TOP_K": "5",
//         }
//     },
//     asString: true
// }).then((res) => {
//     // create a yaml out of the object response
//     if (typeof res === "string") {
//         const runArgs: OneContext.RunArgsType = {
//             pipelineName: 'chat',
//             overrideOcYaml: res,
//             BASE_URL: BASE_URL,
//             API_KEY: API_KEY
//         }
//         OneContext.run(runArgs).then((res) => {
//             // console.log(util.inspect(res, {showHidden: false, depth: null, colors: true}))
//             console.log(res)
//         })
//     }
//     else { console.log("error in response") }
// })
//

// CLUSTERING AND ASSIGNING TOPICS TO THE ALL THE FILES IN THE PIPELINE

// here we are going to run a pipeline that will cluster all the files in the pipeline,
// and then assign topics to them
// const topicsPath = __dirname + "/../example_yamls/topics.yaml"
// const topicsFile: string = fs.readFileSync(topicsPath, 'utf8')

// here we will parse the topics.yaml file, and then run the pipeline (like we did with wildcards),
// but we could also have just run the pipeline without parsing the yaml, like we did at the very beginning

// we will just run this against the files that we already have in the wildcards pipeline

// we can run that pipeline the same way we have run all the above pipelines.
// running it this way will also return the chunks at the end, as that's what the "run" method does
// const topics = OneContext.parseYaml({
//     yaml: topicsFile,
//     verboseErrorHandling: true,
//     asString: true
// }).then((res) => {
//     // create a yaml out of the object response
//     if (typeof res === "string") {
//         const runArgs: OneContext.RunArgsType = {
//             pipelineName: 'wildcard',
//             overrideOcYaml: res,
//             BASE_URL: BASE_URL,
//             API_KEY: API_KEY
//         }
//         OneContext.run(runArgs).then((res) => {
//             // console.log(util.inspect(res, {showHidden: false, depth: null, colors: true}))
//             console.log(res)
//         })
//     }
//     else { console.log("error in response") }
// })


// however, we can ALSO run this pipeline in "summary" mode, where we don't
// return the chunks at the end. In this case, this might be preferable, as we
// don't really need the chunks. i.e. here we are just interested in clustering,
// it's not like we are going to be using the chunks for generating quizzes or quests currently

// the added benefit of running it in "summary" mode with the "runSummary" method, is that it will
// also return a dictionary which summarises each step in the pipeline, and the result of each step

// const topics = OneContext.parseYaml({
//     yaml: topicsFile,
//     verboseErrorHandling: true,
//     asString: true
// }).then((res) => {
//     // create a yaml out of the object response
//     if (typeof res === "string") {
//         const runArgs: OneContext.RunArgsType = {
//             pipelineName: 'wildcard',
//             overrideOcYaml: res,
//             BASE_URL: BASE_URL,
//             API_KEY: API_KEY
//         }
//         OneContext.runSummary(runArgs).then((res) => {
//             console.log(util.inspect(res, {showHidden: false, depth: null, colors: true}))
//             // console.log(res)
//         })
//     }
//     else { console.log("error in response") }
// })

// the other benefit of running it in summary mode is that the above will return a callid, which you can
// pass to the checkRunCall method to see the results of the steps at any time
// OneContext.checkRunCall({
//     callId: "f5892d95f2c04119a459f40ef77710ab",
//     pipelineName: "wildcard",
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY
// }).then((res) => {
//     if (res?.steps?.topic?.summary)
//     {console.log(res.steps.topic.summary)}
//     else {}
// })



// UPDATE THE METADATA WITH THE NEW TOPICS

// now that you have the clusters for the content in the db associated with this pipeline
// we can go and update the metadata of the chunks in the pipeline with the new topics

// here we will run the pipeline defined in the "update_metadata" yaml file,
// note that in there, I have already added a cluster topic which I want "upvoted"
// when the pipeline runs, it will tag each chunk associated with the user-upvoted cluster
// with "user_selected" : True in the metadata

// That means that going forward, you can just filter on {user_selected : { $eq : true }} when calling
// other pipelines for other reasons (for example for generating quizzes)

// const updateMetaPath = __dirname + "/../example_yamls/update_metadata.yaml"
// const updateMetaFile: string = fs.readFileSync(updateMetaPath, 'utf8')

// const parsed = OneContext.parseYaml({
//     yaml: updateMetaFile,
//     verboseErrorHandling: true,
//     asString: true
// }).then((res) => {
//
//     if (typeof res === "string") {
//         const runArgs: OneContext.RunArgsType = {
//             pipelineName: 'wildcard',
//             overrideOcYaml: res,
//             BASE_URL: BASE_URL,
//             API_KEY: API_KEY
//         }
//         OneContext.runSummary(runArgs).then((res) => {
//             if (res) {
//                 if (res.steps) {
//                     console.log(res)
//                 }
//                 else {
//                     console.log(res)
//                 }
//             }
//             else {console.log("error in response")}
//         })
//     }
//     else {console.log("error in response")}
// })
//

// Once that's done, we can now call the quizPipe method to generate a quiz for us
// we will use the "quiz" yaml, to create the quiz only based on the topics that the user has upvoted

// DEMO QUIZ PIPE
//
// const quizPath = __dirname+"/../example_yamls/quiz.yaml"
// const quizFile: string = fs.readFileSync(quizPath, 'utf8')

// const parsed = OneContext.parseYaml({
//     yaml: quizFile,
//     verboseErrorHandling: true,
//     overrides: {
//         wildcardOverrides: {
//             "$RERANKER_QUERY_WILDCARD": "transformer architectures and how they apply to large language models",
//             "$RERANKER_TOP_K_WILDCARD": "20",
//             "$QUERY_WILDCARD": "transformer architectures and how they apply to large language models",
//             "$RETRIEVER_TOP_K": "80",
//             "$EXTRACT_PERCENTAGE" : "0.6",
//         }
//     },
//     asString: true
// }).then((res) => {
//         if (typeof res === "string") {
//             const quizPipeArgs: OneContext.QuizPipeArgType = {
//                 pipelineName: 'wildcard',
//                 overrideOcYaml: res,
//                 BASE_URL: BASE_URL,
//                 API_KEY: API_KEY,
//                 OPENAI_API_KEY: OPENAI_API_KEY,
//                 promptPerTopic: "Please create a multiple choice quiz for me about the topic of {topic}. Base the questions in your quiz on the information contained in the following pieces of text: {chunks}. There should be {num_questions_topic} questions on this topic. For each multiple choice question, include 1 correct answer, and 3 plausible (but incorrect) answers. Clearly state which is the correct answer at the end of each question.",
//                 clusterLabel: "louvain_demo.label",
//                 totalNumQuestions: 8,
//             }
//             OneContext.quizPipe(quizPipeArgs).then((res) => {
//                 console.log(res)
//             })
//         } else {
//         }
//     }
// )
//

// For other types of tasks, context completion works like the below
// const contextCompleteArgs: OneContext.ContextCompletionArgsType = {
//     BASE_URL: BASE_URL,
//     API_KEY: API_KEY,
//     OPENAI_API_KEY: OPENAI_API_KEY,
//     pipelineName: "rm-dev",
//     prompt: "I want to know all about the generalisation capability of large language models. Include data from {chunks}",
//     contextTokenBudget: 1000,
//     maxTokens: 2000,
//     scorePercentileKey: "lexranker_file.percentile_score",
// }
// OneContext.contextCompletion(contextCompleteArgs).then((res) => {
//     console.log(res)
// })

// delete the pipeline
// note that doing this will also delete all the associated files, embeddings, and chunks
// const pipeDelete: OneContext.PipelineDeleteType = {pipelineName: 'rm_test', BASE_URL: BASE_URL, API_KEY: API_KEY}
// OneContext.deletePipeline(pipeDelete).then((res)=>{console.log(res)})


