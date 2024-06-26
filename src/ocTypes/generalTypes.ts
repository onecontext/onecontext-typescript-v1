import * as fs from "fs";
import { Readable } from "stream";
import { z } from "zod";

export const BaseSchema = z.object({
  BASE_URL: z.string().default("https://api.onecontext.ai/v1/"),
  API_KEY: z.string(),
});
export const OpenAIBaseSchema = BaseSchema.extend({
  OPENAI_API_KEY: z.string(),
  model: z.string().default("gpt-3.5-turbo").optional(),
});

type PollMethodType = z.infer<typeof BaseSchema> & Record<string, unknown>

export const QuickStartCreateSchema = BaseSchema.extend({
  name: z.string().refine((val) => val.trim() !== '', { message: "Name cannot be empty" }),
});


export const RunSchema = BaseSchema.extend({
  overrideArgs: z.object({}).default({}).optional(),
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
});


export const RunResultsSchema = BaseSchema.extend({
  skip: z.number().default(0).optional(),
  limit: z.number().default(10).optional(),
  sort: z.string().default("date_created").optional(),
  dateCreatedGte: z.date().default(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).optional(),
  dateCreatedLte: z.date().default(new Date()).optional(),
  runid: z.string().optional(),
  status: z.string().optional()
});

export const DeleteFilesSchema = BaseSchema.extend({
  knowledgeBaseName: z.string().refine((val: any) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
  fileNames: z.array(z.string()).refine((val: any) => val.length > 0, { message: "File names cannot be empty" }),
});
export const ListFilesSchema = BaseSchema.extend({
  knowledgeBaseNames: z.array(z.string()),
  skip: z.number().default(0).optional(),
  limit: z.number().default(10).optional(),
  sort: z.string().default("date_created").optional(),
  dateCreatedGte: z.date().default(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).optional(),
  dateCreatedLte: z.date().default(new Date()).optional(),
  metadataJson: z.object({}).default({}).optional(),
});

export const ContentFileSchema = BaseSchema.extend({
  name: z.string().optional().transform((val, ctx) => {
    if (val && !val.endsWith(".txt")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "'name' must end with .txt" });
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
      return { ...data, readable };
    }
    return data;
  });

export const CallPipelineSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
  overrideOcYaml: z.string().optional(),
});

export const PathFileSchema = z.object({
  path: z.string().refine((val) => val.trim() !== '', { message: "Path cannot be empty" }),
  readable: z.instanceof(Readable).optional(),
}).transform((data, ctx) => {
  // Ensure 'path' is a non-empty string and 'readable' is not already provided
  if (typeof data.path === 'string' && data.path.trim() !== '' && !data.readable) {
    try {
      const readable = fs.createReadStream(data.path);
      return { ...data, readable };
    } catch (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Error creating Readable stream" });
      // Handle the error or return data without the readable stream
    }
  }
  return data;
});

export const KnowledgeBaseCreateSchema = BaseSchema.extend({
  knowledgeBaseName: z.string().refine((val) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
})

export const VectorIndexCreateSchema = BaseSchema.extend({
  vectorIndexName: z.string().refine((val) => val.trim() !== '', { message: "Vector Index name cannot be empty" }),
  modelName: z.string().refine((val) => val.trim() !== '', { message: "Model name cannot be empty" }),
})

export const PipelineCreateSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
  pipelineYaml: z.string(),
})
export const YouTubeUrlSchema = BaseSchema.extend({
  urls: z.array(z.string()),
  knowledgeBaseName: z.string().refine((val) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
})
export const VectorIndexDeleteSchema = BaseSchema.extend({
  vectorIndexName: z.string().refine((val) => val.trim() !== '', { message: "Vector Index name cannot be empty" }),
})
export const KnowledgeBaseDeleteSchema = BaseSchema.extend({
  knowledgeBaseName: z.string().refine((val) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
})
export const PipelineDeleteSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
})
export const ListKnowledgeBasesSchema = BaseSchema.extend({
})
export const ListPipelinesSchema = BaseSchema.extend({
  verbose: z.boolean().default(false).optional()
})
export const ListVectorIndicesSchema = BaseSchema.extend({
})
export const CheckPipelineSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
})
export const GetChunksSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
  metaDataJson: z.object({}).default({}).optional(),
  top_k: z.union([z.number().refine((val) => val > 0, { message: "Top k must be greater than 0" }), z.null()])
})
export const GetPipeSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
})

