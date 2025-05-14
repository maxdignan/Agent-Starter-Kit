// Response class implementation for handling model responses
class Response {
    constructor(rawResponse) {
        this.rawResponse = rawResponse;
        this.assistantMessage = this.extractAssistantMessage(rawResponse);
        this.toolCalls = this.extractToolCalls(rawResponse);
    }

    extractAssistantMessage(response) {
        // Extract the assistant message from the model response
        return {
            role: 'assistant',
            content: response.content || ''
        };
    }

    extractToolCalls(response) {
        // Extract tool calls from the model response
        if (!response.tool_calls || !Array.isArray(response.tool_calls)) {
            return [];
        }

        return response.tool_calls.map(toolCall => ({
            name: toolCall.name,
            attributes: toolCall.attributes || {},
            inputs: toolCall.inputs || {}
        }));
    }

    getAssistantMessage() {
        return this.assistantMessage;
    }

    getToolCalls() {
        return this.toolCalls;
    }
}

// Class to handle tool call results
class ToolCallResult {
    constructor(name, id, result, error = null) {
        this.name = name;
        this.id = id;
        this.result = result;
        this.error = error;
    }

    getToolCallResponseMessage() {
        return {
            role: 'tool',
            tool_call_id: this.id,
            content: this.error ? JSON.stringify({ error: this.error }) : JSON.stringify(this.result)
        };
    }
}

module.exports = { Response, ToolCallResult };