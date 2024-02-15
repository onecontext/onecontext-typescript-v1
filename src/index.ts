import axios from 'axios';
import {sleep} from './utils';
import * as generalTypes from "./ocTypes/generalTypes";
import * as yamlTypes from "./ocTypes/yamlTypes";
import * as ocErrors from "./ocTypes/errors";
import FormData from 'form-data';
import * as z from "zod";
import * as YAML from 'yaml';
import * as fs from 'fs';

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
        } else {
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
        } else {
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
        if (!listPipelinesArgs.verbose) {
            return response.data.map((it: { name: string; spec: string;}): string  => { return it.name });
        }
        else {
            return response.data
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};


export const run = async (runArgs: generalTypes.RunArgsType,
): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: runArgs.BASE_URL + `run`,
            headers: {
                Authorization: `Bearer ${runArgs.API_KEY}`,
            },
            data: {
                override_oc_yaml: runArgs.overrideOcYaml,
                pipeline_name: runArgs.pipelineName,
            },
        });
        return response.data;

    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const quizPipe = async (quizPipeArgs: generalTypes.QuizPipeArgType,
): Promise<any[] | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: quizPipeArgs.BASE_URL + `run_quiz`,
            headers: {
                Authorization: `Bearer ${quizPipeArgs.API_KEY}`,
            },
            data: {
                override_oc_yaml: quizPipeArgs.overrideOcYaml,
                cluster_label: quizPipeArgs.clusterLabel,
                pipeline_name: quizPipeArgs.pipelineName,
                openai_api_key: quizPipeArgs.OPENAI_API_KEY,
                prompt_per_topic: quizPipeArgs.promptPerTopic,
                total_num_questions: quizPipeArgs.totalNumQuestions
            },
        });
        return response.data;

    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};
export const listFiles = async (listFilesArgs: generalTypes.ListFilesType): Promise<{
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
        } else {
            console.error("Unknown error occurred")
            console.error(error)
            return []
        }
    }
};

export const checkRunCall = async (checkRunArgs: generalTypes.CheckRunType): Promise<{
    status: boolean
} | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: checkRunArgs.BASE_URL + `pipeline/${checkRunArgs.pipelineName}/${checkRunArgs.callId}`,
            headers: {
                Authorization: `Bearer ${checkRunArgs.API_KEY}`,
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
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
    return
};

// TODO - just make it a pipeline
export const generateQuest = async (genQuestArgs: generalTypes.GenerateQuestOptionsType): Promise<{
    topic: string;
    output: string
}[] | null> => {

    try {

        const parsedGenQuestArgs = generalTypes.GenerateQuestOptionsSchema.parse(
            {...genQuestArgs}
        )

        const result = await axios({
            method: 'get',
            url: parsedGenQuestArgs.BASE_URL + 'quest_gen',
            headers: {
                Authorization: `Bearer ${parsedGenQuestArgs.API_KEY}`,
            },
            data: {
                mission: parsedGenQuestArgs.mission,
                vision: parsedGenQuestArgs.vision,
                quest: parsedGenQuestArgs.quest,
                intro_prompt: parsedGenQuestArgs.introPrompt,
                intro_context_budget: parsedGenQuestArgs.introContextBudget,
                quiz_total_context_budget: parsedGenQuestArgs.quizTotalContextBudget,
                metadata_json: parsedGenQuestArgs.metadataJson,
                prompt_per_topic: parsedGenQuestArgs.promptPerTopic,
                pipeline_name: parsedGenQuestArgs.pipelineName,
                openai_api_key: parsedGenQuestArgs.OPENAI_API_KEY,
                total_num_questions: parsedGenQuestArgs.totalNumberOfQuestions,
                score_percentile_key: parsedGenQuestArgs.scorePercentileKey,
                cluster_label_key: parsedGenQuestArgs.clusterLabelKey,
                model: parsedGenQuestArgs.model,
                chunks_limit: parsedGenQuestArgs.chunksLimit
            },
        });
        return result.data;
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        }
        if (error instanceof z.ZodError) {
            console.log(`An error occurred in the validation of the arguments you passed. The validation error is: ${error}.`)
        }
        else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
    return null;
};


