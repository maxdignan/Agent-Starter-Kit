const gitAdd = async (attributes, inputs) => {
    const { relative_file_path } = inputs;
    const { exec } = require('child_process');

    const [success, result] = await new Promise((resolve, reject) => {
        exec(`git add ${relative_file_path}`, (error, stdout, stderr) => {
            resolve([error ? false : true, stdout]);
        });
    });

    if (success) {
        return result;
    } else {
        return `Error: ${stderr}`;
    }
};

gitAdd.input_schema = {
    type: 'object',
    properties: {
        relative_file_path: { type: 'string', description: 'The file to add' }
    }
};

gitAdd.description = 'Add a file to the git index';

module.exports = { gitAdd };