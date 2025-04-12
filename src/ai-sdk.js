/**
 * @typedef {import('./configuration.js')}.Configuration Configuration
 * @typedef {import('express').RequestHandler} RequestHandler
 */
/**
 * @typedef {Object} AiSdk
 * @type {Object}
 * @property {Configuration} configuration - The configuration object.
 * @property {import('http').Server} _server - The HTTP server instance.
 * @property {RequestHandler} _postMessages - The function to handle incoming messages (HTTP POST).
 * @property {function: void} start - Starts the LangGraph instance.
 * @property {function: void} close - Closes the LangGraph instance.
 */
import express from 'express';
import {streamText, experimental_createMCPClient as createMCPClient, wrapLanguageModel, simulateStreamingMiddleware} from 'ai';
import {createGoogleGenerativeAI} from '@ai-sdk/google';

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const openAiSystemPrompt =
  'Knowledge Cutoff Date: April 2024.\n' +
  `Today's Date: ${new Date().toISOString().split('T')[0]}.\n` +
  'You are Granite, developed by IBM. You are a helpful AI assistant with access to the tools listed next. ' +
  'When a tool is required to answer the user\'s query, respond with `<tool_call>` followed by a JSON object of the tool used. ' +
  'For example: `<tool_call> {"name":"function_name","arguments":{"arg1":"value"}} </tool_call>` or if it has no arguments `<tool_call> {"name":"function_name","arguments":{}} </tool_call>`' +
  'The user will respond with the output of the tool execution response so you can continue with the rest of the initial user prompt (continue).\n' +
  'If a tool does not exist in the provided list of tools, notify the user that you do not have the ability to fulfill the request.';

/**
 * Creates a new LangGraph instance.
 * @param {Object} options - The options for the LangGraph instance.
 * @param {Configuration} options.configuration - The configuration object.
 *
 * @returns {AiSdk}
 */
export const newAiSdk = ({configuration}) => {
  /** @type {AiSdk} */
  const aiSdk = {
    configuration,
    _server: null,
    start: () => {
      console.log('AI SDK: Starting...');
      try {
        const app = express();
        // TODO: proper CORS handling
        app.use((req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
          );
          next();
        });
        app.use(express.json());
        app.post('/api/v1/messages', aiSdk._postMessages);
        aiSdk._server = app.listen(configuration.aiSdkPort);
      } catch (err) {
        console.error('AI SDK: error starting', err);
      }
    },
    close: async () => {
      console.log('AI SDK: Closing...');
      aiSdk._server && aiSdk._server.close();
    },
    _postMessages: async (req, res) => {
      console.log('AI SDK: New message request');
      let systemPrompt;
      let model;
      if ((await configuration.provider()).toLowerCase() === 'openai') {
        systemPrompt = openAiSystemPrompt;
        console.log('AI SDK: Using OpenAI');
        const openai = createOpenAICompatible({
          name: 'openai-compatible-provider',
          apiKey: await configuration.openAiApiKey(),
          baseURL: await configuration.openAiBaseUrl(),
        });
        model = openai(await configuration.openAiModel());
        // Tool calling doesn't seem to be supported in stream mode for Ollama
        model = wrapLanguageModel({
          model: openai(await configuration.openAiModel()),
          middleware: simulateStreamingMiddleware()
        });
      } else {
        console.log('AI SDK: Using Google');
        const google = createGoogleGenerativeAI({
          apiKey: await configuration.googleApiKey()
        });
        model = google(await configuration.googleModel());
      }
      let mcpClient = null;
      let tools = null;
      try {
        mcpClient = await createMCPClient({
          transport: {
            type: 'sse',
            url: `http://localhost:${await configuration.mcpPort()}/sse`
          }
        });
        tools = await mcpClient.tools();
      } catch (err) {
        console.error('AI SDK: Error creating MCP client:', err);
      }
      const result = streamText({
        system: systemPrompt,
        model,
        tools,
        experimental_continueSteps: true,
        toolCallStreaming: false,
        maxSteps: 99,
        messages: req.body.messages,
        onFinish: () => mcpClient && mcpClient.close(),
        onError: err => {
          console.error(err);
          mcpClient && mcpClient.close();
        }
      });
      result.pipeDataStreamToResponse(res);
    }
  };
  return aiSdk;
};
