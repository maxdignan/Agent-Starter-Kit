const llm = require('./utils/llm');
const path = require('path');
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
        const tools = this.children.filter(child => child.isTool || child.tag?.endsWith('Tool') || child.isAgent || child.tag?.endsWith('Agent'));
        return tools.map(tool => {
            console.log("tool:", tool)
            if (tool.isAgent || tool.tag?.endsWith('Agent')) {
                // For agent children, create an AgentTool instance
                const agentName = tool.tag.replace('Agent', '');
                return {
                    name: `${agentName}AgentTool`,
                    description: `Runs the ${agentName} agent`,
                    input_schema: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: `The prompt to send to the ${agentName} agent`
                            }
                        },
                        required: ["prompt"]
                    },
                    run: async (inputs) => {
                        try {
                            const toolModule = require('./tools/agentTool');
                            const result = await toolModule.agentTool(tool, inputs);
                            return [false, result];
                        } catch (error) {
                            console.error(`Error running agent ${tool.name}:`, error);
                            return [true, error.message];
                        }
                    }
                };
            } else {
                // Handle regular tools as before
                const toolName = tool.tag.replace('Tool', '');
                const toolNameWithLowerCaseFirstLetter = toolName.charAt(0).toLowerCase() + toolName.slice(1);
                const toolNameSnakeCase = toolNameWithLowerCaseFirstLetter.replace(/([A-Z])/g, '_$1').toLowerCase();
                console.log("fsgs:", {toolName, toolNameWithLowerCaseFirstLetter, toolNameSnakeCase})
                const toolPath = path.join(__dirname, 'tools', `${toolNameSnakeCase}.js`);
                const toolModule = require(toolPath);
                return {
                    name: tool.tag,
                    description: tool.description || toolModule[toolName].description || '',
                    input_schema: tool.input_schema || toolModule[toolName].input_schema || {},
                    run: async (inputs) => {
                        try {
                            console.log("toolModule:", toolModule)
                            const result = await toolModule[toolNameWithLowerCaseFirstLetter](tool, inputs);
                            return [false, result];
                        } catch (error) {
                            console.error(`Error running tool ${tool.tag}:`, error);
                            return [true, error.message];
                        }
                    }
                };
            }
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