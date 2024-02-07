// the union of a readable stream type and a file path
import * as fs from "fs";
import {Readable} from "stream";
import {z} from "zod";

export const BaseArgsSchema = z.object({
    BASE_URL: z.string().default("https://api.onecontext.ai"),
    API_KEY: z.string(),
});
export const OpenAIBaseArgsSchema = BaseArgsSchema.extend({
    OPENAI_API_KEY: z.string(),
});

export const GenerateQuestOptionsSchema = OpenAIBaseArgsSchema.extend({
    vision: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Vision cannot be empty"}),
    mission: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Mission cannot be empty"}),
    quest: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Quest cannot be empty"}),
    introPrompt: z.string().refine((val: string):boolean => val.trim() !== '', {message: "Intro prompt cannot be empty"}),
    introContextBudget: z.number().refine((val: number): boolean => val > 0, {message: "Intro context budget must be greater than 0"}),
    quizTotalContextBudget: z.number().refine((val: number): boolean => val > 0, {message: "Quiz total context budget must be greater than 0"}),
    userPromptPerTopic: z.string().refine((val: string): boolean => val.trim() !== '', {message: "User prompt cannot be empty"}),
    metaDataFilters: z.object({}).default({}),
    knowledgeBaseName: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Knowledge base name cannot be empty"}),
    totalNumberOfQuestions: z.number().refine((val: number): boolean => val > 0, {message: "Total number of questions must be greater than 0"}),
    model: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Model cannot be empty"}),
});


export const GenerateQuizArgsSchema = OpenAIBaseArgsSchema.extend({
    userPromptPerTopic: z.string().refine((val) => val.trim() !== '', {message: "User prompt cannot be empty"}).refine((val) => {
        const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
        const missingVariables: string[] = requiredVariables.filter(variable => !val.includes(variable));
        if (missingVariables.length > 0) {
            console.error(`You are missing a required variable in the string you passed to userPromptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`)
            return false
        }
        return true
    }),
    metaDataFilters: z.object({}).default({}),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    clusterLabel: z.string().optional(),
    scorePercentileLabel: z.string().optional(),
    totalNumberOfQuestions: z.number().refine((val) => val > 0, {message: "Total number of questions must be greater than 0"}),
    extractPercentage: z.number().refine((val) => val > 0 && val <= 100, {message: "Extract percentage must be between 0 and 100"}),
});

export const QuerySingleArgTypeSchema = BaseArgsSchema.extend({
    override_oc_yaml: z.string().optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
});
export const CheckHooksArgs = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    callId: z.string().refine((val) => val.trim() !== '', {message: "Call id cannot be empty"}),
});

export const ListFilesArgs = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
});

export const ContentFileSchema = BaseArgsSchema.extend({
    name: z.string().optional().transform((val, ctx) => {
        if (val && !val.endsWith(".txt")) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "'name' must end with .txt"});
        }
        return val;
    }),
    content: z.string().nullable(),
    readable: z.instanceof(Readable).optional(),
})
    .transform(data => {
        // If 'readable' is not provided, create a Readable stream from 'content'
        if (!data.readable && data.content) {
            const readable = new Readable();
            readable.push(data.content);
            readable.push(null); // End the stream
            return {...data, readable};
        }
        return data;
    });

export const CallPipelineSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
});

export const PathFileSchema = z.object({
    path: z.string().nullable(),
    readable: z.instanceof(Readable).optional(),
}).transform((data, ctx) => {
    // Ensure 'path' is a non-empty string and 'readable' is not already provided
    if (typeof data.path === 'string' && data.path.trim() !== '' && !data.readable) {
        try {
            const readable = fs.createReadStream(data.path);
            return {...data, readable};
        } catch (error) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "Error creating Readable stream"});
            // Handle the error or return data without the readable stream
        }
    }
    return data;
});

export const PipelineCreateSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    pipelineYaml: z.string(),
})
export const PipelineDeleteSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
})
export const ListPipelinesSchema = BaseArgsSchema.extend({
})
export const CheckPipelineSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
})
export const GetChunkArgsSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metaDataJson: z.object({}).default({}),
    top_k: z.union([z.number().refine((val) => val > 0, {message: "Top k must be greater than 0"}),z.null()])
})
export const GetPipeSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
})

export const AwaitEmbeddingsArgs = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    fileName: z.string().refine((val) => val.trim() !== '', {message: "Filename id cannot be empty"}),
})
export const FileSchema: z.ZodType = z.union([ContentFileSchema, PathFileSchema]);

export const UploadFileOptionsSchema = BaseArgsSchema.extend({
    files: z.array(FileSchema),
    stream: z.boolean(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metadataJson: z.object({}).optional(),
});

export const CompletionArgsSchema = OpenAIBaseArgsSchema.extend({
    prompt: z.string(),
    contextTokenBudget: z.number().refine((val) => val > 0, {message: "Context token budget must be greater than 0"}),
    model: z.string(),
    temperature: z.number().refine((val) => val > 0, {message: "Temperature must be greater than 0"}),
    maxTokens: z.number().refine((val) => val > 0, {message: "Max tokens must be greater than 0"}),
    stop: z.string(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metadataFilters: z.object({}).default({}),
});

export type CompletionArgsType = z.infer<typeof CompletionArgsSchema>
export type PipelineCreateType = z.infer<typeof PipelineCreateSchema>
export type AwaitEmbeddingsType = z.infer<typeof AwaitEmbeddingsArgs>
export type PipelineDeleteType = z.infer<typeof PipelineDeleteSchema>
export type CheckPipelineType = z.infer<typeof CheckPipelineSchema>
export type QuerySingleArgType = z.infer<typeof QuerySingleArgTypeSchema>
export type CallPipelineType = z.infer<typeof CallPipelineSchema>
export type ListPipelinesType = z.infer<typeof ListPipelinesSchema>
export type ListFilesType = z.infer<typeof ListFilesArgs>
export type CheckHooksType = z.infer<typeof CheckHooksArgs>
export type GenerateQuizType = z.infer<typeof GenerateQuizArgsSchema>
export type GenerateQuestOptionsType = z.infer<typeof GenerateQuestOptionsSchema>
export type UploadFileType = z.infer<typeof UploadFileOptionsSchema>
export type GetChunksType = z.infer<typeof GetChunkArgsSchema>
export type GetPipeType = z.infer<typeof GetPipeSchema>

