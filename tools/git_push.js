const gitPush = async (attributes, inputs) => {
    const { exec } = require('child_process');

    const [success, result] = await new Promise((resolve) => {
        exec('git push origin HEAD', (error, stdout, stderr) => {
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

gitPush.input_schema = {
    type: 'object',
    properties: {}
};

gitPush.description = 'Push the current branch to the remote repository';

module.exports = { gitPush }; 