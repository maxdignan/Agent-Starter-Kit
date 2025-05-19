const editFile = async (attributes, inputs) => {
    console.log("editFile:", {attributes, inputs})
    const { file, oldContent, newContent } = inputs;
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
        // create the file
        fs.writeFileSync(filePath, newContent);

        return `File ${filePath} has been created`;
    } else {
        // replace the old content with the new content
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const newFileContent = fileContent.replace(oldContent, newContent);
        fs.writeFileSync(filePath, newFileContent);

        return `File ${filePath} has been edited`;
    }
};

editFile.input_schema = {
    type: 'object',
    properties: {
        file: { type: 'string', description: 'The file to edit' },
        oldContent: { type: 'string', description: 'The content to replace' },
        newContent: { type: 'string', description: 'The content to replace the old content with' }
    }
};

editFile.description = 'Edit a file. If wanting to create a new file, make sure to include the oldContent as an empty string. The newContent should be the content of the new file, in that case.';

module.exports = { editFile };