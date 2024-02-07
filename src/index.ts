import axios from 'axios';
import {sleep} from './utils';
import * as generalTypes from "./ocTypes/generalTypes";
import * as yamlTypes from "./ocTypes/yamlTypes";
import * as ocErrors from "./ocTypes/errors";
import FormData from 'form-data';
import * as z from "zod";
import * as YAML from 'yaml';

export const callPipelineHooks = async (callPipelineArgs: generalTypes.CallPipelineType): Promise<any | null> => {

    try {
        const response = await axios({
            method: 'post',
            url: callPipelineArgs.BASE_URL + `pipeline/${callPipelineArgs.pipelineName}/hooks`,
            headers: {
                Authorization: `Bearer ${callPipelineArgs.API_KEY}`,
            },
            data: {
            },
        });
        console.log("Called all hooks for pipeline: " + callPipelineArgs.pipelineName)
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            return null;
        } else if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
            return null;
        }
        else {
            console.error("Unknown error occurred")
            return null
        }
    }
};

export const createPipeline = async (pipelineCreateArgs: generalTypes.PipelineCreateType): Promise<any> => {

    try {
        // first make sure it's a valid pipeline
        const parsedYaml = await parseYaml({yaml: pipelineCreateArgs.pipelineYaml, verboseErrorHandling: true})
        if (parsedYaml == null) {
            console.log("Failed to create pipeline: " + pipelineCreateArgs.pipelineName)
        } else {
            const response = await axios({
                method: 'post',
                url: pipelineCreateArgs.BASE_URL + 'pipeline',
                headers: {
                    Authorization: `Bearer ${pipelineCreateArgs.API_KEY}`,
                },
                data: {
                    name: pipelineCreateArgs.pipelineName,
                    oc_yaml: pipelineCreateArgs.pipelineYaml,
                },
            });
            console.log("Created pipeline: " + pipelineCreateArgs.pipelineName)
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors || error.message);
        }
        else {
            console.error("Unknown error occurred")
        }
    }
};

export const deletePipeline = async (pipelineDeleteArgs: generalTypes.PipelineDeleteType): Promise<any | null> => {
    try {
        const response = await axios({
            method: 'delete',
            url: pipelineDeleteArgs.BASE_URL + `pipeline/${pipelineDeleteArgs.pipelineName}`,
            headers: {
                Authorization: `Bearer ${pipelineDeleteArgs.API_KEY}`,
            },
        });
        console.log("Deleted pipeline: " + pipelineDeleteArgs.pipelineName)
        return response.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
        }
    }
    };

export const listPipelines = async (listPipelinesArgs: generalTypes.ListPipelinesType): Promise<{
    id: string; name: string;
}[] | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: listPipelinesArgs.BASE_URL + `pipeline`,
            headers: {
                Authorization: `Bearer ${listPipelinesArgs.API_KEY}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};


export const query = async (queryArgs: generalTypes.QuerySingleArgType,
): Promise<any[] | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: queryArgs.BASE_URL + `query`,
            headers: {
                Authorization: `Bearer ${queryArgs.API_KEY}`,
            },
            data: {
                override_oc_yaml: queryArgs.override_oc_yaml,
                pipeline_name: queryArgs.pipelineName,
            },
        });
        return response.data;

    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const listFiles = async ( listFilesArgs: generalTypes.ListFilesType ): Promise<{
    name: string;
    status: string;
    metadata_json: object;
}[] | []> => {
    try {
        const response = await axios({
            method: 'get',
            url: listFilesArgs.BASE_URL + `knowledgebase/${listFilesArgs.pipelineName}/files`,
            headers: {
                Authorization: `Bearer ${listFilesArgs.API_KEY}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
            return []
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
            return []
        }
    }
};

export const checkHooksCall = async ( checkHooksArgs: generalTypes.CheckHooksType ): Promise<{
    status: boolean } | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: checkHooksArgs.BASE_URL + `pipeline/${checkHooksArgs.pipelineName}/${checkHooksArgs.callId}`,
            headers: {
                Authorization: `Bearer ${checkHooksArgs.API_KEY}`,
            },
        });
        if (response.data == "Hook still in progress") {
            return {status: false};
        }
        if (response.data == "Hook has completed") {
            return {status: true};
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
    return
};


