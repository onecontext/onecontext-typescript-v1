import { OneContext } from 'onecontext'

// OneContext.createKnowledgeBase({knowledgeBaseName: "test-4"})
// OneContext.listKnowledgeBases().then((res)=>{console.log(res)})
// OneContext.deleteKnowledgeBase({knowledgeBaseName:"test-2ibb"}).then((res)=>{console.log(res)})
// OneContext.listFiles({knowledgeBaseName:"test-3ibb"}).then((res)=>{console.log(res)})

// OneContext.uploadFile({
//     files: [{name: "test.txt", content: "testing testing 1 2 3"}],
//     knowledgeBaseName: "test-3ibb",
// }).then((res) => {
//     console.log(res)
// })

OneContext.uploadFile({
    files: [{path: "/Users/rossmurphy/embedpdf/faith_and_fate.pdf"}],
    // files: [{name: "test.txt", content: "test test test"}],
    stream: false,
    knowledgeBaseName: "test-3ibb",
}).then((res) => {
    console.log(res)
})
