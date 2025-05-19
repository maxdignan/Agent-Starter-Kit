// {
//     name: "git_commit",
//     description: "Commit the changes",
//     input_schema: {
//         type: "object",
//         properties: { message: { type: "string" } },
//     },
//     function: async (input) => {
//         const [success, result] = await new Promise((resolve, reject) => {
//             exec(`git commit -m "${input.message}"`, (error, stdout, stderr) => {
//                 if (error) {
//                     resolve([false, error]);
//                 } else {
//                     resolve([true, stdout]);
//                 }
//             });
//         });
//         if (success) {
//             return {
//                 result: result,
//             };
//         } else {
//             return {
//                 error: {
//                     type: "tool_call_error",
//                     message: result,
//                 },
//             };
//         }
//     },
// },

const gitCommit = async (attributes, inputs) => {
    const { message } = inputs;

    const [success, result] = await new Promise((resolve, reject) => {
        exec(`git commit -m "${message}"`, (error, stdout, stderr) => {
            resolve([error ? false : true, stdout]);
        });
    });

    if (success) {
        return result;
    } else {
        return `Error: ${stderr}`;
    }
};

gitCommit.input_schema = {
    type: 'object',
    properties: {
        message: { type: 'string', description: 'The message to commit the changes with' }
    }
};

gitCommit.description = 'Commit the changes with a message';

module.exports = { gitCommit };