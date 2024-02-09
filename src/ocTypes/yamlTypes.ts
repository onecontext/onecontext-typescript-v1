import * as z from "zod";

// ###
// steps
// ###

// steps
const stepEnum = z.enum(
    ["OCPreprocessor", "OCChunker", "UpdateOnDb", "FilterInMemory", "SentenceTransformerEmbedder", "LexRank", "LouvainCommunityDetection", "KmeansClassifier", "HdbScan", "OCReranker", "OCRetriever"]
);


export const SubPipelineSchema = z.object({
        name: z.string(),
        steps: z.array(z.object({
            step: stepEnum,
            name: z.string(),
            step_args: z.object({}),
            depends_on: z.array(z.string())
        })),
    });


export type SubPipelineSchema = z.infer<typeof SubPipelineSchema>;

export const PipelineSchema = z.object({
    index: SubPipelineSchema,
    query: SubPipelineSchema.optional(),
    hooks: SubPipelineSchema.optional()
})

export type PipelineSchema = z.infer<typeof PipelineSchema>;