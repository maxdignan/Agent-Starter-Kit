const fileSummary = async (attributes, inputs) => {
    const { relative_file_path } = inputs;
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(process.cwd(), relative_file_path);

    if (!fs.existsSync(filePath)) {
        return {
            error: {
                type: "file_not_found",
                message: `File ${relative_file_path} does not exist`
            }
        };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // For now, return a simple summary. In a real implementation, this would call an LLM
    return {
        summary: `File ${relative_file_path} contains ${content.length} characters and ${content.split('\n').length} lines.`
    };
};

fileSummary.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The path to the file to summarize' }
    }
};

fileSummary.description = 'Summarize a file';

module.exports = { fileSummary }; 