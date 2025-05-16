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
        this.sessionId = Date.now();
    }

    getSessionId() {
        return this.sessionId;
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
                // (attributes, inputs) -> [is_error, result (or error message)]
                run: async (attributes, inputs) => {
                    try {
                        const result= await toolModule[toolName](attributes, inputs);
                        return [false, result];
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
                    } catch (error) {
                        console.error(`Error running tool ${tool.tag}:`, error);
                        return [true, error.message];
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
        // make messages directory if it doesn't exist  
        const fs = require('fs');
        const messagesDir = `messages`;
        if (!fs.existsSync(messagesDir)) {
            fs.mkdirSync(messagesDir);
        }
        const messagesFile = `messages/messages-${this.name}-${this.sessionId}.json`;
        fs.writeFileSync(messagesFile, JSON.stringify(this.messages, null, 2));
    }

    // this should just write to the developer log file
    addDeveloperLog(log) {
        const fs = require('fs');
        // make logs directory if it doesn't exist
        const logsDir = `logs`;
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }
        const developerLogFile = `logs/developer-log-${this.name}-${this.sessionId}.md`;
        fs.appendFileSync(developerLogFile, `${log}\n`);
    }

    addUserLog(log) {
        const fs = require('fs');
        // make logs directory if it doesn't exist
        const logsDir = `logs`;
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }
        const userLogFile = `logs/user-log-${this.name}-${this.sessionId}.md`;
        fs.appendFileSync(userLogFile, `${log}\n`);
    }
}

module.exports = { Agent };