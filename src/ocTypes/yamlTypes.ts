import * as z from "zod";

// ###
// steps
// ###

// steps
const stepEnum = z.enum(
  ["KnowledgeBaseFiles", "Preprocessor", "Chunker", "ChunkWriter", "UpdateOnDb", "FilterInMemory", "GetChunks", "SentenceTransformerEmbedder", "OpenAIEmbedder", "LexRank", "LouvainCommunityDetection", "KmeansClassifier", "HdbScan", "Reranker", "Retriever", "UpdateMetadata"]
);

export const PipelineSchema = z.object({
        steps: z.array(z.object({
            step: stepEnum,
            name: z.string(),
            step_args: z.union([z.object({
            }).passthrough().optional(),z.null()]),
            inputs: z.array(z.string().optional())
        })),
    });


export type PipelineSchema = z.infer<typeof PipelineSchema>;
