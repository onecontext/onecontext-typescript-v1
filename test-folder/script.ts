import { OneContext } from 'onecontext'

// OneContext.createKnowledgeBase({knowledgeBaseName: "ross-test-rm-dev"})

// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

// OneContext.deleteKnowledgeBase({knowledgeBaseName:"test-3ibb"}).then((res)=>{console.log(res)})

// OneContext.listFiles({knowledgeBaseName:"test-3ibb"}).then((res)=>{console.log(res)})

OneContext.query({queryArgs:{
    query:null,
    knowledgeBaseName:"ross-test-rm-dev",
    distanceMetric:"cosine",
    topK:1,
    out:"chunk",
    metaDataJson:{"description":{"eq" : "example"}},
    }}).then((res)=>{console.log(res)})

// OneContext.uploadFile({
//     // you can upload a file EITHER by passing file path, or, by passing some content as text
//     files: [{path: "/Users/rossmurphy/embedpdf/High-Performance-Browser-Networking-Ilya-Grigorik.pdf"}],
//     // files: [{name: "test.txt", content: "test test test"}],
//     metadataJson: {"description": "example"},
//     stream: false,
//     knowledgeBaseName: "ross-test-rm-dev",
// }).then((res) => {
//     console.log(res)
// })
