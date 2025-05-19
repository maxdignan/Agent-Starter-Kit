const moveFile = async (attributes, inputs) => {
    const { relative_file_path, new_relative_file_path } = inputs;
    const fs = require('fs');
    const path = require('path');

    const oldPath = path.join(process.cwd(), relative_file_path);
    const newPath = path.join(process.cwd(), new_relative_file_path);

    try {
        fs.renameSync(oldPath, newPath);
        return {
            success: true
        };
    } catch (error) {
        return {
            error: {
                type: "file_move_error",
                message: error.message
            }
        };
    }
};

moveFile.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The current file path' },
        new_relative_file_path: { type: 'string', description: 'The new file path' }
    }
};

moveFile.description = 'Move a file';

module.exports = { moveFile }; 