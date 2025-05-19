const fileContent = async (attributes, inputs) => {
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

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
            content: content
        };
    } catch (error) {
        return {
            error: {
                type: "read_error",
                message: error.message
            }
        };
    }
};

fileContent.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The path to the file to read' }
    }
};

fileContent.description = 'Get the content of a file';

module.exports = { fileContent }; 