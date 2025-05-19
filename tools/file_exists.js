const fileExists = async (attributes, inputs) => {
    const { relative_file_path } = inputs;
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(process.cwd(), relative_file_path);

    return {
        exists: fs.existsSync(filePath)
    };
};

fileExists.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The path to check for existence' }
    }
};

fileExists.description = 'Check if a file exists';

module.exports = { fileExists }; 