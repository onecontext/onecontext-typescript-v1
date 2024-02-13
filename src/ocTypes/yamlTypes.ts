import * as z from "zod";

// ###
// steps
// ###

// steps
const stepEnum = z.enum(
    ["OCPreprocessor", "OCChunker", "UpdateOnDb", "FilterInMemory", "GetChunks", "SentenceTransformerEmbedder", "LexRank", "LouvainCommunityDetection", "KmeansClassifier", "HdbScan", "OCReranker", "OCRetriever"]
);


export const SubPipelineSchema = z.object({
        name: z.string(),
        steps: z.array(z.object({
            step: stepEnum,
            name: z.string(),
            step_args: z.union([z.object({
            }).passthrough().optional(),z.null()]),
            depends_on: z.array(z.string().optional())
        })),
    });


export const PipelineSchema = z.object({
    index: SubPipelineSchema,
    query: SubPipelineSchema.optional(),
    hooks: SubPipelineSchema.optional()
})


export type PipelineSchema = z.infer<typeof PipelineSchema>;