export const AwaitEmbeddingsSchema = BaseSchema.extend({
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
  fileName: z.string().refine((val) => val.trim() !== '', { message: "Filename id cannot be empty" }),
})
export const FileSchema: z.ZodType = z.union([ContentFileSchema, PathFileSchema]);

export const UploadFilesSchema = BaseSchema.extend({
  files: z.array(FileSchema),
  stream: z.boolean(),
  directory: z.union([z.null(), z.string()]).default(null).optional(),
  knowledgeBaseName: z.string().refine((val) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
  metadataJson: z.object({}).optional(),
});


export const UploadDirectorySchema = BaseSchema.extend({
  directory: z.string().refine((val) => val.endsWith("/"), { message: "Directory must end with /" }),
  knowledgeBaseName: z.string().refine((val) => val.trim() !== '', { message: "Knowledge Base name cannot be empty" }),
  metadataJson: z.object({}).optional(),
});

export const ContextCompletionSchema = OpenAIBaseSchema.extend({
  prompt: z.string().superRefine((val, ctx) => {
    if (!val.includes("{chunks}")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prompt must include the variable '{chunks}', which will serve as the entry-point into which the relevant context will be injected by OneContext." });
      return false;
    }
    if (val.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prompt cannot be empty" });
      return false;
    }
    return true
  }),
  contextTokenBudget: z.number().refine((val) => val > 0, { message: "Context token budget must be greater than 0" }),
  model: z.string().default("gpt-3.5-turbo").optional(),
  temperature: z.number().refine((val) => val > 0, { message: "Temperature must be greater than 0" }).default(0.7).optional(),
  maxTokens: z.number().refine((val) => val > 0, { message: "Max tokens must be greater than 0" }).optional().default(10_000),
  stop: z.string().default("STOP").optional(),
  pipelineName: z.string().refine((val) => val.trim() !== '', { message: "Pipeline name cannot be empty" }),
  metadataJson: z.object({}).default({}).optional(),
  chunksLimit: z.number().refine((val) =>
    val > 0, "Chunks limit must be greater than 0"
  ).default(30).optional(),
  scorePercentileKey: z.string().default("lexrank.percentile_score").optional(),
});

export type ContextCompletionType = z.infer<typeof ContextCompletionSchema>
export type PipelineCreateType = z.infer<typeof PipelineCreateSchema>
export type VectorIndexCreateType = z.infer<typeof VectorIndexCreateSchema>
export type KnowledgeBaseCreateType = z.infer<typeof KnowledgeBaseCreateSchema>
export type YouTubeUrlType = z.infer<typeof YouTubeUrlSchema>
export type AwaitEmbeddingsType = z.infer<typeof AwaitEmbeddingsSchema>
export type PipelineDeleteType = z.infer<typeof PipelineDeleteSchema>
export type VectorIndexDeleteType = z.infer<typeof VectorIndexDeleteSchema>
export type KnowledgeBaseDeleteType = z.infer<typeof KnowledgeBaseDeleteSchema>
export type CheckPipelineType = z.infer<typeof CheckPipelineSchema>
export type RunType = z.infer<typeof RunSchema>
export type CallPipelineType = z.infer<typeof CallPipelineSchema>
export type ListPipelinesType = z.infer<typeof ListPipelinesSchema>
export type ListKnowledgeBasesType = z.infer<typeof ListKnowledgeBasesSchema>
export type ListVectorIndicesType = z.infer<typeof ListVectorIndicesSchema>
export type ListFilesType = z.infer<typeof ListFilesSchema>
export type DeleteFilesType = z.infer<typeof DeleteFilesSchema>
export type RunResultsType = z.infer<typeof RunResultsSchema>
export type UploadFilesType = z.infer<typeof UploadFilesSchema>
export type UploadDirectoryType = z.infer<typeof UploadDirectorySchema>
export type GetChunksType = z.infer<typeof GetChunksSchema>
export type QuickStartCreateType = z.infer<typeof QuickStartCreateSchema>
export type GetPipeType = z.infer<typeof GetPipeSchema>

export interface PollArgsType {
  method: (pollMethodArgs: PollMethodType) => Promise<string>
  fnArgs: PollMethodType
}
