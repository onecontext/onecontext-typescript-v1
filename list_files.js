import axios from 'axios'

// get variables from .env file
import 'dotenv/config';

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
    knowledgeBaseName: 'rmdev',
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data);
        } else {
            console.log("Failure");
        }
    }
};

const run = async function (times, callable, args) {
    let start = Date.now();
    const promises = [];

    for (let i = 0; i < times; i++) {
        promises.push(callable(args));
    }

    await Promise.all(promises);

    let timeTaken = Date.now() - start;
    console.log("Total time taken : " + timeTaken/1000 + " seconds");
    console.log(`Ran test ${times} times: at a rate of ${Number(Math.round(times/(timeTaken/1000)))} times per second`);
    // string format to 2 decimal places
    console.log("Done");
};

run(100, list_files, listFilesArgs).then(() => console.log("Test complete"));
// list_files(listFilesArgs);


