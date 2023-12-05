import axios from 'axios';

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const test = async () => {

    try {
        const config = {
            method: 'get',
            url: baseUrl + `knowledgebase` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data : {
                "title": "rm_hi"
            }

        };

        const response = await axios(config);

    } catch (error) {
        console.error('Error running test: ', error.response.data.errors[0]);
    }
};

const deleteArgs = {
    knowledgeBaseName: 'rmdev',
    callback: (r) => {
        if (r.status === 200) {
            console.log(`Successfully ran test.`);
        } else {
            console.log("Failure");
        }
    }
};

test();


