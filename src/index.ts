import axios from 'axios';
import * as dotenv from 'dotenv'
import {flatKey, sleep} from './utils';
import {generalArgs} from "./ocTypes/generalArgs";
import * as yamlValidation from "./ocTypes/yamlValidation";
import {ocErrors} from "./ocTypes/errors";
import pl from 'nodejs-polars';
import FormData = require('form-data');
import * as z from "zod";
import * as YAML from 'yaml';

dotenv.config({path: __dirname + '/../.env'});
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// read yaml from file simple.yaml
export const createKnowledgeBase = async (kbCreate : generalArgs.KnowledgeBaseCreateType ) => {
    try {
        const response = await axios({
            method: 'post',
            url: BASE_URL + 'knowledgebase',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                name: kbCreate.knowledgeBaseName,
                pipeline_yaml: kbCreate.pipelineYaml,
            },
        });
        console.log("Created knowledge base: " + kbCreate.knowledgeBaseName)
        return response.data;
    } catch (error) {
        console.log("Failed to create knowledge base: " + kbCreate.knowledgeBaseName)
        console.log(error)
        console.log(error.response.data.errors[0]);
        return null;
    }
};

export const createPipeline = async (pipelineCreate : generalArgs.PipelineCreateType ) => {

    try {
        // first make sure it's a valid pipeline
        const parsedYaml = await parseYaml({yaml: pipelineCreate.pipelineYaml, verboseErrorHandling: false})
        if (parsedYaml == null) {
            console.log("Failed to create pipeline: " + pipelineCreate.pipelineName)
            return null
        } else {
            const response = await axios({
                method: 'post',
                url: BASE_URL + 'pipeline',
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                },
                data: {
                    name: pipelineCreate.pipelineName,
                    oc_yaml: pipelineCreate.pipelineYaml,
                },
            });
            console.log("Created pipeline: " + pipelineCreate.pipelineName)
            return response.data;
        }
    } catch (error) {
        console.log("Failed to create pipeline: " + pipelineCreate.pipelineName)
        console.log(error.response.data);
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


export const query = async ({ queryArgs, polarOp }: { queryArgs: generalArgs.QuerySingleArgType, polarOp?: Function }): Promise<any[] | pl.DataFrame> => {
    try {
        const response = await axios({
            method: 'post',
            url: BASE_URL + `query`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                oc_yaml: queryArgs.oc_yaml,
                pipeline_name: queryArgs.pipelineName,
            },
        });

        if (polarOp) {
            const df: pl.DataFrame = pl.DataFrame(response.data['chunks']);
            return polarOp(df);
        } else {
            return flatKey({obj: response.data, key: 'metadata_json'});
        }
    } catch (error) {
        console.error(error.response?.data?.errors ?? error.message);
        return null;
    }
};

export const listFiles = async ({knowledgeBaseName}: { knowledgeBaseName: string }): Promise<{
    id: string; name: string; knowledgebase_id: string; status: string
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
    metaDataFilters: Record<string, Record<string, any>>;
    pipelineName: string;
    clusterLabel?: string;
    scorePercentileLabel?: string;
    totalNumberOfQuestions: number;
    extractPercentage: number;
};

export const generateQuiz = async ({
                                       userPromptPerTopic,
                                       metaDataFilters,
                                       pipelineName,
                                       clusterLabel,
                                       scorePercentileLabel,
                                       totalNumberOfQuestions,
                                       extractPercentage,
                                   }: GenerateQuizOptions): Promise<{ topic: string; output: string }[]> => {


    const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
    const missingVariables: string[] = requiredVariables.filter(variable => !userPromptPerTopic.includes(variable));
    if (missingVariables.length > 0) {
        console.error(`You are missing a required variable in the string you passed to userPromptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`)
        return null
    }

    try {

        const result = await axios({
            method: 'get',
            url: BASE_URL + 'quiz_completion',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                metadata_filters: metaDataFilters,
                prompt_per_topic: userPromptPerTopic,
                pipeline_name: pipelineName,
                cluster_label: clusterLabel,
                score_percentile_label: scorePercentileLabel,
                total_num_questions: totalNumberOfQuestions,
                extract_percentage: extractPercentage,
                openai_api_key: OPENAI_API_KEY,
            },
        });
        return result.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
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

export const generateQuest = async ({
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
    files: generalArgs.FileType[];
    stream: boolean;
    pipelineName: string;
    metadataJson?: object;
};

export const uploadFile = async ({
                                     files,
                                     stream,
                                     pipelineName,
                                     metadataJson,
                                 }: UploadFileOptions): Promise<boolean> => {
    const formData = new FormData();
    files.forEach(file => {
        if (stream) {
            try {
                // try and parse it as a content type file, i.e. if the user has passed a readable stream
                // of text, and has also passed a name for the file
                const f = generalArgs.ContentFileSchema.parse(file, {errorMap: ocErrors.customErrorMap});
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
                    const f = generalArgs.PathFileSchema.parse(file, {errorMap: ocErrors.customErrorMap})
                    formData.append('files', f.readable);
                } catch (e) {throw Error(`Error parsing file ${e}`)
                }
            }
    });
    formData.append('pipeline_name', pipelineName);
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
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `knowledgebase/${knowledgeBaseName}/status`,
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

export const checkPipelineStatus = async ({pipelineName}: {
    pipelineName: string;
}) => {
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `knowledgebase/${pipelineName}/status`,
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
export const awaitEmbeddings = async ({knowledgeBaseName, filename}: {
    filename: string;
    knowledgeBaseName: string;
}) => {
    while (true) {
        const files = await listFiles({knowledgeBaseName});
        if (!files.some(it => it.name === filename)) {
            throw new Error('file not found');
        }
        if (files.some(it => it.name === filename && it.status == "EMBEDDED")) {
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

export const getChunks = async ({ chunkArgs, polarOp }: { chunkArgs: generalArgs.GetChunkArgs, polarOp?: Function }): Promise<any[] | pl.DataFrame> => {
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `knowledgebase/${chunkArgs.knowledgeBaseName}/chunks`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            data: {
                metadata_filters: chunkArgs.metaDataJson,
            },
        })

        if (polarOp) {
            const df: pl.DataFrame = pl.DataFrame(response.data.map((obj: object) => flatKey({obj: obj, key: 'metadata_json'})));
            return polarOp(df);
        } else {
            return response.data
        }
    } catch (error) {
        console.error(error.message);
        return null;
    }
};


export const getPipe = async ({ pipelineName }: { pipelineName: string }): Promise<any> => {
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `pipeline/${pipelineName}`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        })

        return YAML.parse(response.data)
    } catch (error) {
        console.error(error.message);
        return null;
    }
};


export const parseYaml = async ({yaml, verboseErrorHandling}: {
    yaml: string,
    verboseErrorHandling: boolean
}): Promise<yamlValidation.PipelineSchema> => {
    try {
        return yamlValidation.PipelineSchema.parse(YAML.parse(yaml), {errorMap: ocErrors.pipelineErrorMap})
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (verboseErrorHandling) {
                console.log(error.message)
                return null
            } else {
                console.log(error.issues.map((issue) => issue.message).join("\n"));
                return null;
            }
        }
        throw error
    }
}

export * as OneContext from './index';
