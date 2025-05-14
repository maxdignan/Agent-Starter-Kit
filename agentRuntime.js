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

const run = async (agent, userPrompt = null) => {
    if (userPrompt) {
        agent.addUserPrompt(userPrompt);
    }
    // const messagesFile = `messages-${agent.name}-${Date.now()}.json`;
    // const developerLogFile = `developer-log-${agent.name}-${Date.now()}.md`;
    // const userLogFile = `user-log-${agent.name}-${Date.now()}.md`;

    const systemPrompt = agent.getSystemPrompt();
    const model = agent.getModel();
    const tools = agent.getTools();

    const response = await model.run(systemPrompt, tools, agent.getMessages());

    agent.addMessage(response.getAssistantMessage());

    const toolCalls = response.getToolCalls();

    if (toolCalls.length > 0) {
        const toolCallResults = await Promise.all(toolCalls.map(async (toolCall) => {
            const tool = tools.find((t) => t.name === toolCall.name);
            agent.addDeveloperLog(`Running tool: ${toolCall.name} with attributes: ${JSON.stringify(toolCall.attributes)} and inputs: ${JSON.stringify(toolCall.inputs)}`);
            agent.addUserLog(`Running tool: ${toolCall.name} with attributes: ${JSON.stringify(toolCall.attributes)} and inputs: ${JSON.stringify(toolCall.inputs)}`);
            const toolCallResult = await tool.run(toolCall.attributes, toolCall.inputs);
            agent.addDeveloperLog(`Tool call ${toolCall.name} completed with result: ${JSON.stringify(toolCallResult)}`);
            agent.addUserLog(`Tool call ${toolCall.name} completed with result: ${JSON.stringify(toolCallResult)}`);
            return toolCallResult;
        }));

        toolCallResults.forEach((toolCallResult) => {
            agent.addMessage(toolCallResult.getToolCallResponseMessage());
        });

        return await run(agent);
    } else {
        return agent;
    }
}