import axios from 'axios';
import {sleep} from './utils.js';
import * as generalTypes from "./ocTypes/generalTypes.js";
import * as yamlTypes from "./ocTypes/yamlTypes.js";
import * as ocErrors from "./ocTypes/errors.js";
import FormData from 'form-data';
import * as z from "zod";
import * as YAML from 'yaml';
import * as fs from 'fs';
import * as path from "path"
import {PollArgsType, RunResultsType} from "./ocTypes/generalTypes.js";
import {textWithColor, textWithIntSelectedColor} from "./rmUtils.js";
import ora from "ora";
import React from 'react';
import {render, Text} from 'ink';
import Spinner from 'ink-spinner';

export const uploadYouTubeUrl = async (youtubeUrlArgs: generalTypes.YouTubeUrlType): Promise<any> => {

    try {
        const response: any = await axios({
            method: 'post',
            url: youtubeUrlArgs.BASE_URL + 'yt_urls',
            headers: {
                Authorization: `Bearer ${youtubeUrlArgs.API_KEY}`,
            },
            data: {
                urls: youtubeUrlArgs.urls,
                knowledgebase_name: youtubeUrlArgs.knowledgeBaseName
            },
        });
        return response.data
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
        } else {
            console.log(error)
            console.error("Unknown error occurred")
        }
    }
};

export const createVectorIndex = async (vectorIndexCreateArgs: generalTypes.VectorIndexCreateType): Promise<any> => {

    try {
        return await axios({
            method: 'post',
            url: vectorIndexCreateArgs.BASE_URL + 'index',
            headers: {
                Authorization: `Bearer ${vectorIndexCreateArgs.API_KEY}`,
            },
            data: {
                name: vectorIndexCreateArgs.vectorIndexName,
                model_name: vectorIndexCreateArgs.modelName
            },
        });
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
        } else {
            console.log(error)
            console.error("Unknown error occurred")
        }
    }
};
export const createKnowledgeBase = async (knowledgeBaseCreateArgs: generalTypes.KnowledgeBaseCreateType): Promise<any> => {

    try {
        const response = await axios({
            method: 'post',
            url: knowledgeBaseCreateArgs.BASE_URL + 'knowledgebase',
            headers: {
                Authorization: `Bearer ${knowledgeBaseCreateArgs.API_KEY}`,
            },
            data: {
                name: knowledgeBaseCreateArgs.knowledgeBaseName,
            },
        });
        return response
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
        } else {
            console.log(error)
            console.error("Unknown error occurred")
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
            return await axios({
                method: 'post',
                url: pipelineCreateArgs.BASE_URL + 'pipeline',
                headers: {
                    Authorization: `Bearer ${pipelineCreateArgs.API_KEY}`,
                },
                data: {
                    name: pipelineCreateArgs.pipelineName,
                    yaml_config: pipelineCreateArgs.pipelineYaml,
                },
            });
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
        } else {
            console.log(error)
            console.error("Unknown error occurred")
        }
    }
};

export const deleteKnowledgeBase = async (knowledgeBaseDeleteArgs: generalTypes.KnowledgeBaseDeleteType): Promise<any | null> => {
    try {
        return await axios({
            method: 'delete',
            url: knowledgeBaseDeleteArgs.BASE_URL + `knowledgebase` + `/${knowledgeBaseDeleteArgs.knowledgeBaseName}`,
            headers: {
                Authorization: `Bearer ${knowledgeBaseDeleteArgs.API_KEY}`,
            },
        });
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
        }
    }
};
export const deleteVectorIndex = async (vectorIndexDeleteArgs: generalTypes.VectorIndexDeleteType): Promise<any | null> => {
    try {
        return await axios({
            method: 'delete',
            url: vectorIndexDeleteArgs.BASE_URL + `index` + `/${vectorIndexDeleteArgs.vectorIndexName}`,
            headers: {
                Authorization: `Bearer ${vectorIndexDeleteArgs.API_KEY}`,
            },
        });
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
        }
    }
};
export const deletePipeline = async (pipelineDeleteArgs: generalTypes.PipelineDeleteType): Promise<any | null> => {
    try {
        return await axios({
            method: 'delete',
            url: pipelineDeleteArgs.BASE_URL + `pipeline/${pipelineDeleteArgs.pipelineName}`,
            headers: {
                Authorization: `Bearer ${pipelineDeleteArgs.API_KEY}`,
            },
        });
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
        }
    }
};

export const listKnowledgeBases = async (listKnowledgeBasesArgs: generalTypes.ListKnowledgeBasesType): Promise<{
    id: string; name: string;
}[] | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: listKnowledgeBasesArgs.BASE_URL + `knowledgebase`,
            headers: {
                Authorization: `Bearer ${listKnowledgeBasesArgs.API_KEY}`,
            },
        });
        return response.data
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.response?.data?.detail ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};
export const listPipelines = async (listPipelinesArgs: generalTypes.ListPipelinesType): Promise<{
    name: string; yaml_config: string;
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
            return response.data.map((it: { name: string; yaml_config: string; }): {name: string} => {
                return {name: it.name}
            });
        } else {
            return response.data.map((it: { name: string; yaml_config: string; }): {name: string, yaml_config: string} => {
                return it 
            });
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.response?.data?.detail ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const listVectorIndices = async (listVectorIndicesArgs: generalTypes.ListVectorIndicesType): Promise<{
    name: string; model_name: string;
}[] | undefined> => {
    try {
       const response = await axios({
            method: 'get',
            url: listVectorIndicesArgs.BASE_URL + `index`,
            headers: {
                Authorization: `Bearer ${listVectorIndicesArgs.API_KEY}`,
            },
        });
       return response.data
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.response?.data?.detail ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const runPipeline = async (runArgs: generalTypes.RunArgsType,
): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: runArgs.BASE_URL + `run`,
            headers: {
                Authorization: `Bearer ${runArgs.API_KEY}`,
            },
            data: {
                override_args: runArgs.overrideArgs,
                pipeline_name: runArgs.pipelineName,
            },
        });
        return response.data;

    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};

