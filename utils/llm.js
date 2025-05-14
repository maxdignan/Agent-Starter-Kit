const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: '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',
});

const run = async (systemPrompt, tools, messages) => {
    console.log('Running LLM with Claude');
    console.log('System Prompt:', systemPrompt);
    console.log('Tools:', tools);
    
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            tools: tools.map(t => ({
            // this should be in accordance with claude-style tools
                name: t.name,
                description: t.description,
                input_schema: t.input_schema,
            }))
        });
        console.log('Response:', response);
        return {
            getAssistantMessage: () => ({
                role: 'assistant',
                content: response.content[0].text
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