import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './../.env' });

const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

const quiz_gen = async (quizGenArgs) => {

    const { userPromptPerTopic, metaDataFilters, knowledgeBaseName , totalNumberOfQuestions, extractPercentage, callback } = quizGenArgs;

    // check if "file_name" is in "metaDataFilters" keys:
    if (!Object.keys(metaDataFilters).includes("file_name")) {
        console.log("No file name specified. Please pass a 'file_name' key in the metadata filters.");
        return;
    }

    try {
        const config = {
            method: 'get',
            url: baseUrl + `quiz_completion` ,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            data: {
                metadata_filters: metaDataFilters,
                prompt_per_topic: userPromptPerTopic,
                knowledge_base_name: knowledgeBaseName,
                total_num_questions: totalNumberOfQuestions,
                extract_percentage: extractPercentage,
                openai_api_key: openaiApiKey,

            }
        };

        const response = await axios(config);

        callback(response);

    } catch (error) {
        console.error('Error creating quiz:', error);
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

const quizGenArgs = {
    userPromptPerTopic: prompt,
    metaDataFilters: {"file_name": ["poorcharlie.pdf"] , "description": "example"},
    knowledgeBaseName: 'rmtest',
    totalNumberOfQuestions: 10,
    extractPercentage: 0.5,
    callback: (r) => {
        if (r.status === 200) {
            console.log(r.data)
            console.log("Quiz request submitted successfully");
        } else {
            console.log("Failure");
        }
    }
};

quiz_gen(quizGenArgs);


