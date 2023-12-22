import axios from 'axios';

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const deleteKb = async (deleteArgs) => {

    const { knowledgeBaseName,  callback } = deleteArgs;

    try {
        const config = {
            method: 'delete',
            url: baseUrl + `knowledgebase/${knowledgeBaseName}` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error deleting knowledge base:', error.response.data.errors[0]);
    }
};

const deleteArgs = {
    knowledgeBaseName: 'examplekb2',
    callback: (r) => {
        if (r.status === 200) {
            console.log(`Deleted knowledgebase successfully.`);
        } else {
            console.log("Failure");
        }
    }
};

deleteKb(deleteArgs);