export const uploadDirectory = async ({
                                     directory,
                                     pipelineName,
                                     metadataJson,
                                     BASE_URL,
                                     API_KEY,
                                 }: generalTypes.UploadDirectoryType): Promise<boolean | undefined> => {


    const formData = new FormData();

    const files = await fs.promises.readdir(directory)

    files.forEach(file => {
        try {
            const f = generalTypes.PathFileSchema.parse({path: directory + file}, {errorMap: ocErrors.customErrorMap})
            formData.append('files', f.readable);
        } catch (e) {
            console.error(`Error parsing file ${e}`)
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
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
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
        } else {
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
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};
export const awaitEmbeddings = async (
    awaitEmbeddings: generalTypes.AwaitEmbeddingsType
): Promise<string | undefined> => {
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


export const contextCompletion = async (contextCompletionArgs: generalTypes.ContextCompletionArgsType): Promise<any[] | undefined> => {
    try {
        const result = await axios({
            method: 'get',
            url: contextCompletionArgs.BASE_URL + 'context_completion',
            headers: {
                Authorization: `Bearer ${contextCompletionArgs.API_KEY}`,
            },
            data: {
                prompt: contextCompletionArgs.prompt,
                context_token_budget: contextCompletionArgs.contextTokenBudget,
                openai_api_key: contextCompletionArgs.OPENAI_API_KEY,
                model: contextCompletionArgs.model,
                temperature: contextCompletionArgs.temperature,
                max_tokens: contextCompletionArgs.maxTokens,
                stop: contextCompletionArgs.stop,
                pipeline_name: contextCompletionArgs.pipelineName,
                metadata_json: contextCompletionArgs.metadataJson,
                score_percentile_key: contextCompletionArgs.scorePercentileKey,
                chunks_limit: contextCompletionArgs.chunksLimit
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
};

export const getPipe = async (getPipe: generalTypes.GetPipeType): Promise<any | null> => {
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
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};


export const parseYaml = async (parseYamlArgs: generalTypes.ParseYamlType): Promise<yamlTypes.PipelineSchema | string | null> => {

    try {
        if (!parseYamlArgs.overrides) {
            const pipe = yamlTypes.PipelineSchema.parse(YAML.parse(parseYamlArgs.yaml))
            return parseYamlArgs.asString ? YAML.stringify(pipe) : pipe
        }
        else {

            // if wildcard overrides are passed, just overwrite the values in the actual string
            const update = (stringYaml: string, updateObject: Record<string, string>) => {
                for (const [key, value] of Object.entries(updateObject)) {
                    stringYaml = stringYaml.replace(key, value)
                }
                return stringYaml
            }

            const stringYaml = parseYamlArgs.overrides.wildcardOverrides ? update(parseYamlArgs.yaml, parseYamlArgs.overrides.wildcardOverrides) : parseYamlArgs.yaml

            // now parse that string into an object
            let objectYaml = YAML.parse(stringYaml)

            if (parseYamlArgs.overrides.nestedOverrides) {
                let nestedOverriddenParsedYaml = {...objectYaml, ...parseYamlArgs.overrides.nestedOverrides}
                const pipe = yamlTypes.PipelineSchema.parse(nestedOverriddenParsedYaml, {errorMap: ocErrors.pipelineErrorMap})
                return parseYamlArgs.asString ? YAML.stringify(pipe) : pipe
            }

            else {
                const pipe = yamlTypes.PipelineSchema.parse(objectYaml, {errorMap: ocErrors.pipelineErrorMap})
                return parseYamlArgs.asString ? YAML.stringify(pipe) : pipe
            }

        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            if (parseYamlArgs.verboseErrorHandling) {
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
