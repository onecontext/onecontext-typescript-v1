import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'

// get variables from .env file
import 'dotenv/config';

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;

const handleUpload = async (UploadArgs) => {
    const { files, knowledgeBaseName, metadataJson, callback } = UploadArgs;
    const formData = new FormData();

    files.forEach(file => {
        formData.append('files', fs.createReadStream(file));
    });

    formData.append('knowledgebase_title', knowledgeBaseName);


    if (metadataJson) {
        formData.append('metadata_json', JSON.stringify(metadataJson));
    }

    try {
        const config = {
            method: 'post',
            url: baseUrl + 'upload',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders() // Axios will set the Content-Type header from formData
            },
            data: formData
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error during file upload:', error.response.data.errors[0]);
    }
};

const uploadArgs = {
    files: ["/Users/rossmurphy/poorcharlie.pdf"],
    knowledgeBaseName: 'rmdev5',
    metadataJson: {"person_name": "kacper", "description": "example", "datajson": "example"},
    callback: (r) => {
        if (r.status === 200) {
            console.log("Success");
        } else {
            console.log("Failure");
            console.log(r.data.errors);
        }
    }
};

handleUpload(uploadArgs);


