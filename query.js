import axios from 'axios';
import run from "./parallel.js"

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const query = async (queryArgs) => {

    const { metaDataFilters, knowledgeBaseTitles , topK, reRank, reRankPoolSize, queryText, callback } = queryArgs;

    try {
        const config = {
            method: 'post',
            url: baseUrl + `query`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data: {
                metadata_filters: metaDataFilters,
                knowledgebase_titles: knowledgeBaseTitles,
                query: queryText,
                top_k: topK,
                rerank: reRank,
                rerank_pool_size: reRankPoolSize
            }
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error making query:', error.response.data.detail);
    }
};

const queryArgs = {
    metaDataFilters: {"file_title": {"eq" : "Implicit_representations.pdf"}},
    // metaDataFilters: {},
    knowledgeBaseTitles: ['examplekb2'],
    topK: 5,
    reRank: true,
    reRankPoolSize: 10,
    queryText: "Transformer large language models (LLMs) have sparked admiration for their exceptional performance on tasks that demand intricate multi-step reasoning. Yet, these models simultaneously show failures on surprisingly trivial problems. This begs the question: Are these errors incidental, or do they signal more substantial limitations? In an attempt to demystify Transformers, we investigate the limits of these models across three representative compositional tasks—multi-digit multi- plication, logic grid puzzles, and a classic dynamic programming problem. These tasks require breaking problems down into sub-steps and synthesizing these steps into a precise answer. We formulate compositional tasks as computation graphs to systematically quantify the level of complex",
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data)
            console.log("Quiz request submitted successfully");
        } else {
            console.log("Failure");
        }
    }
};

run(100,query,queryArgs).then(() => console.log("Test complete"))