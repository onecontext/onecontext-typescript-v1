"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineSchema = exports.HooksPipelineSchema = exports.QueryPipelineSchema = exports.IndexPipelineSchema = exports.RerankerStageSchema = exports.RetrieverStageSchema = exports.ClustererStageSchema = exports.ScorerStageSchema = exports.EmbedderStageSchema = exports.ChunkerStageSchema = exports.PreprocessorStageSchema = exports.QueryStageSchema = exports.IndexStageSchema = void 0;
var z = require("zod");
// ###
// stages
// ###
// enums
var indexStages = {
    Preprocessor: "Preprocessor",
    Chunker: "Chunker",
    Embedder: "Embedder",
    Scorer: "Scorer",
    Clusterer: "Clusterer"
};
var queryStages = {
    Reranker: "Reranker",
    Retriever: "Retriever"
};
// enums
var indexStageEnum = z.nativeEnum(indexStages);
var queryStageEnum = z.nativeEnum(queryStages);
// ###
// steps
// ###
// tuples
// index
var preprocessorStepEnum = z.enum(["OCPreprocessor"]);
var chunkerStepEnum = z.enum(["OCChunker", "BCChunker"]);
var embedderStepEnum = z.enum(["SentenceTransformerEmbedder"]);
var scorerStepEnum = z.enum(["LexRank"]);
var clustererStepEnum = z.enum(["LouvainCommunityDetection", "KmeansClassifier"]);
var rerankerStepEnum = z.enum(["OCReranker"]);
var retrieverStepEnum = z.enum(["OCRetriever"]);
// ###
// generics
// ###
var IndexStageSchema = function (stageName, stepEnum) {
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
exports.IndexStageSchema = IndexStageSchema;
var QueryStageSchema = function (stageName, stepEnum) {
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
exports.QueryStageSchema = QueryStageSchema;
exports.PreprocessorStageSchema = (0, exports.IndexStageSchema)("Preprocessor", preprocessorStepEnum);
exports.ChunkerStageSchema = (0, exports.IndexStageSchema)("Chunker", chunkerStepEnum);
exports.EmbedderStageSchema = (0, exports.IndexStageSchema)("Embedder", embedderStepEnum);
exports.ScorerStageSchema = (0, exports.IndexStageSchema)("Scorer", scorerStepEnum);
exports.ClustererStageSchema = (0, exports.IndexStageSchema)("Clusterer", clustererStepEnum);
exports.RetrieverStageSchema = (0, exports.QueryStageSchema)("Retriever", retrieverStepEnum);
exports.RerankerStageSchema = (0, exports.QueryStageSchema)("Reranker", rerankerStepEnum);
exports.IndexPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage", [exports.PreprocessorStageSchema, exports.ChunkerStageSchema, exports.EmbedderStageSchema, exports.ScorerStageSchema, exports.ClustererStageSchema]))
});
exports.QueryPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage", [exports.RetrieverStageSchema, exports.RerankerStageSchema]))
});
exports.HooksPipelineSchema = z.object({
    name: z.string(),
    stages: z.array(z.discriminatedUnion("stage", [exports.ClustererStageSchema, exports.ScorerStageSchema]))
});
exports.PipelineSchema = z.object({
    index: exports.IndexPipelineSchema,
    query: exports.QueryPipelineSchema.optional(),
    hooks: exports.HooksPipelineSchema.optional()
});
