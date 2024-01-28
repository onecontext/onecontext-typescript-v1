import * as z from "zod";
import * as wasi from "wasi";

// ###
// stages
// ###

// enums
const indexStages = {
    preProcessor: "PreProcessor",
    chunker: "Chunker",
    embedder: "Embedder",
    scorer: "Scorer",
    clusterer: "Clusterer"
} as const;


const queryStages = {
    reranker: "Reranker",
    retriever: "Retriever"
} as const;

// enums
const indexStageEnum = z.nativeEnum(indexStages);
const queryStageEnum = z.nativeEnum(queryStages);

// types
export type indexStageEnum = z.infer<typeof indexStageEnum>;
export type queryStageEnum = z.infer<typeof queryStageEnum>;

// ###
// steps
// ###

// tuples

// index
const preProcessorSteps = {
    OCPreprocessor: "OCPreprocessor"
} as const

const chunkerSteps = {
    OCChunker: "OCChunker"
    // to be padded out
} as const

const embedderSteps = {
    OCEmbedder: "OCEmbedder"
} as const

const scorerSteps = {
    LexRank: "LexRank"
    // to be padded out
} as const

const clustererSteps = {
    LouvainCommunityDetection: "LouvainCommunityDetection"
    // to be padded out
} as const

const indexSteps = {
    ...preProcessorSteps,
    ...chunkerSteps,
    ...embedderSteps,
    ...scorerSteps,
    ...clustererSteps
} as const
// index
const indexStepEnum = z.nativeEnum(indexSteps);
export type indexStepEnum = z.infer<typeof indexStepEnum>;

// query
const rerankerSteps = {
    OCReranker: "OCReranker"
} as const

const retrieverSteps = {
    OCRetriever: "OCRetriever"
} as const

const querySteps = {
    ...rerankerSteps,
    ...retrieverSteps
} as const

// query
const queryStepEnum = z.nativeEnum(querySteps);
export type queryStepEnum = z.infer<typeof queryStepEnum>;

// ###
// generics
// ###
export const IndexStageSchema = <StageName extends indexStageEnum, StepEnum extends indexStepEnum>(stageName: StageName, stepEnum: StepEnum) => {
    return z.object({
        stage: z.literal(stageName),
        steps: z.array(z.object({
            step: z.literal(stepEnum),
            name: z.string(),
            step_args: z.object({}).partial().default({}),
            depends_on: z.array(z.string())
        })),
    });
};
export const QueryStageSchema = <StageName extends queryStageEnum, StepEnum extends queryStepEnum>(stageName: StageName, stepEnum: StepEnum) => {
    return z.object({
        stage: z.literal(stageName),
        steps: z.array(z.object({
            step: z.literal(stepEnum),
            name: z.string(),
            step_args: z.object({}).partial().default({}),
            depends_on: z.array(z.string())
        })),
    });
};
export const PreprocessorStageSchema = IndexStageSchema("PreProcessor", "OCPreprocessor");
export const ChunkerStageSchema = IndexStageSchema("Chunker", "OCChunker");
export const EmbedderStageSchema = IndexStageSchema("Embedder", "OCEmbedder");
export const ScorerStageSchema = IndexStageSchema("Scorer", "LexRank");
export const ClustererStageSchema = IndexStageSchema("Clusterer", "LouvainCommunityDetection");
export const RetrieverStageSchema = QueryStageSchema("Retriever", "OCRetriever");
export const RerankerStageSchema = QueryStageSchema("Reranker", "OCReranker");

export const IndexPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.union([PreprocessorStageSchema, ChunkerStageSchema, EmbedderStageSchema, ScorerStageSchema, ClustererStageSchema]))
});

export const QueryPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.union([RetrieverStageSchema, RerankerStageSchema]))
});

export type IndexPipelineSchema = z.infer<typeof IndexPipelineSchema>;
export type QueryPipelineSchema = z.infer<typeof QueryPipelineSchema>;

export const PipelineSchema = z.object({
    index: IndexPipelineSchema,
    query: QueryPipelineSchema
})