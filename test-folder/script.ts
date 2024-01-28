import { OneContext } from 'onecontext'
import fs from "fs";
import YAML from 'yaml';

// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

// OneContext.deleteKnowledgeBase({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

// OneContext.listFiles({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

const path = __dirname+"/../simple.yaml"

// read yaml at the path
const file: string = fs.readFileSync(path, 'utf8')

// OneContext.createKnowledgeBase({knowledgeBaseName: "new-pipelines-gcp-10", pipelineYaml: file})

// OneContext.getChunks({
//     chunkArgs: {
//         knowledgeBaseName: "new-pipelines-gcp-10",
//         metaDataJson: {"file_name": {"in": ["Implicit_representations.pdf"]}},
//     }, polarOp: (df) => {
//         return df
//     }
// })

const runit = async () => {
    return await OneContext.parseYaml({yaml: file}).then((res) => {
        console.log(res)
    })
}
( async () => await runit() )()

// const runMany = ({n}:{n: number}) => {
//
//     // create one task
//     let task = OneContext.query({
//         queryArgs: {
//             query: null,
//             knowledgeBaseName: "ross-test-rm-dev",
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

// run({n: 100}).then((res) => {console.log(res)})


// const df = OneContext.query({queryArgs:{
//     query:"penis",
//     knowledgeBaseName:"new-pipelines-gcp-10",
//     distanceMetric:"cosine",
//     topK:20,
//     out:"chunk",
//     metaDataJson:{"file_name":{"in" : ["Implicit_representations.pdf"]}},
//     }, polarOp: null}).then((df)=>{console.log(df)})

// OneContext.uploadFile({
//     // you can upload a file EITHER by passing file path, or, by passing some content as text
//     files: [{path: "/Users/rossmurphy/embedpdf/Implicit_representations.pdf"}],
//     // files: [{name: "test.txt", content: "test test test"}],
//     metadataJson: {"description": "hello"},
//     stream: false,
//     knowledgeBaseName: "new-pipelines-gcp-10",
// }).then((res) => {
//     console.log(res)
// })

// OneContext.awaitEmbeddings({knowledgeBaseName:"ross-test-rm-dev", filename: "Implicit_representations.pdf"}).then((res)=>{console.log(res)})

// OneContext.checkKbStatus({knowledgeBaseName:"new-pipelines-gcp-10"}).then((res)=>{console.log(res)})
