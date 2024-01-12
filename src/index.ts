import {Readable} from 'stream';
import axios from 'axios';
import FormData = require('form-data');
import * as dotenv from 'dotenv'
import sleep from './utils';
import * as fs from 'fs';
import {z} from 'zod';
import {ocTypes} from "./ocTypes/ocTypes";

dotenv.config({path: __dirname + '/../.env'});
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const createKnowledgeBase = async ({knowledgeBaseName}: { knowledgeBaseName: string }) => {
    try {

        const response = await axios({
            method: 'post',
            url: BASE_URL + 'knowledgebase',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                name: knowledgeBaseName,
            },
        });
        console.log("Created knowledge base: " + knowledgeBaseName)
        return response.data;
    } catch (error) {
        console.log("Failed to create knowledge base: " + knowledgeBaseName)
        console.log(error.response.data.errors[0]);
        return null;
    }
};

export const deleteKnowledgeBase = async ({knowledgeBaseName}: { knowledgeBaseName: string }) => {
    try {
        const response = await axios({
            method: 'delete',
            url: BASE_URL + `knowledgebase/${knowledgeBaseName}`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        console.log("Deleted knowledge base: " + knowledgeBaseName)
        return response.data;
    } catch (error) {
        console.log("Failed to delete knowledge base: " + knowledgeBaseName)
        console.error(error.response.data.errors[0]);
        return null;
    }
};

export const listKnowledgeBases = async (): Promise<{
    id: string; name: string;
}[]> => {
    const response = await axios({
        method: 'get',
        url: BASE_URL + `knowledgebase`,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
    });
    return response.data;
};


export const query = async ({queryArgs }: { queryArgs: ocTypes.QuerySingleArgType }): Promise<any[]> => {
    try {
        const response = await axios({
            method: 'post',
            url: BASE_URL + `query`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                query: queryArgs.query,
                knowledgebase_name: queryArgs.knowledgeBaseName,
                metadata_filters: queryArgs.metaDataJson,
                rerank: queryArgs.rerank,
                distance_metric: queryArgs.distanceMetric,
                top_k: queryArgs.topK,
                out: queryArgs.out,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
};

export const listFiles = async ({knowledgeBaseName}: { knowledgeBaseName: string }): Promise<{
    id: string; name: string; knowledgebase_id: string; has_embedding: boolean
}[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `knowledgebase/${knowledgeBaseName}/files`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
};

type GenerateQuizOptions = {
    userPromptPerTopic: string;
    metaDataFilters: { file_name: string[] } & Record<string, any>;
    knowledgeBaseName: string;
    totalNumberOfQuestions: number;
    extractPercentage: number;
};

export const createQuiz = async ({
                                     userPromptPerTopic,
                                     metaDataFilters,
                                     knowledgeBaseName,
                                     totalNumberOfQuestions,
                                     extractPercentage,
                                 }: GenerateQuizOptions): Promise<{ topic: string; output: string }[]> => {
    const result = await axios({
        method: 'get',
        url: BASE_URL + 'quiz_completion',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        data: {
            metadata_filters: metaDataFilters,
            prompt_per_topic: userPromptPerTopic,
            knowledge_base_name: knowledgeBaseName,
            total_num_questions: totalNumberOfQuestions,
            extract_percentage: extractPercentage,
            openai_api_key: OPENAI_API_KEY,
        },
    });
    return result.data;
};

type GenerateQuestOptions = {
    vision: string;
    mission: string;
    quest: string;
    introPrompt: string;
    introContextBudget: number;
    quizTotalContextBudget: number;
    userPromptPerTopic: string;
    metaDataFilters: { file_name: string[] } & Record<string, any>;
    knowledgeBaseName: string;
    totalNumberOfQuestions: number;
    model: string;
};

export const createQuest = async ({
                                      vision,
                                      mission,
                                      quest,
                                      introPrompt,
                                      introContextBudget,
                                      quizTotalContextBudget,
                                      userPromptPerTopic,
                                      metaDataFilters,
                                      knowledgeBaseName,
                                      totalNumberOfQuestions,
                                      model,
                                  }: GenerateQuestOptions): Promise<{ topic: string; output: string }[]> => {
    const result = await axios({
        method: 'get',
        url: BASE_URL + 'quest_gen',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        data: {
            vision: vision,
            user_mission: mission,
            quest: quest,
            intro_prompt: introPrompt,
            intro_context_budget: introContextBudget,
            quiz_total_context_budget: quizTotalContextBudget,
            metadata_filters: metaDataFilters,
            prompt_per_topic: userPromptPerTopic,
            knowledge_base_name: knowledgeBaseName,
            total_num_questions: totalNumberOfQuestions,
            model: model,
            openai_api_key: OPENAI_API_KEY,
        },
    });
    return result.data;
};

type UploadFileOptions = {
    files: ocTypes.FileType[];
    stream: boolean;
    knowledgeBaseName: string;
    metadataJson?: object;
};

export const uploadFile = async ({
                                     files,
                                     stream,
                                     knowledgeBaseName,
                                     metadataJson,
                                 }: UploadFileOptions): Promise<boolean> => {
    const formData = new FormData();
    files.forEach(file => {
        if (stream) {
            try {
                // try and parse it as a content type file, i.e. if the user has passed a readable stream
                // of text, and has also passed a name for the file
                const f = ocTypes.ContentFileSchema.parse(file, {errorMap: ocTypes.customErrorMap});
                formData.append('files', f.readable, {
                    filename: f.name,
                    contentType: 'text/plain',
                })
            }
            catch (e) {
                throw Error(`Error parsing file ${e}`)
            }}

            else {
                try {
                    // try and parse it as a path type file, i.e. the user has given a local file path,
                    // and we are to use the fs library to read the file stream from that file
                    const f = ocTypes.PathFileSchema.parse(file, {errorMap: ocTypes.customErrorMap})
                    formData.append('files', f.readable);
                } catch (e) {throw Error(`Error parsing file ${e}`)
                }
            }
    });
    formData.append('knowledgebase_name', knowledgeBaseName);
    if (metadataJson) {
        formData.append('metadata_json', JSON.stringify(metadataJson));
    }
    try {
        const response = await axios({
            method: 'post',
            url: BASE_URL + 'upload',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                ...formData.getHeaders(),
            },
            data: formData,
        });
        return response.status === 200;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return false;
    }
};

export const checkKbStatus = async ({knowledgeBaseName}: {
    knowledgeBaseName: string;
}) => {
    const response = await axios({
        method: 'get',
        url: BASE_URL + `knowledgebase/${knowledgeBaseName}/status`,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
    });
    return response.data;
};

export const awaitEmbeddings = async ({knowledgeBaseName, filename}: {
    filename: string;
    knowledgeBaseName: string;
}) => {
    while (true) {
        const files = await listFiles({knowledgeBaseName});
        if (!files.some(it => it.name === filename)) {
            throw new Error('file not found');
        }
        if (files.some(it => it.name === filename && it.has_embedding)) {
            return;
        }
        await sleep({ms: 1000});
    }
};

type CompletionArgs = {
    prompt: string;
    context_token_budget: number;
    model: string;
    temperature: number;
    max_tokens: number;
    stop: string;
    knowledge_base_name: string;
    metadata_filters: object;
    base_url: string;
    openai_api_key: string;
    api_key: string;
};

export const complete = async ({
                                   prompt,
                                   context_token_budget,
                                   model,
                                   temperature,
                                   max_tokens,
                                   stop,
                                   knowledge_base_name,
                                   metadata_filters,
                                   base_url,
                                   openai_api_key,
                                   api_key,
                               }: CompletionArgs): Promise<any[]> => {
    const result = await axios({
        method: 'post',
        url: base_url + 'context_completion',
        headers: {
            Authorization: `Bearer ${api_key}`,
        },
        data: {
            prompt: prompt,
            context_token_budget: context_token_budget,
            openai_api_key: openai_api_key,
            model: model,
            temperature: temperature,
            max_tokens: max_tokens,
            metadata_filters: metadata_filters,
            knowledge_base_name: knowledge_base_name,
            stop: stop,
        },
    });
    return result.data;
};

export * as OneContext from './index';
