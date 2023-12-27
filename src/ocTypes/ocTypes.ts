// the union of a readable stream type and a file path
import * as fs from "fs";
import {Readable} from "stream";
import {z} from "zod";

export const QuerySingleArgTypeSchema = z.object({
    query: z.string().refine((val) => val.trim() !== '', {message: "Query cannot be empty"}),
    knowledgeBaseName: z.string().refine((val) => val.trim() !== '', {message: "Knowledge base name cannot be empty"}),
    distanceMetric: z.enum(["cosine", "l2"]).default("cosine"),
    topK: z.number().int().optional().transform((val, ctx) => {
        if (val && val < 0) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "'topK' must be a positive integer"});
        }
        if (!val) {
            return 10;
        }
    }),
    rerank: z.object({
        rerankPoolSize: z.number().int().optional().transform((val, ctx) => {
            if (val && val < 0) {
                ctx.addIssue({code: z.ZodIssueCode.custom, message: "'rerankPoolSize' must be a positive integer"});
            } else {
                return val;
            }
        }),
        rerankFast: z.boolean(),
    }).default(null),
    out: z.enum(["id", "chunk", "content", "file", "embedding"]).default("chunk"),
    metaDataJson: z.object({}).partial().default({}),
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

export const customErrorMap: z.ZodErrorMap = (error, ctx) => {
    /*
    This is where you override the various error codes
    */
    switch (error.code) {
        case z.ZodIssueCode.invalid_type:
            if (error.expected === "string") {
                return {message: `This isn't a string!`};
            }
            break;
        case z.ZodIssueCode.custom:
            // produce a custom message using error.params
            // error.params won't be set unless you passed
            // a `params` arguments into a custom validator
            const params = error.params || {};
            if (params.myField) {
                return {message: `Bad input: ${params.myField}`};
            }
            break;
    }

    // fall back to default message!
    return {message: ctx.defaultError};
};

export type ContentFileType = z.infer<typeof ContentFileSchema>;
export type PathFileType = z.infer<typeof PathFileSchema>
export const FileSchema: z.ZodType = z.union([ContentFileSchema, PathFileSchema]);

export type FileType = z.infer<typeof FileSchema>
export type QuerySingleArgType = z.infer<typeof QuerySingleArgTypeSchema>

export * as ocTypes from "./ocTypes";
