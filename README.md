# Official OneContext TypeScript SDK
This is the official TypeScript SDK for the OneContext platform. Use this SDK to connect your Node backend applications, Node CLI tools, and front-end WebApps to OneContext's platform. 

## What is OneContext?
OneContext is a platform that enables software engineers to compose and deploy custom RAG pipelines on SOTA infrastructure. You define the pipeline in YAML, and OneContext takes care of the rest of the infra (SSL certs, DNS, Kubernetes cluster, GPUs, autoscaling, load balancing, etc).

## Where can I learn more about how it works?
Check out our docs page [here](https://docs.onecontext.ai/). The below examples will also help you get started, but they are intended as a quickstart, rather than a fundamental overview of the platform.

## Sounds great. How do I get started?
If you've already read the docs, or are just keen to learn by doing, you can follow the below steps to get started with the SDK in minutes.

## Setup

### Install the SDK

#### Get it from npm (recommended)

```zsh
npm install @onecontext/sdk
```

#### Get an API key
You can get an API key [here](https://onecontext.ai/settings)

#### Put the API key in your environment
The easiest way to do this is to put it in a `.env` file in the root of your project. Use `dotenv` to load it into your environment.

#### Clone this repo and play around with the demo in the "quickstart" folder
For example:
```ts
// Create a .env file and add your API_KEY 
import * as dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: __dirname + '/../.env'});
```