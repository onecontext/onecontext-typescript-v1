import { OneContext } from 'onecontext'

OneContext.createKnowledgeBase({knowledgeBaseName: "test-2ibb"}).then((res) => {
    console.log(res)
});