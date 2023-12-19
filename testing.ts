import {complete} from './src/index';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env'});

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function run() {
    try {
        const completionArgs = {
            prompt: 'This is a test, give me an introduction based on the content in the provided information: {{docs}}',
            context_token_budget: 1000,
            model: 'gpt-4-1106-preview',
            knowledge_base_name: 'rmtest',
            metadata_filters: {"source": "wikipedia"},
            stop: '###',
            temperature: 0.7,
            max_tokens: 3000,
            base_url: BASE_URL,
            openai_api_key: OPENAI_API_KEY,
            api_key: API_KEY,
        }
        const result = await complete({...completionArgs });
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();