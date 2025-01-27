# Project overview
The goal is to build a next.js app that allows users to upload PDF files, and use openAI structured output feature to extract information from the pdf file and convert to excel file. 
You will be using NextJS , shadcn, tailwind, Lucid icon

# Core functinalities
## 1. File upload and schema definition

Users should be able to upload one or more PDF files
Users should be able to define:
Individual fields (single value extractions)
Groups (array of objects with consistent structure)
For each group, users can define multiple fields inside, or even other groups
Start extraction with a button click
Set default schema to showcase how does this work
company: name of company
address: address of company
total sum: total amount we purchased
items (group):
item: name of item
unit price: unit price of item
quantity: quantity we purchased
sum: total amount we purchased
The file upload & schema definition UI should be side by side, where file upload takes less space and most of the space for schema definition
Server-side file processing

## 2. Text Extraction 

Use LlamaParser for PDF text extraction (server-side)
For each file, Combine all document chunks for complete text. Make sure return full text of all documents, not just the first one documents[0]
The llamaparser text extraction should happen immediately after user upload files to UI, and not wait for a button click
Strictly following ## 1. LlamaParser Documentation as code implementation example
After each file uploaded, it should be displayed as an item on the page, displaying the file name with a button to click to preview the full text extracted
User can keep adding new files to the list, previously uploaded files should be displayed
Server-side processing only

## 3. Data Processing

After clicking on 'Start Extraction', the data should be sent to OpenAI for processing across all files
Use OpenAI structured output for information extraction
Strictly following ## 2. OpenAI Documentation as code implementation example
## 4. File download. 
 Combine data processed from multiple PDFs into one excel file
When there are nested structures like {'company': 'xxx', 'items': [{'item': 'xxx', 'unit_price': 'xxx', 'quantity': 'xxx', 'sum': 'xxx'}]}, it should be flattened when generating the excel file
Implement proper error handling and type safety
Enable excel file download
Implement temporary file cleanup
# Doc
## 1. LlamaParser Documentation 
First, get an api key. We recommend putting your key in a file called .env that looks like this:

LLAMA_CLOUD_API_KEY=llx-xxxxxx

Set up a new TypeScript project in a new folder, we use this:

npm init
npm install -D typescript @types/node

LlamaParse support is built-in to LlamaIndex for TypeScript, so you'll need to install LlamaIndex.TS:

npm install llamaindex dotenv

Let's create a parse.ts file and put our dependencies in it:

import {
  LlamaParseReader,
  // we'll add more here later
} from "llamaindex";
import 'dotenv/config'

Now let's create our main function, which will load in fun facts about Canada and parse them:

async function main() {
  // save the file linked above as sf_budget.pdf, or change this to match
  const path = "./canada.pdf";

  // set up the llamaparse reader
  const reader = new LlamaParseReader({ resultType: "markdown" });

  // parse the document
  const documents = await reader.loadData(path);

  // print the parsed document
  console.log(documents)
}

main().catch(console.error);

Now run the file:

npx tsx parse.ts

Congratulations! You've parsed the file, and should see output that looks like this:

[
  Document {
    id_: '02f5e252-9dca-47fa-80b2-abdd902b911a',
    embedding: undefined,
    metadata: { file_path: './canada.pdf' },
    excludedEmbedMetadataKeys: [],
    excludedLlmMetadataKeys: [],
    relationships: {},
    text: '# Fun Facts About Canada\n' +
      '\n' +
      'We may be known as the Great White North, but
  ...etc...

Let's go a step further, and query this document using an LLM. For this, you will need an OpenAI API key (LlamaIndex supports dozens of LLMs, but OpenAI is the default). Get an OpenAI API key and add it to your .env file:

OPENAI_API_KEY=sk-proj-xxxxxx

Add the following to your imports (just below LlamaParse):

VectorStoreIndex,

And add this to your main function, below your console.log():

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const { response, sourceNodes } = await queryEngine.query({
    query: "What can you do in the Bay of Fundy?",
  });

  // Output response with sources
  console.log(response);

Which when you run it should give you this final output:

You can raft-surf the world's highest tides at the Bay of Fundy.

And that's it! You've now parsed a document and queried it with an LLM. You can now use this in your own TypeScript projects. Head over to the TypeScript docs to learn more about LlamaIndex in TypeScript.

## 2. OpenAI Documentation 

make sure to use gpt-4o model and zod for defining data structures.
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const ResearchPaperExtraction = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  keywords: z.array(z.string()),
});

const completion = await openai.beta.chat.completions.parse({
  model: "gpt-4o-2024-08-06",
  messages: [
    { role: "system", content: "You are an expert at structured data extraction. You will be given unstructured text from a research paper and should convert it into the given structure." },
    { role: "user", content: "..." },
  ],
  response_format: zodResponseFormat(ResearchPaperExtraction, "research_paper_extraction"),
});

const research_paper = completion.choices[0].message.parsed;

# Current file structure 

# Important implemenation notes 

#0. Adding logs

Always add server-side logs to your code so we can debug any potential issues
## 1. Project setup

All new components should go in /components at the root (not in the app folder) and be named like example-component.tsx unless otherwise specified
All new pages go in /app
Use the Next.js 14 app router
All data fetching should be done in a server component and pass the data down as props
Client components (useState, hooks, etc) require that 'use client' is set at the top of the file
## 2. Server-Side API Calls

All interactions with external APIs (e.g., Reddit, OpenAI) should be performed server-side.
Create dedicated API routes in the pages/api directory for each external API interaction.
Client-side components should fetch data through these API routes, not directly from external APIs.
## 3. Environment Variables

Store all sensitive information (API keys, credentials) in environment variables.
Use a .env.local file for local development and ensure it's listed in .gitignore.
For production, set environment variables in the deployment platform (e.g., Vercel).
Access environment variables only in server-side code or API routes.
## 4. Error Handling and Logging

Implement comprehensive error handling in both client-side components and server-side API routes.
Log errors on the server-side for debugging purposes.
Display user-friendly error messages on the client-side.

