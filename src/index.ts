import axios from 'axios';
import {flatKey, sleep} from './utils';
import * as generalTypes from "./ocTypes/generalArgs";
import * as yamlTypes from "./ocTypes/yamlValidation";
import * as ocErrors from "./ocTypes/errors";
import pl from 'nodejs-polars';
import FormData = require('form-data');
import * as z from "zod";
import * as YAML from 'yaml';

export const callPipelineHooks = async (callPipelineArgs: generalTypes.CallPipelineType) => {

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
    } catch (error) {
        console.log("Failed to call hooks for pipeline: " + callPipelineArgs.pipelineName)
        console.log(error.response.data);
        return null;
    }
};

export const createPipeline = async (pipelineCreate: generalTypes.PipelineCreateType) => {

    try {
        // first make sure it's a valid pipeline
        const parsedYaml = await parseYaml({yaml: pipelineCreate.pipelineYaml, verboseErrorHandling: true})
        if (parsedYaml == null) {
            console.log("Failed to create pipeline: " + pipelineCreate.pipelineName)
            return null
        } else {
            const response = await axios({
                method: 'post',
                url: pipelineCreate.BASE_URL + 'pipeline',
                headers: {
                    Authorization: `Bearer ${pipelineCreate.API_KEY}`,
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
export const deletePipeline = async ({pipelineDeleteArgs}: { pipelineDeleteArgs: generalTypes.PipelineDeleteType }) => {
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
    } catch (error) {
        console.log("Failed to delete pipeline: " + pipelineDeleteArgs.pipelineName)
        console.error(error.response.data.errors[0]);
        return null;
    }
};

export const listPipelines = async ({listPipelinesArgs}: {listPipelinesArgs: generalTypes.ListPipelinesType}): Promise<{
    id: string; name: string;
}[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: listPipelinesArgs.BASE_URL + `pipelines`,
            headers: {
                Authorization: `Bearer ${listPipelinesArgs.API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
};


export const query = async ({queryArgs, polarOp}: {
    queryArgs: generalTypes.QuerySingleArgType,
    polarOp?: Function
}): Promise<any[] | pl.DataFrame> => {
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

export const listFiles = async ({listFilesArgs}: { listFilesArgs: generalTypes.ListFilesType }): Promise<{
    name: string;
    status: string;
    metadata_json: object;
}[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: listFilesArgs.BASE_URL + `knowledgebase/${listFilesArgs.pipelineName}/files`,
            headers: {
                Authorization: `Bearer ${listFilesArgs.API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
};

export const checkHooksCall = async ({checkHooksArgs}: { checkHooksArgs: generalTypes.CheckHooksType }): Promise<{
    status: boolean
}> => {
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
    } catch (error) {
        console.log(error.response.data);
        return null;
    }
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
                                   }: generalTypes.GenerateQuizType): Promise<{ topic: string; output: string }[]> => {


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
}[]> => {
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


export const uploadFile = async ({
                                     files,
                                     stream,
                                     pipelineName,
                                     metadataJson,
                                     BASE_URL,
                                     API_KEY,
                                 }: generalTypes.UploadFileType): Promise<boolean> => {
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
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return false;
    }
};


export const checkPipelineStatus = async ({checkPipe}: {
    checkPipe: generalTypes.CheckPipelineType;
}) => {
    try {
        const response = await axios({
            method: 'get',
            url: checkPipe.BASE_URL + `knowledgebase/${checkPipe.pipelineName}/status`,
            headers: {
                Authorization: `Bearer ${checkPipe.API_KEY}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error.response.data.errors[0]);
        return null;
    }
};
export const awaitEmbeddings = async ({awaitEmbeddings}: {
    awaitEmbeddings: generalTypes.AwaitEmbeddingsType
}) => {
    while (true) {
        const files = await listFiles({listFilesArgs: {pipelineName: awaitEmbeddings.pipelineName}});
        if (!files.some(it => it.name === awaitEmbeddings.fileName)) {
            throw new Error('file not found');
        }
        if (files.some(it => it.name === awaitEmbeddings.fileName && it.status == "EMBEDDED")) {
            return;
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
                               }: generalTypes.CompletionArgsType): Promise<any[]> => {
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
};

export const getChunks = async ({getChunksArgs}: {
    getChunksArgs: generalTypes.GetChunksType
}): Promise<{}[]> => {
    try {
        const response = await axios({
            method: 'get',
            url: getChunksArgs.BASE_URL + `knowledgebase/${getChunksArgs.pipelineName}/chunks`,
            headers: {
                Authorization: `Bearer ${getChunksArgs.API_KEY}`,
            },
            data: {
                metadata_filters: getChunksArgs.metaDataJson,
            },
        })

        return response.data
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

export const getPipe = async ({getPipe}: { getPipe: generalTypes.GetPipeType }): Promise<any> => {
    try {
        const response = await axios({
            method: 'get',
            url: getPipe.BASE_URL + `pipeline/${getPipe.pipelineName}`,
            headers: {
                Authorization: `Bearer ${getPipe.API_KEY}`,
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
}): Promise<yamlTypes.PipelineSchema> => {
    try {
        return yamlTypes.PipelineSchema.parse(YAML.parse(yaml), {errorMap: ocErrors.pipelineErrorMap})
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
