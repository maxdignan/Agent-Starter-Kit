const llm = require('./utils/llm');

// Agent class implementation based on usage in agentParser.js and agentRuntime.js
class Agent {
    constructor(parsed) {
        this.tag = parsed.tag;
        this.attributes = parsed.attributes || {};
        this.children = parsed.children || [];
        this.name = this.tag;
        this.messages = [];
        this.developerLogs = [];
        this.userLogs = [];
    }

    addUserPrompt(userPrompt) {
        this.messages.push({
            role: 'user',
            content: userPrompt
        });
    }

    getSystemPrompt() {
        return this.attributes.systemPrompt || '';
    }

    // this should return a callable object that has a run method that takes a system prompt, tools, and messages and calls an LLM. In this case, the llm will be claude-3.5-sonnet.
    getModel() {
        return {
            run: async (systemPrompt, tools, messages) => {
                // this should call the LLM in the utils/llm.js file
                const response = await llm.run(systemPrompt, tools, messages);
                return response;
            }
        };
    }

    getTools() {
        const tools = this.children.filter(child => child.isTool || child.tag?.endsWith('Tool'));
        return tools.map(tool => {
            const toolName = tool.tag.replace('Tool', '').toLowerCase();
            const toolModule = require(`./tools/${toolName}`);
            return {
                name: tool.tag,
                description: tool.description || toolModule[toolName].description || '',
                input_schema: tool.input_schema || toolModule[toolName].input_schema || {},
                run: async (attributes, inputs) => {
                    try {
                        const result = await toolModule[toolName](attributes, inputs);
                        return {
                            getToolCallResponseMessage: () => ({
                                role: 'user',
                                tool_call_id: tool.id,
                                content: JSON.stringify(result),
                            })
                        };
                    } catch (error) {
                        console.error(`Error running tool ${tool.tag}:`, error);
                        return {
                            getToolCallResponseMessage: () => ({
                                role: 'user',
                                tool_call_id: tool.id,
                                content: JSON.stringify({ error: {
                                    type: "tool_error",
                                    message: error.message,
                                } })
                            })
                        };
                    }
                }
            };
        });
    }

    getMessages() {
        return this.messages;
    }

    addMessage(message) {
        this.messages.push(message);
    }

    // this should just write to the developer log file
    addDeveloperLog(log) {
        const fs = require('fs');
        fs.appendFileSync('developer-log.md', `${log}\n`);
    }

    addUserLog(log) {
        const fs = require('fs');
        fs.appendFileSync('user-log.md', `${log}\n`);
    }
}

module.exports = { Agent };