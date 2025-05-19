const readMemory = async (attributes, inputs) => {
    const fs = require('fs');
    const path = require('path');

    const memoryFile = path.join(process.cwd(), '.lemon', 'memory.md');

    try {
        if (!fs.existsSync(memoryFile)) {
            return { memory: '' };
        }
        const content = fs.readFileSync(memoryFile, 'utf8');
        return { memory: content };
    } catch (error) {
        return {
            error: {
                type: "memory_read_error",
                message: error.message
            }
        };
    }
};

readMemory.input_schema = {
    type: 'object',
    properties: {}
};

readMemory.description = 'Read the memory';

module.exports = { readMemory }; 