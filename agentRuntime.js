exports.run = async (agent, userPrompt = null) => {
    if (userPrompt) {
        agent.addUserPrompt(userPrompt);
    }

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