export const aRunPipeline = async (runArgs: generalTypes.RunArgsType,
): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: runArgs.BASE_URL + `submit-run`,
            headers: {
                Authorization: `Bearer ${runArgs.API_KEY}`,
            },
            data: {
                override_args: runArgs.overrideArgs,
                pipeline_name: runArgs.pipelineName,
            },
        });
        return response.data;

    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.detail || error.response?.data?.errors || error.message);
            console.log(error.response?.data ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
};
export const runSummary = async (runArgs: generalTypes.RunArgsType,
): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: runArgs.BASE_URL + `submit-run`,
            headers: {
                Authorization: `Bearer ${runArgs.API_KEY}`,
            },
            data: {
                override_args: runArgs.overrideArgs,
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

export const listFiles = async (listFilesArgs: generalTypes.ListFilesType): Promise<any> => {
    const strippedObject = {...Object.fromEntries(Object.entries(listFilesArgs).filter(([key, _]) => key !== "BASE_URL" && key !== "API_KEY"))}
    // rename some of the keys , i.e. runID to run_id
    const renamedObject = Object.fromEntries(Object.entries(strippedObject).map(([key, value]) => {
        switch (key) {
            case "dateCreatedGte":
                return ["date_created_gte", value]
            case "knowledgeBaseName":
                return ["knowledgebase_name", value]
            case "dateCreatedLte":
                return ["date_created_lte", value]
            case "metadataJson":
                return ["metadata_json", value]
            default:
                return [key, value]
        }
    }))
    try {
        const response = await axios({
            method: 'get',
            url: listFilesArgs.BASE_URL + `knowledgebase/files/`,
            params: {
                // the runResults object without the BASE_URL and API_KEY attributes, and with some keys renamed from camel case to snake case for the Python backend
                ...renamedObject
            },
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

export const getRunResults = async (runResults: RunResultsType): Promise<any | undefined> => {
    const strippedObject = {...Object.fromEntries(Object.entries(runResults).filter(([key, _]) => key !== "BASE_URL" && key !== "API_KEY"))}
    // rename some of the keys , i.e. runID to run_id
    const renamedObject = Object.fromEntries(Object.entries(strippedObject).map(([key, value]) => {
        switch (key) {
            case "runID":
                return ["run_id", value]
            case "runid":
                return ["run_id", value]
            case "dateCreatedGte":
                return ["date_created_gte", value]
            case "dateCreatedLte":
                return ["date_created_lte", value]
            default:
                return [key, value]
        }
    }))
    try {
        const response = await axios({
            method: 'get',
            url: runResults.BASE_URL + `run_results/`,
            params: {
            // the runResults object without the BASE_URL and API_KEY attributes, and with some keys renamed from camel case to snake case for the Python backend
                ...renamedObject
            },
            headers: {
                Authorization: `Bearer ${runResults.API_KEY}`,
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
}
export const uploadDirectory = async ({
                                          directory,
                                          knowledgeBaseName,
                                          metadataJson,
                                          BASE_URL,
                                          API_KEY,
                                      }: generalTypes.UploadDirectoryType): Promise<any | undefined> => {

    const formData = new FormData();

    const files = await fs.promises.readdir(directory)

    files.forEach(file => {
        try {
            if ([".txt", ".pdf", ".docx", ".doc"].includes(path.extname(file).toLowerCase())) {
                console.log(`Adding file: ${file}`)
                const f = generalTypes.PathFileSchema.parse({path: directory + file}, {errorMap: ocErrors.customErrorMap})
                formData.append('files', f.readable);
            }
        } catch (e) {
            console.error(`Error parsing file ${e}`)
        }
    });

    formData.append('knowledgebase_name', knowledgeBaseName);

    if (metadataJson) {
        formData.append('metadata_json', JSON.stringify(metadataJson));
    }

    try {
        return await axios({
            method: 'post',
            url: BASE_URL + 'upload',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                ...formData.getHeaders(),
            },
            data: formData,
        });
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
                                     knowledgeBaseName,
                                     metadataJson,
                                     BASE_URL,
                                     API_KEY,
                                 }: generalTypes.UploadFileType): Promise<any | undefined> => {
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
    formData.append('knowledgebase_name', knowledgeBaseName);
    if (metadataJson) {
        formData.append('metadata_json', JSON.stringify(metadataJson));
    }
    try {
        return await axios({
            method: 'post',
            url: BASE_URL + 'upload',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                ...formData.getHeaders(),
            },
            data: formData,
        });
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

export const contextCompletion = async (contextCompletionArgs: generalTypes.ContextCompletionArgsType): Promise<any[] | string> => {
    try {
        const result = await axios({
            method: 'post',
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
            return (error.response?.data?.errors ?? error.message)
        } else {
            console.error("Unknown error occurred")
            console.error(error)
            return "Pipeline not found"
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
        } else {

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
            } else {
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

export * from './ocTypes/generalTypes.js';
export * from './ocTypes/yamlTypes.js';
export * from './ocTypes/errors.js';
