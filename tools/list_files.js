const listFiles = async (attributes, inputs) => {
    const { relative_path } = inputs;
    const { exec } = require('child_process');
    const path = require('path');

    const dirPath = path.join(process.cwd(), relative_path);

    const [success, result] = await new Promise((resolve) => {
        exec(`ls -la "${dirPath}"`, (error, stdout, stderr) => {
            if (error) {
                resolve([false, error.message]);
            } else {
                resolve([true, stdout]);
            }
        });
    });

    if (success) {
        return {
            result: result
        };
    } else {
        return {
            error: {
                type: "tool_call_error",
                message: result
            }
        };
    }
};

listFiles.input_schema = {
    type: 'object',
    properties: {
        relative_path: { type: 'string', description: 'The directory path to list files from' }
    }
};

listFiles.description = 'List all files in a given relative directory';

module.exports = { listFiles }; 