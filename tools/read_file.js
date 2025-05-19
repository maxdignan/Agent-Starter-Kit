const readFile = async (attributes, inputs) => {
    const { file } = inputs;
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
        return `File ${filePath} does not exist`;
    } else {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return fileContent;
    }
};

readFile.input_schema = {
    type: 'object',
    properties: {
        file: { type: 'string', description: 'The file to read' }
    }
};

readFile.description = 'Read a file';

module.exports = { readFile };
