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
                return 'response';
            }
        };
    }

    getTools() {
        return this.children.filter(child => child.isTool || child.tag?.endsWith('Tool'));
    }

    getMessages() {
        return this.messages;
    }

    addMessage(message) {
        this.messages.push(message);
    }

    // this should just write to the developer log file
    addDeveloperLog(log) {
        fs.appendFileSync('developer-log.md', `${log}\n`);
    }

    addUserLog(log) {
        fs.appendFileSync('user-log.md', `${log}\n`);
    }
}

module.exports = { Agent };