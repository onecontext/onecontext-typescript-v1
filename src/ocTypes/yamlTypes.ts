import * as z from "zod";

// ###
// stages
// ###

// enums
const indexStages = {
    Preprocessor: "Preprocessor",
    Chunker: "Chunker",
    Embedder: "Embedder",
    Scorer: "Scorer",
    Clusterer: "Clusterer"
} as const;


const queryStages = {
    Reranker: "Reranker",
    Retriever: "Retriever",
    Scorer: "Scorer",
    Clusterer: "Clusterer"
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
const preprocessorStepEnum = z.enum(["OCPreprocessor"]);
const chunkerStepEnum = z.enum(["OCChunker", "BCChunker"]);
const embedderStepEnum = z.enum(["SentenceTransformerEmbedder"]);
const scorerStepEnum = z.enum(["LexRank"]);
const clustererStepEnum = z.enum(["LouvainCommunityDetection", "KmeansClassifier"]);

const rerankerStepEnum = z.enum(["OCReranker"]);
const retrieverStepEnum = z.enum(["OCRetriever"]);


// ###
// generics
// ###
export const IndexStageSchema = <StageName extends indexStageEnum, StepEnum extends z.ZodEnum<any>>(stageName: StageName, stepEnum: StepEnum) => {
    return z.object({
        stage: z.literal(stageName),
        steps: z.array(z.object({
            step: stepEnum,
            name: z.string(),
            step_args: z.object({}),
            depends_on: z.array(z.string())
        })),
    });
};
export const QueryStageSchema = <StageName extends queryStageEnum, StepEnum extends z.ZodEnum<any>>(stageName: StageName, stepEnum: StepEnum) => {
    return z.object({
        stage: z.literal(stageName),
        steps: z.array(z.object({
            step: stepEnum,
            name: z.string(),
            step_args: z.object({}).partial().default({}),
            depends_on: z.array(z.string())
        })),
    });
};
export const PreprocessorStageSchema = IndexStageSchema("Preprocessor", preprocessorStepEnum);
export const ChunkerStageSchema = IndexStageSchema("Chunker", chunkerStepEnum);
export const EmbedderStageSchema = IndexStageSchema("Embedder", embedderStepEnum);
export const ScorerStageSchema = IndexStageSchema("Scorer", scorerStepEnum);
export const ClustererStageSchema = IndexStageSchema("Clusterer", clustererStepEnum);
export const RetrieverStageSchema = QueryStageSchema("Retriever", retrieverStepEnum);
export const RerankerStageSchema = QueryStageSchema("Reranker", rerankerStepEnum);

export const IndexPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage",[PreprocessorStageSchema, ChunkerStageSchema, EmbedderStageSchema, ScorerStageSchema, ClustererStageSchema]))
});

export const QueryPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage",[RetrieverStageSchema, RerankerStageSchema]))
});

export const HooksPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage",[ClustererStageSchema, ScorerStageSchema]))
});

export type IndexPipelineSchema = z.infer<typeof IndexPipelineSchema>;
export type QueryPipelineSchema = z.infer<typeof QueryPipelineSchema>;
export type HooksPipelineSchema = z.infer<typeof HooksPipelineSchema>;

export const PipelineSchema = z.object({
    index: IndexPipelineSchema,
    query: QueryPipelineSchema.optional(),
    hooks: HooksPipelineSchema.optional()
})

export type PipelineSchema = z.infer<typeof PipelineSchema>;