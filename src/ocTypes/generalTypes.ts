// the union of a readable stream type and a file path
import * as fs from "fs";
import {Readable} from "stream";
import {z} from "zod";

export const BaseArgsSchema = z.object({
    BASE_URL: z.string().default("https://api.onecontext.ai/v1/"),
    API_KEY: z.string(),
});
export const OpenAIBaseArgsSchema = BaseArgsSchema.extend({
    OPENAI_API_KEY: z.string(),
    model: z.string().default("gpt-3.5-turbo").optional(),
});

export const GenerateQuestOptionsSchema = OpenAIBaseArgsSchema.extend({
    vision: z.string().optional(),
    mission: z.string().optional(),
    quest: z.string().optional(),
    introPrompt: z.string().optional(),
    introContextBudget: z.number().refine((val: number): boolean => val > 0, {message: "Intro context budget must be greater than 0"}),
    quizTotalContextBudget: z.number().refine((val: number): boolean => val > 0, {message: "Quiz total context budget must be greater than 0"}),
    promptPerTopic: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Prompt per topic cannot be empty"}),
    metaDataFilters: z.object({}).default({}),
    pipelineName: z.string().refine((val: string): boolean => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    totalNumberOfQuestions: z.number().refine((val: number): boolean => val > 0, {message: "Total number of questions must be greater than 0"}),
    chunksLimit: z.union([z.number().refine((val: number): boolean => val > 0, {message: "Chunks limit must be greater than 0"}), z.null()]).default(30),
    scorePercentileKey: z.string().optional(),
    clusterLabelKey: z.string().optional(),
}).superRefine((val, ctx) => {
    // make sure they have passed the required variables in the promptPerTopic IF they have overridden
    if (val.promptPerTopic !== undefined) {
        const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
        const missingVariables: string[] = requiredVariables.filter(variable => !val.promptPerTopic.includes(variable));
        if (missingVariables.length > 0) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: `You are missing a required variable in the override string you passed to promptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`, path: ['promptPerTopic']})
            return false
        }
        return true
    } else {
        return true
    }
})


export const GenerateQuizArgsSchema = OpenAIBaseArgsSchema.extend({
    promptPerTopic: z.string().optional(),
    metaDataFilters: z.object({}).default({}),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    clusterLabel: z.string().optional(),
    scorePercentileLabel: z.string().optional(),
    totalNumberOfQuestions: z.number().refine((val) => val > 0, {message: "Total number of questions must be greater than 0"}),
    extractPercentage: z.number().refine((val) => val > 0 && val <= 100, {message: "Extract percentage must be between 0 and 100"}),
    chunksLimit: z.union([z.number().refine((val) => val > 0, {message: "Chunks limit must be greater than 0"}), z.null()]).default(30),
}).superRefine((val, ctx) => {
    if (val.promptPerTopic !== undefined) {
        const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
        const missingVariables: string[] = requiredVariables.filter(variable => !val.promptPerTopic?.includes(variable));
        if (missingVariables.length > 0) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: `You are missing a required variable in the override string you passed to promptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`, path: ['promptPerTopic']})
            return false
        }
        return true
    }
})

export const QuerySingleArgTypeSchema = BaseArgsSchema.extend({
    override_oc_yaml: z.string().optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
});
export const QuizPipeArgTypeSchema = OpenAIBaseArgsSchema.extend({
    overrideOcYaml: z.string().optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    totalNumQuestions: z.number(),
    promptPerTopic: z.string(),
    clusterLabel: z.string()
}).superRefine((val, ctx) => {
    if (val.promptPerTopic !== undefined) {
        const requiredVariables: string[] = ['{topic}', '{chunks}', '{num_questions_topic}'];
        const missingVariables: string[] = requiredVariables.filter(variable => !val.promptPerTopic?.includes(variable));
        if (missingVariables.length > 0) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: `You are missing a required variable in the override string you passed to promptPerTopic. You are missing (and must include) the following variables: ${missingVariables.join(', ')}`, path: ['promptPerTopic']})
            return false
        }
        return true
    }
})
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
    overrideOcYaml: z.string().optional(),
});

