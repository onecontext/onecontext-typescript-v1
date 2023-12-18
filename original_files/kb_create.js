import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './../.env' });
const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;


const createKb = async (createArgs) => {

    const { knowledgeBaseName,  callback } = createArgs;

    try {
        const config = {
            method: 'post',
            url: baseUrl + `knowledge_bases` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data : {
                name: knowledgeBaseName,
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
    knowledgeBaseName: 'rmtest',
    callback: (r) => {
        if (r.status === 200) {
            console.log(`Created knowledgebase successfully.`);
        } else {
            console.log("Failure");
        }
    }
};

createKb(createArgs);


