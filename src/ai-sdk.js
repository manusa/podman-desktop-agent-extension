/**
 * @typedef {import('./extension-configuration.js')}.Configuration Configuration
 * @typedef {import('express').RequestHandler} RequestHandler
 */
/**
 * @typedef {Object} AiSdk
 * @type {Object}
 * @property {Configuration} configuration - The configuration object.
 * @property {import('http').Server} _server - The HTTP server instance.
 * @property {import('@ai-sdk/provider').LanguageModelV1} _model - The AI SDK compatible model instance.
 * @property {RequestHandler} _postMessages - The function to handle incoming messages (HTTP POST).
 * @property {function: void} start - Starts the LangGraph instance.
 * @property {function: void} close - Closes the LangGraph instance.
 */
import express from 'express';
import {streamText, experimental_createMCPClient as createMCPClient } from 'ai';
import {createGoogleGenerativeAI} from '@ai-sdk/google';

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
    _model: null,
    start: () => {
      console.log('Ai SDK: Starting...');
      try {
        const google = createGoogleGenerativeAI({
          apiKey: configuration.googleApiKey
        });
        aiSdk._model = google(configuration.model);
        const app = express();
        app.use(express.json());
        app.post('/api/v1/messages', aiSdk._postMessages)
        aiSdk._server = app.listen(configuration.aiSdkPort);
      } catch (err) {
        console.error('Error starting LangGraph:', err);
      }
    },
    close: async () => {
      console.log('Ai SDK: Closing...');
      aiSdk._server && aiSdk._server.close();
    },
    _postMessages: async (req, res) => {
      let mcpClient = null;
      let tools = null;
      try {
        mcpClient = await createMCPClient({
          transport: {
            type: 'sse',
            url: `http://localhost:${configuration.mcpPort}/sse`
          }
        });
        tools = await mcpClient.tools()
      } catch(err) {
        console.error('Error creating MCP client:', err);
      }
      const result = streamText({
        // model: openaiModel,
        model: aiSdk._model,
        tools: tools,
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
