const grep = async (attributes, inputs) => {
    const { pattern } = inputs;
    const { exec } = require('child_process');

    const [success, result] = await new Promise((resolve) => {
        exec(`grep -r -i -l -n --exclude-dir='./.*' --exclude-dir='node_modules' '${pattern}' .`, (error, stdout, stderr) => {
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

grep.input_schema = {
    type: 'object',
    properties: {
        pattern: { type: 'string', description: 'The pattern to search for' }
    }
};

grep.description = 'Grep for a given pattern in files';

module.exports = { grep }; 