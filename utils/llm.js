const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const callWithRetry = async (systemPrompt, messages, tools, retriesRemaining = 3) => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            tools: tools.map(t => ({
                name: t.name,
                description: t.description,
                input_schema: t.input_schema,
            }))
        });
        return response;
    } catch (error) {
        if (retriesRemaining > 0) {
            console.log("Retrying API call", retriesRemaining, error.message);
            const waitTime = Math.max(0, 1000 - 300 * retriesRemaining);
            console.log("Waiting for", waitTime, "ms");
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return await callWithRetry(systemPrompt, messages, tools, retriesRemaining - 1);
        }
        throw error;
    }
};

const run = async (systemPrompt, tools, messages) => {
    console.log('Running LLM with Claude');
    console.log('System Prompt:', systemPrompt);
    console.log('Tools:', tools);
    
    try {
        const response = await callWithRetry(systemPrompt, messages, tools);
        console.log('Response:', response);
        return {
            getAssistantMessageFromLLM: () => ({
                role: 'assistant',
                content: response.content
            }),
            // For testing, don't return any tool calls
            getToolCalls: () => response.content.filter(c => c.type === 'tool_use')
        };
    } catch (error) {
        console.error('Error calling Claude:', error);
        throw error;
    }
};

module.exports = { run };