export const PathFileSchema = z.object({
    path: z.string().refine((val) => val.trim() !== '', {message: "Path cannot be empty"}),
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
    verbose: z.boolean().default(false).optional()
})
export const CheckPipelineSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
})
export const GetChunkArgsSchema = BaseArgsSchema.extend({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metaDataJson: z.object({}).default({}).optional(),
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
    directory: z.union([z.null(),z.string()]).default(null).optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metadataJson: z.object({}).optional(),
});

export const ParseYamlSchema = z.object({
    yaml: z.string(),
    verboseErrorHandling: z.boolean().default(false).optional(),
    overrides: z.object({
        nestedOverrides: z.object({}).passthrough().optional(),
        wildcardOverrides: z.record(z.string()).optional(),
    }).default({}).optional(),
    asString: z.boolean().default(false).optional(),
})


export const UploadDirectoryOptionsSchema = BaseArgsSchema.extend({
    directory: z.string().refine((val) => val.endsWith("/"), {message: "Directory must end with /"}),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metadataJson: z.object({}).optional(),
});

export const ContextCompletionArgsSchema = OpenAIBaseArgsSchema.extend({
    prompt: z.string().superRefine((val, ctx) => {
        if (!val.includes("{chunks}")) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "Prompt must include the variable '{chunks}', which will serve as the entry-point into which the relevant context will be injected by OneContext."});
            return false;
        }
        if (val.trim() === "") {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "Prompt cannot be empty"});
            return false;
        }
        return true
    }),
    contextTokenBudget: z.number().refine((val) => val > 0, {message: "Context token budget must be greater than 0"}),
    model: z.string().default("gpt-3.5-turbo").optional(),
    temperature: z.number().refine((val) => val > 0, {message: "Temperature must be greater than 0"}).default(0.7).optional(),
    maxTokens: z.number().refine((val) => val > 0, {message: "Max tokens must be greater than 0"}).optional().default(10_000),
    stop: z.string().default("STOP").optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    metadataFilters: z.object({}).default({}).optional(),
    chunksLimit: z.number().refine((val) =>
        val > 0, "Chunks limit must be greater than 0"
    ).default(30).optional(),
    scorePercentileKey: z.string().default("lexrank.percentile_score").optional(),
});

export type ContextCompletionArgsType = z.infer<typeof ContextCompletionArgsSchema>
export type PipelineCreateType = z.infer<typeof PipelineCreateSchema>
export type AwaitEmbeddingsType = z.infer<typeof AwaitEmbeddingsArgs>
export type PipelineDeleteType = z.infer<typeof PipelineDeleteSchema>
export type CheckPipelineType = z.infer<typeof CheckPipelineSchema>
export type QuerySingleArgType = z.infer<typeof QuerySingleArgTypeSchema>
export type QuizPipeArgType = z.infer<typeof QuizPipeArgTypeSchema>
export type CallPipelineType = z.infer<typeof CallPipelineSchema>
export type ListPipelinesType = z.infer<typeof ListPipelinesSchema>
export type ListFilesType = z.infer<typeof ListFilesArgs>
export type CheckHooksType = z.infer<typeof CheckHooksArgs>
export type GenerateQuizType = z.infer<typeof GenerateQuizArgsSchema>
export type GenerateQuestOptionsType = z.infer<typeof GenerateQuestOptionsSchema>
export type UploadFileType = z.infer<typeof UploadFileOptionsSchema>
export type UploadDirectoryType = z.infer<typeof UploadDirectoryOptionsSchema>
export type GetChunksType = z.infer<typeof GetChunkArgsSchema>
export type GetPipeType = z.infer<typeof GetPipeSchema>
export type ParseYamlType = z.infer<typeof ParseYamlSchema>

