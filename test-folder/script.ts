import { OneContext } from 'onecontext'

// OneContext.createKnowledgeBase({knowledgeBaseName: "ross-test-rm-dev"})

// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

// OneContext.deleteKnowledgeBase({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

// OneContext.listFiles({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})

OneContext.query({queryArgs:{
    query:null,
    knowledgeBaseName:"ross-test-rm-dev",
    distanceMetric:"cosine",
    topK:4,
    out:"chunk",
    metaDataJson:{"file_name":{"in" : ["Implicit_representations.pdf"]}},
    }, polarOp: (df) => {return df.sort("page")}}).then((df)=>{console.log(df)})

// const df = OneContext.polarQuery({queryArgs:{
//     query:null,
//     knowledgeBaseName:"ross-test-rm-dev",
//     distanceMetric:"cosine",
//     topK:20,
//     out:"chunk",
//     metaDataJson:{"file_name":{"in" : ["Implicit_representations.pdf"]}},
//     }, polarOp: (df) => {return df.sort("page")}}).then((df)=>{console.log(df)})

// OneContext.uploadFile({
//     // you can upload a file EITHER by passing file path, or, by passing some content as text
//     files: [{path: "/Users/rossmurphy/embedpdf/Implicit_representations.pdf"}],
//     // files: [{name: "test.txt", content: "test test test"}],
//     metadataJson: {"description": "hello"},
//     stream: false,
//     knowledgeBaseName: "ross-test-rm-dev",
// }).then((res) => {
//     console.log(res)
// })

// OneContext.awaitEmbeddings({knowledgeBaseName:"ross-test-rm-dev", filename: "Implicit_representations.pdf"}).then((res)=>{console.log(res)})

// OneContext.checkKbStatus({knowledgeBaseName:"ross-test-rm-dev"}).then((res)=>{console.log(res)})
