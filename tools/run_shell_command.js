const runShellCommand = async (attributes, inputs) => {
    const { command } = inputs;
    const { exec } = require('child_process');
    const [success, result] = await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve([error ? false : true, stdout]);
        });
    });

    if (success) {
        return result;
    } else {
        return `Error: ${stderr}`;
    }
};

runShellCommand.input_schema = {
    type: 'object',
    properties: {
        command: { type: 'string', description: 'The shell command to run' }
    }
};

runShellCommand.description = 'Run a shell command';

module.exports = { runShellCommand };
