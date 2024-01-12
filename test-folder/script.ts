import { OneContext } from 'onecontext'

// OneContext.createKnowledgeBase({knowledgeBaseName: "ross-test-rm-dev"})

// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

// OneContext.deleteKnowledgeBase({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

OneContext.listFiles({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

// OneContext.query({queryArgs:{
//     query:null,
//     knowledgeBaseName:"ross-test-rm-dev",
//     distanceMetric:"cosine",
//     topK:4,
//     out:"chunk",
//     metaDataJson:{"file_name":{"in" : ["High-Performance-Browser-Networking-Ilya-Grigorik.pdf"]}},
//     }}).then((res)=>{console.log(res)})

//
// OneContext.uploadFile({
//     // you can upload a file EITHER by passing file path, or, by passing some content as text
//     files: [{path: "/Users/rossmurphy/embedpdf/faith_and_fate.pdf"}],
//     // files: [{name: "test.txt", content: "test test test"}],
//     metadataJson: {"description": "hello"},
//     stream: false,
//     knowledgeBaseName: "ross-test-rm-dev",
// }).then((res) => {
//     console.log(res)
// })

// OneContext.checkKbStatus({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})
