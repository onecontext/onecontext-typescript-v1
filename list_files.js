import axios from 'axios'

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const list_files = async (listFilesArgs) => {

    const { knowledgeBaseTitle,  callback } = listFilesArgs;

    try {
        const config = {
            method: 'get',
            url: baseUrl + `knowledgebase/${knowledgeBaseTitle}/files` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error listing files:', error.response.data);
    }
};

const listFilesArgs = {
    knowledgeBaseTitle: 'rmdev2',
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data);
        } else {
            console.log("Failure");
        }
    }
};


// run(100, list_files, listFilesArgs).then(() => console.log("Test complete"));
list_files(listFilesArgs);


