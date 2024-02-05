import { OneContext } from 'onecontext'
import fs from "fs";
import YAML from 'yaml';

// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

// OneContext.deleteKnowledgeBase({knowledgeBaseName:"rm-dev"}).then((res)=>{console.log(res)})

// OneContext.listFiles({knowledgeBaseName:"new-pipelines"}).then((res)=>{console.log(res)})

const path = __dirname+"/../simple.yaml"
const newPath = __dirname+"/../new.yaml"

// read yaml at the path
const file: string = fs.readFileSync(path, 'utf8')
const newFile: string = fs.readFileSync(newPath, 'utf8')

// OneContext.createPipeline({pipelineName: "rm-dev", pipelineYaml: file})

// OneContext.getChunks({
//     chunkArgs: {
//         knowledgeBaseName: "rm-dev",
//         metaDataJson: {"file_name": {"in": ["Implicit_representations.pdf"]}},
//     }, polarOp: (df) => {
//         return df
//     }
// }).then((res) => {console.log(res)})

// const runit = async () => {
//     const r = await OneContext.parseYaml({yaml: file, verboseErrorHandling: false})
//     return r
// }
// ( async () => await runit() )()
//
// const runMany = ({n}:{n: number}) => {
//
//     // create one task
//     let task = OneContext.query({
//         queryArgs: {
//             query: null,
//             knowledgeBaseName: "new-pipelines",
//             distanceMetric: "cosine",
//             topK: 4,
//             out: "chunk",
//             metaDataJson: {"file_name": {"in": ["Implicit_representations.pdf"]}},
//         },
//         polarOp: (df) => {return df.sort("page")},
//     });
//
//     // make n copies of the above task
//     const tasks = Array.from({length:n}).map(x => task)
//
//     return Promise.all(tasks).then((res) => {return res})
//
// }
//
// runMany({n: 1}).then((res) => {console.log(res)})

const df = OneContext.query({
    queryArgs: {
        pipelineName: "rm-dev",
        override_oc_yaml: newFile,
    }, polarOp: null
}).then((df) => {
    console.log(df)
})

// OneContext.uploadFile({
//     // you can upload a file EITHER by passing file path, or, by passing some content as text
//     files: [{path: "/Users/rossmurphy/embedpdf/Implicit_representations.pdf"}],
//     // files: [{name: "test.txt", content: "test test test"}],
//     metadataJson: {"description": "hello"},
//     stream: false,
//     pipelineName: "rm-dev",
// }).then((res) => {
//     console.log(res)
// })

// OneContext.awaitEmbeddings({knowledgeBaseName:"ross-test-rm-dev", filename: "Implicit_representations.pdf"}).then((res)=>{console.log(res)})

// OneContext.checkKbStatus({knowledgeBaseName:"rm-dev"}).then((res)=>{console.log(res)})
// OneContext.checkPipelineStatus({pipelineName:"rm-dev"}).then((res)=>{console.log(res)})
// OneContext.listFiles({knowledgeBaseName:"rm-dev"}).then((res)=>{console.log(res)})

// OneContext.generateQuiz({
//     userPromptPerTopic: "Please create a multiple choice quiz for me about the topic of {topic}. Base the questions in your quiz on the information contained in the following pieces of text {chunks}. There should be {num_questions_topic} questions on this topic. For each multiple choice question, include 1 correct answer, and 3 plausible (but incorrect) answers. Clearly state which is the correct answer at the end of each question.",
//     metaDataFilters: {"file_name": {"$in": ["Implicit_representations.pdf"]}},
//     pipelineName: "rm-dev",
//     scorePercentileLabel: "lexrank_percentile_test",
//     clusterLabel: "louvain_cluster_test",
//     totalNumberOfQuestions: 8,
//     extractPercentage: 0.8,
// }).then((res) => {
//     console.log(res)
// })

// OneContext.callPipelineHooks("rm-dev").then((res) => {console.log(res)})
