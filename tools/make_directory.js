const makeDirectory = async (attributes, inputs) => {
    const { relative_file_path } = inputs;
    const fs = require('fs');
    const path = require('path');

    const dirPath = path.join(process.cwd(), relative_file_path);

    try {
        fs.mkdirSync(dirPath, { recursive: true });
        return {
            success: true
        };
    } catch (error) {
        return {
            error: {
                type: "directory_creation_error",
                message: error.message
            }
        };
    }
};

makeDirectory.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The directory path to create' }
    }
};

makeDirectory.description = 'Make a directory';

module.exports = { makeDirectory }; 