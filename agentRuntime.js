// This file will be used to run the agent.
// This will look at the agent object, grab its system prompt, its model from its attributes (or the default model if none is specified), and its tools from its children
// It will then call the model with the system prompt, the tools, and the user's message.
// It will be then given a response by the model.
// That response may include zero to many tool calls.
// Each tool call will then be performed by the tool. The tool will be called with the tool call's attributes (from parsing the tool call's attributes) and the tool call's inputs from the model's response.
// The tool will always return its result or an error - in accordance with the needs of the models when we reply with the tool call's result.
// Each tool call will be appended to the existing messages array as a user message.
// The agent will then be called again with the new messages array.
// This will continue until the agent's "stop" attribute is true and there are no more tool calls.
// The agent will then return the last assistant message that was returned from the listener function call.

// There will be two logging files:
// 1. The user's visible log file.
// 2. The logging file for the developer.

// Each tool call will be logged to a logging file for each session.
// Each message from the model will be logged to a logging file for each session.
// Each tool call's result will be logged to a logging file for each session.

// A notice of each tool call will be logged to the user's visible log file.
// Each message from the model will be logged to the user's visible log file.
// A notice of the completion of each tool call will be logged to the user's visible log file.

// an agent can be run multiple times with different user prompts. The messages array persists between runs.

// Anytime that the messages array is updated, it should be written to a session-specific json messages file.

exports.run = async (agent, userPrompt = null) => {
    if (userPrompt) {
        agent.addUserPrompt(userPrompt);
    }
    // const messagesFile = `messages-${agent.name}-${Date.now()}.json`;
    // const developerLogFile = `developer-log-${agent.name}-${Date.now()}.md`;
    // const userLogFile = `user-log-${agent.name}-${Date.now()}.md`;

    const systemPrompt = agent.getSystemPrompt();
    const model = agent.getModel();
    const tools = agent.getTools();

    console.log('Tools:', tools);

    const response = await model.run(systemPrompt, tools, agent.getMessages());

    agent.addMessage(response.getAssistantMessageFromLLM());

    const toolCalls = response.getToolCalls();

    if (toolCalls.length > 0) {
        const toolCallResults = await Promise.all(toolCalls.map(async (toolCall) => {
            console.log('Tool Call:', toolCall);
            console.log("Tool call inputs:", toolCall.input);

            const tool = tools.find((t) => {
                console.log('Tool:', t);
                console.log('Tool name:', t.name);
                console.log('Tool call name:', toolCall.name);
                return t.name === toolCall.name;
            });
            if (!tool) {
                console.error(`Tool ${toolCall.name} not found in available tools:`, tools.map(t => t.name));
                throw new Error(`Tool ${toolCall.name} not found`);
            }
            console.log(`Running tool: ${toolCall.name}`);
            agent.addDeveloperLog(`Running tool: ${toolCall.name} with inputs: ${JSON.stringify(toolCall.input)}`);
            agent.addUserLog(`Running tool: ${toolCall.name} with inputs: ${JSON.stringify(toolCall.input)}`);
            const toolCallResult = (await tool.run(toolCall.input));
            console.log('Tool call result:', toolCallResult);
            agent.addDeveloperLog(`Tool call ${toolCall.name} completed with result: ${JSON.stringify(toolCallResult)}`);
            agent.addUserLog(`Tool call ${toolCall.name} completed with result: ${JSON.stringify(toolCallResult)}`);
            return {
                ...toolCall,
                rawResult: toolCallResult,
            }
        }));

        console.log('Tool call results:', toolCallResults);
        const combinedToolResultMessage = mapRawToolCallResultsToAUserMessage(toolCallResults);
        console.log('Combined tool result message:', JSON.stringify(combinedToolResultMessage, null, 2));
        
        agent.addMessage(combinedToolResultMessage);

        // Call the LLM again to inform it of the tool results
        return await exports.run(agent);
    } else {
        return agent;
    }
}

/*
 This takes an array of 
 {
    type: 'tool_use',
    id: 'toolu_01DGSjv1Nv2LVwBNRwe6CcnN',
    name: 'TimeTool',
    input: { timezone: 'America/Los_Angeles' },
    rawResult: [ false, '2025-05-15T20:37:31.680Z' ]
  }
  and maps it to a user message.

 success case:

 // console.log("tool result:", result);
                        // return {
                        //     getToolCallResponseMessage: (toolCallId) => ({
                        //         role: 'user',
                        //         content: [
                        //             {
                        //                 type: 'tool_result',
                        //                 tool_use_id: toolCallId,
                        //                 content: {
                        //                     type: "text",
                        //                     text: typeof result === 'string' ? result : JSON.stringify(result)
                        //                 }
                        //             }
                        //         ]
                        //     })
                        // };

 error case:
 // return {
                        //     getToolCallResponseMessage: (toolCallId) => ({
                        //         role: 'user',
                        //         content: [
                        //             {
                        //                 type: 'tool_result',
                        //                 tool_use_id: toolCallId,
                        //                 content: error.message,
                        //                 is_error: true
                        //             }
                        //         ]
                        //     })
                        // };
*/
const mapRawToolCallResultsToAUserMessage = (rawToolCallResults) => {
    return {
        role: 'user',
        content: rawToolCallResults.map(t => {
            const {type, id, name, input, rawResult: [is_error, result]} = t;
            if (!is_error) {
                return {
                    type: 'tool_result',
                    tool_use_id: id,
                    content: [{
                        type: 'text',
                        text: result
                    }]
                }
            } else {
                return {
                    type: 'tool_result',
                    tool_use_id: id,
                    content: result,
                    is_error: true
                }
            }
        })
    }
}