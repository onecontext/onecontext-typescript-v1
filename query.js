import axios from 'axios';
import run from "./parallel.js"

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const query = async (queryArgs) => {

    const { metaDataFilters, knowledgeBaseTitles , topK, reRank, reRankPoolSize, queryText, callback } = queryArgs;

// check if "file_name" is in "metaDataFilters" keys:
    if (!Object.keys(metaDataFilters).includes("file_name")) {
        console.log("No file name specified. Please pass a 'file_name' key in the metadata filters.");
        return;
    }

    try {
        const config = {
            method: 'post',
            url: baseUrl + `query`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data: {
                metadata_filters: metaDataFilters,
                knowledge_base_titles: knowledgeBaseTitles,
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
    metaDataFilters: {"file_name": ["faith_and_fate.pdf"], "description": "example"},
    knowledgeBaseTitles: ['rmdev5'],
    topK: 5,
    reRank: true,
    reRankPoolSize: 10,
    queryText: "tell me about tcp/ip vs http",
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data)
            console.log("Quiz request submitted successfully");
        } else {
            console.log("Failure");
        }
    }
};

run(1,query,queryArgs).then(() => console.log("Test complete"))


