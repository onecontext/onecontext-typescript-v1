import axios from 'axios'

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const createKb = async (createArgs) => {

    const { knowledgeBaseTitle,  callback } = createArgs;

    try {
        const config = {
            method: 'post',
            url: baseUrl + `knowledgebase`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data : {
                title: knowledgeBaseTitle,
                chunk_params: null,
                score_params: null,
                louvain_params: null
            }
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error creating knowledge base:', error.response.data.errors[0]);
    }
};

const createArgs = {
    knowledgeBaseTitle: 'examplekb2',
    callback: (r) => {
        if (r.status === 200) {
            console.log(`Created knowledgebase successfully.`);
        } else {
            console.log("Failure");
        }
    }
};

createKb(createArgs);


