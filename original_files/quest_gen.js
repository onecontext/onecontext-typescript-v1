import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './../.env' });

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

const quest_gen = async (questGenArgs) => {

    const { vision, userMission, quest, introPrompt, introContextBudget, quizTotalContextBudget,metaDataFilters,  userPromptPerTopic, knowledgeBaseName , totalNumberOfQuestions, model, callback } = questGenArgs;

    try {
        const config = {
            method: 'get',
            url: baseUrl + `quest_gen` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },

            data: {
                vision: vision,
                user_mission: userMission,
                quest: quest,
                intro_prompt: introPrompt,
                intro_context_budget: introContextBudget,
                quiz_total_context_budget: quizTotalContextBudget,
                metadata_filters: metaDataFilters,
                prompt_per_topic: userPromptPerTopic,
                knowledge_base_name: knowledgeBaseName,
                total_num_questions: totalNumberOfQuestions,
                openai_api_key: openaiApiKey,
                model: model

            }
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error creating quiz:', error.response.data.errors[0]);
    }
};

const prompt = `
Please create {num_questions_topic} questions based on the most important information
for a student from the provided text.

Provide the QUESTION and four multiple choice answers. 

The first answer must be exactly correct. The other three 
must seem plausible answers to the question but must NOT be correct. For the NOT 
correct options: make them feasible alternatives, but do not make their meaning
overlap with the correct option.

Make sure that the questions fall into one of these topics (broadly interpreted):

{topic}

DO NOT include questions that are completely unrelated to this topic.

Be sure to vary the questions according to:
- Difficulty
- depth of answer ie provide some questions where the answers are a full sentence
- conceptual understanding vs factual knowledge
- really test the student of their understanding of the key concepts

Provide questions that help the student understand the core topics of the text, not incidental facts.

DO NOT ask questions about:
- advertisements
- specifics relating to the youtube channel i.e. number of subscribers or upcoming events

Assume the student has read the text but do provide context for your questions. i.e. "What does the text say about X?" is a bad question, instead ask a meaningful question about the concept X.

TEXT:
{docs}

Use the following format:

#QUESTION START#:\n
Question:[The relevant question]\n
#ANSWERS START#\n
ANSWER: [The Correct Answer 1]\n
ANSWER: [Answer 2]\n
ANSWER: [Answer 3]\n

Repeat this format {num_questions_topic} times`

const questGenArgs = {
    vision: "sipping a glass of champagne with Jennifer in an apartment we have just bought in Gramercy Park, and calling my parents to tell them that I’ve made partner.",
    userMission: "Being promoted to partner at Benchmark by 2029.",
    quest:"Strategies for Investment Excellence: The Charlie Munger Approach",
    introPrompt: null,
    introContextBudget: 10_000,
    quizTotalContextBudget: 10_000,
    metaDataFilters: null,
    promptPerTopic: prompt,
    knowledgeBaseName: "rmtest",
    totalNumberOfQuestions: 20,
    model: "gpt-4-1106-preview",
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data)
            console.log("Quest generated successfully");
        } else {
            console.log("Failure");
        }
    }
};

quest_gen(questGenArgs);


