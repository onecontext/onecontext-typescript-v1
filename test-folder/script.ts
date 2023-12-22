import { OneContext } from 'onecontext'

OneContext.createKnowledgeBase({knowledgeBaseName: "ross-test"})

OneContext.listKnowledgeBases().then((res)=>{console.log(res)})

OneContext.deleteKnowledgeBase({knowledgeBaseName:"ross-test"}).then((res)=>{console.log(res)})

OneContext.listFiles({knowledgeBaseName:"ross-test"}).then((res)=>{console.log(res)})

OneContext.uploadFile({
    // you can upload a file EITHER by passing file path, or, by passing some content as text
    files: [{path: "/Users/rossmurphy/embedpdf/faith_and_fate.pdf"}],
    // files: [{name: "test.txt", content: "test test test"}],
    stream: false,
    knowledgeBaseName: "test-3ibb",
}).then((res) => {
    console.log(res)
})
