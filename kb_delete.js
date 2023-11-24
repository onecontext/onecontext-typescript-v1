const axios = require('axios');

// get variables from .env file
require('dotenv').config();

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const deleteKb = async (deleteArgs) => {

    const { knowledgeBaseName,  callback } = deleteArgs;

    try {
        const config = {
            method: 'delete',
            url: baseUrl + `knowledge_bases/${knowledgeBaseName}` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error deleting knowledge base:', error);
    }
};

const deleteArgs = {
    knowledgeBaseName: 'retainit',
    callback: (r) => {
        if (r.status === 200) {
            console.log(`Deleted knowledgebase successfully.`);
        } else {
            console.log("Failure");
        }
    }
};

deleteKb(deleteArgs);