export const generateQuiz = async ({
                                       OPENAI_API_KEY,
                                       BASE_URL,
                                       API_KEY,
                                       userPromptPerTopic,
                                       metaDataFilters,
                                       pipelineName,
                                       clusterLabel,
                                       scorePercentileLabel,
                                       totalNumberOfQuestions,
                                       extractPercentage,
                                   }: generalTypes.GenerateQuizType): Promise<{ topic: string; output: string }[] | undefined> => {


    const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
    const missingVariables: string[] = requiredVariables.filter(variable => !userPromptPerTopic.includes(variable));
    if (missingVariables.length > 0) {
         console.error(`You are missing a required variable in the string you passed to userPromptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`)
        return
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
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
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
                                        BASE_URL,
                                        API_KEY,
                                        OPENAI_API_KEY,
                                    }: generalTypes.GenerateQuestOptionsType): Promise<{
    topic: string;
    output: string
}[] | null> => {
    try {
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
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
    return null;
};


export const uploadFile = async ({
                                     files,
                                     stream,
                                     pipelineName,
                                     metadataJson,
                                     BASE_URL,
                                     API_KEY,
                                 }: generalTypes.UploadFileType): Promise<boolean | undefined> => {
    const formData = new FormData();
    files.forEach(file => {
        if (stream) {
            try {
                // try and parse it as a content type file, i.e. if the user has passed a readable stream
                // of text, and has also passed a name for the file
                const f = generalTypes.ContentFileSchema.parse(file, {errorMap: ocErrors.customErrorMap});
                formData.append('files', f.readable, {
                    filename: f.name,
                    contentType: 'text/plain',
                })
            } catch (e) {
                throw Error(`Error parsing file ${e}`)
            }
        } else {
            try {
                // try and parse it as a path type file, i.e. the user has given a local file path,
                // and we are to use the fs library to read the file stream from that file
                const f = generalTypes.PathFileSchema.parse(file, {errorMap: ocErrors.customErrorMap})
                formData.append('files', f.readable);
            } catch (e) {
                throw Error(`Error parsing file ${e}`)
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
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};


export const checkPipelineStatus = async (
    checkPipe: generalTypes.CheckPipelineType): Promise<any> => {
    try {
        const response = await axios({
            method: 'get',
            url: checkPipe.BASE_URL + `knowledgebase/${checkPipe.pipelineName}/status`,
            headers: {
                Authorization: `Bearer ${checkPipe.API_KEY}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};
export const awaitEmbeddings = async (
    awaitEmbeddings: generalTypes.AwaitEmbeddingsType
): Promise<string|undefined> => {
    while (true) {
        const files = await listFiles({
                pipelineName: awaitEmbeddings.pipelineName,
                BASE_URL: awaitEmbeddings.BASE_URL,
                API_KEY: awaitEmbeddings.API_KEY
        });
        if (!files) {
            throw new Error('file not found');
        }
        if (files.some(it => it.name === awaitEmbeddings.fileName && it.status == "EMBEDDED")) {
            return "File has been embedded";
        }
        await sleep({ms: 1000});
    }
};


export const complete = async ({
                                   prompt,
                                   contextTokenBudget,
                                   model,
                                   temperature,
                                   maxTokens,
                                   stop,
                                   pipelineName,
                                   metadataFilters,
                                   BASE_URL,
                                   OPENAI_API_KEY,
                                   API_KEY,
                               }: generalTypes.CompletionArgsType): Promise<any[] | undefined> => {
    try {
    const result = await axios({
        method: 'post',
        url: BASE_URL + 'context_completion',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        data: {
            prompt: prompt,
            context_token_budget: contextTokenBudget,
            openai_api_key: OPENAI_API_KEY,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
            metadata_filters: metadataFilters,
            pipeline_name: pipelineName,
            stop: stop,
        },
    });
    return result.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const getChunks = async (
    getChunksArgs: generalTypes.GetChunksType): Promise<{}[] | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: getChunksArgs.BASE_URL + `knowledgebase/${getChunksArgs.pipelineName}/chunks`,
            headers: {
                Authorization: `Bearer ${getChunksArgs.API_KEY}`,
            },
            data: {
                metadata_filters: getChunksArgs.metaDataJson,
                top_k: getChunksArgs.top_k
            },
        })

        return response.data
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const getPipe = async (getPipe: generalTypes.GetPipeType ): Promise<any | null> => {
    try {
        const response = await axios({
            method: 'get',
            url: getPipe.BASE_URL + `pipeline/${getPipe.pipelineName}`,
            headers: {
                Authorization: `Bearer ${getPipe.API_KEY}`,
            },
        })

        return YAML.parse(response.data)
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};


export const parseYaml = async ({yaml, verboseErrorHandling}: {
    yaml: string,
    verboseErrorHandling: boolean
}): Promise<yamlTypes.PipelineSchema | null> => {
    try {
        return yamlTypes.PipelineSchema.parse(YAML.parse(yaml), {errorMap: ocErrors.pipelineErrorMap})
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (verboseErrorHandling) {
                console.log(error.message)
            } else {
                console.log(error.issues.map((issue) => issue.message).join("\n"));
            }
        }
        throw error
    }
}

export * from './ocTypes/generalTypes';
export * from './ocTypes/yamlTypes';
export * from './ocTypes/errors';
