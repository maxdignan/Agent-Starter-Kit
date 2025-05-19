const gitStatus = async (attributes, inputs) => {
    const { exec } = require('child_process');

    const [success, result] = await new Promise((resolve) => {
        exec('git status', (error, stdout, stderr) => {
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

gitStatus.input_schema = {
    type: 'object',
    properties: {}
};

gitStatus.description = 'Get the git status';

module.exports = { gitStatus }; 