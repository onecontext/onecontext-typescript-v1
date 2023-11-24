const axios = require('axios');

// get variables from .env file
require('dotenv').config();

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const list_files = async (listFilesArgs) => {

    const { knowledgeBaseName,  callback } = listFilesArgs;

    try {
        const config = {
            method: 'get',
            url: baseUrl + `knowledge_bases/${knowledgeBaseName}/files` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data: {
                knowledge_base_name: knowledgeBaseName
            }
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error listing files:', error.response.data);
    }
};

const listFilesArgs = {
    knowledgeBaseName: 'retainit',
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data);
        } else {
            console.log("Failure");
        }
    }
};

list_files(listFilesArgs);


