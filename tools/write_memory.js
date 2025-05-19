const writeMemory = async (attributes, inputs) => {
    const { memory } = inputs;
    const fs = require('fs');
    const path = require('path');

    const memoryDir = path.join(process.cwd(), '.lemon');
    const memoryFile = path.join(memoryDir, 'memory.md');

    try {
        // Create .lemon directory if it doesn't exist
        if (!fs.existsSync(memoryDir)) {
            fs.mkdirSync(memoryDir, { recursive: true });
        }

        // Append to memory file with timestamp
        fs.appendFileSync(memoryFile, `\n${new Date().toISOString()}: ${memory}`);
        return { success: true };
    } catch (error) {
        return {
            error: {
                type: "memory_write_error",
                message: error.message
            }
        };
    }
};

writeMemory.input_schema = {
    type: 'object',
    properties: {
        memory: { type: 'string', description: 'The memory content to write' }
    }
};

writeMemory.description = 'Write a note to the memory';

module.exports = { writeMemory }; 