// the union of a readable stream type and a file path
import * as fs from "fs";
import {Readable} from "stream";
import {z} from "zod";

export const QuerySingleArgTypeSchema = z.object({
    override_oc_yaml: z.string().optional(),
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Knowledge base name cannot be empty"}),
});

export const ContentFileSchema = z.object({
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

export const KnowledgeBaseCreateSchema = z.object({
    knowledgeBaseName: z.string().refine((val) => val.trim() !== '', {message: "Knowledgebase name cannot be empty"}),
    pipelineYaml: z.string().optional(),
})
export const PipelineCreateSchema = z.object({
    pipelineName: z.string().refine((val) => val.trim() !== '', {message: "Pipeline name cannot be empty"}),
    pipelineYaml: z.string().optional(),
})
export const GetChunkArgsSchema = z.object({
    knowledgeBaseName: z.string().refine((val) => val.trim() !== '', {message: "Knowledge base name cannot be empty"}),
    metaDataJson: z.object({}).default({}),
})


export type ContentFileType = z.infer<typeof ContentFileSchema>;
export type PathFileType = z.infer<typeof PathFileSchema>
export const FileSchema: z.ZodType = z.union([ContentFileSchema, PathFileSchema]);

export type FileType = z.infer<typeof FileSchema>
export type KnowledgeBaseCreateType = z.infer<typeof KnowledgeBaseCreateSchema>
export type PipelineCreateType = z.infer<typeof PipelineCreateSchema>
export type QuerySingleArgType = z.infer<typeof QuerySingleArgTypeSchema>
export type GetChunkArgs = z.infer<typeof GetChunkArgsSchema>

export * as generalArgs from "./generalArgs";
