const removeFile = async (attributes, inputs) => {
    const { relative_file_path } = inputs;
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(process.cwd(), relative_file_path);

    try {
        fs.unlinkSync(filePath);
        return {
            success: true
        };
    } catch (error) {
        return {
            error: {
                type: "file_removal_error",
                message: error.message
            }
        };
    }
};

removeFile.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The file path to remove' }
    }
};

removeFile.description = 'Remove a file';

module.exports = { removeFile }; 