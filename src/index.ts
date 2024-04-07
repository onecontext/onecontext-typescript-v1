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
import {PollArgsType} from "./ocTypes/generalTypes.js";
import {textWithColor, textWithIntSelectedColor} from "./rmUtils.js";
import ora from "ora";


export const createPipeline = async (pipelineCreateArgs: generalTypes.PipelineCreateType): Promise<any> => {

    try {
        // first make sure it's a valid pipeline
        const parsedYaml = await parseYaml({ yaml: pipelineCreateArgs.pipelineYaml, verboseErrorHandling: true })
        if (parsedYaml == null) {
            console.log("Failed to create pipeline: " + pipelineCreateArgs.pipelineName)
        } else {
            await axios({
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
            console.log(error)
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

export const arun = async (runArgs: generalTypes.RunArgsType,
): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'post',
            url: runArgs.BASE_URL + `submit-run`,
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

export const checkRunCall = async (checkRunArgs: generalTypes.CheckRunType): Promise<
  {id: string, steps: any, status: string}
  | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: checkRunArgs.BASE_URL + `run_results/${checkRunArgs.callId}`,
            headers: {
                Authorization: `Bearer ${checkRunArgs.API_KEY}`,
            },
        });
        return response.data
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


export const poll = async (pollArgs: PollArgsType): Promise<any | undefined> => {
    try {
        const spinner = ora({text: `Initialising Workflow.`, spinner: 'dots'}).start();
        const runID = await pollArgs.method(pollArgs.fnArgs)
        spinner.text = `\u2710 Workflow Created. Got RunID: ${textWithColor(runID,"green")}\n`
        while (true) {
            if (runID) {
                const runResults = await getRunResults({
                    BASE_URL: pollArgs.fnArgs.BASE_URL,
                    API_KEY: pollArgs.fnArgs.API_KEY,
                    runID: runID
                })
                if (runResults.status === "FAILED") {
                    spinner.text = `\u1F6A8 Workflow hit an error along the way!. Please check the logs for more information.\n`
                    spinner.stopAndPersist()
                    return runResults
                }
                if (runResults.status === "SUCCESSFUL") {
                    spinner.text = `\u2705  Workflow Completed Successfully! Please check the logs for full details\n`
                    spinner.stopAndPersist()
                    return runResults
                }
                if (runResults.status === "RUNNING") {
                    await sleep({ms: 1000});
                    if (Object.keys(runResults.steps).length == 0) {
                        spinner.text = `Workflow is running. No steps have been completed yet.`
                    }
                    if (Object.keys(runResults.steps).length > 0) {
                        const { text, color } = textWithIntSelectedColor(runResults.steps[Object.keys(runResults.steps).at(-1) as string].step_name,Object.keys(runResults.steps).length, true)
                        spinner.color = color;
                        spinner.text = `Currently on step name: ${text}`
                        } else {
                        
                    }
                }
            } else {
                console.log("No run ID was ever generated")
                break
            }
        }
    } catch (error: unknown) {
        if (error instanceof axios.AxiosError) {
            console.log(error.response?.data?.errors ?? error.message);
        } else {
            console.error("Unknown error occurred")
            console.error(error)
        }
    }
}
export const getRunResults = async({BASE_URL, API_KEY, runID}:{ BASE_URL: string, API_KEY: string, runID: string }): Promise<any | undefined> => {
    try {
        const response = await axios({
            method: 'get',
            url: BASE_URL + `run_results/${runID}`,
            headers: {
                Authorization: `Bearer ${API_KEY}`,
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
                                          pipelineName,
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
        // TODO: add run id and to return type
        return response.data
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
            return(error.response?.data?.errors ?? error.message)
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

export * from './ocTypes/generalTypes.js';
export * from './ocTypes/yamlTypes.js';
export * from './ocTypes/errors.js';
