const { parseAgentFileByName } = require('../agentParser');
const { Agent } = require('../agentBase');
const { run } = require('../agentRuntime');

const agentTool = async (attributes, inputs) => {
    console.log("agentTool attributes:", attributes, inputs);
    try {
        // Get the agent tag from the attributes
        if (!attributes.tag) {
            throw new Error('tag is required in attributes');
        }

        // Parse the agent file
        const parsedAgent = parseAgentFileByName(attributes.tag);
        
        // Create a new agent instance
        const agent = new Agent(parsedAgent);
        
        // Run the agent with the provided prompt
        const result = await run(agent, inputs.prompt);
        
        // Get the last assistant message from the agent's messages
        const messages = result.getMessages();
        const assistantMessages = messages.filter(m => m.role === 'assistant');
        if (assistantMessages.length === 0) {
            return "No response from agent";
        }
        
        // Return the content of the last assistant message
        const lastMessage = assistantMessages[assistantMessages.length - 1];
        return lastMessage.content[0].text;
    } catch (error) {
        console.error('Error in agentTool:', error);
        throw error;
    }
};

// Add metadata for the tool
agentTool.description = "Runs another agent as a tool and returns its final response";
agentTool.input_schema = {
    type: "object",
    properties: {
        prompt: {
            type: "string",
            description: "The prompt to send to the agent"
        }
    },
    required: ["prompt"]
};

module.exports = { agentTool }; 