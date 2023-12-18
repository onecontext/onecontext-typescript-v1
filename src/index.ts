import {Readable} from 'stream';
import axios from 'axios';
import FormData from 'form-data';
import 'dotenv/config'
import sleep from './../utils';

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const createKnowledgeBase = async ({knowledgeBaseName}: { knowledgeBaseName: string }) => {
    try {
        const response = await axios({
            method: 'post',
            url: BASE_URL + 'knowledge_bases',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                name: knowledgeBaseName,
                chunk_params: null,
                score_params: null,
                louvain_params: null,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const deleteKnowledgeBase = async ({knowledgeBaseName}: { knowledgeBaseName: string }) => {
    try {
        const response = await axios({
            method: 'delete',
            url: BASE_URL + `knowledge_bases/${knowledgeBaseName}`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const listFiles = async ({knowledgeBaseName}: { knowledgeBaseName: string }): Promise<{
    id: string; name: string; knowledge_base_id: string; has_embedding: boolean
}[]> => {
    const response = await axios({
        method: 'get',
        url: BASE_URL + `knowledge_bases/${knowledgeBaseName}/files`,
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        data: {
            knowledge_base_name: knowledgeBaseName,
        },
    });
    return response.data;
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
    files: { name: string; content: string }[];
    knowledgeBaseName: string;
    metadataJson?: object;
};

export const uploadFile = async ({
                                     files,
                                     knowledgeBaseName,
                                     metadataJson,
                                 }: UploadFileOptions): Promise<boolean> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', Readable.from(Buffer.from(file.content)), {
            filename: file.name,
            contentType: 'text/plain',
            knownLength: file.content.length,
        });
    });
    formData.append('knowledge_base_name', knowledgeBaseName);
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
        console.error(error);
        return false;
    }
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
        await sleep({ms:1000});
    }
};
