const fs = require('fs');
const path = require('path');

const parseAgentFileByName = (name) => {
    // if the name ends with "agent, or "Agent", replace ageent with empty string
    if (name.endsWith("agent") || name.endsWith("Agent")) {
        name = name.replace("agent", "").replace("Agent", "");
    }
    // always lowercase the first letter of the name
    name = name.charAt(0).toLowerCase() + name.slice(1);
    const agentFile = fs.readFileSync(`agents/${dasherize(name)}.xml`, 'utf8');
    const agent = parse(agentFile);
    return agent;
}

const parse = (file) => {
    const json = xmlParse(file);
    return json;
}

// this function will parse the xml file into a javascript object
const xmlParse = (fileText) => {
    const tokens = tokenize(fileText);
    const json = parseTokens(tokens);
    return json;
}

const tokenize = (fileText) => {
    const tokens = [];
    let i = 0;
    
    while (i < fileText.length) {
        if (fileText[i] === '<') {
            if (fileText[i+1] === '/') {
                // Closing tag
                const end = fileText.indexOf('>', i);
                tokens.push({
                    type: 'closeTag',
                    value: fileText.substring(i, end + 1)
                });
                i = end + 1;
            } else {
                // Opening tag
                const end = fileText.indexOf('>', i);
                tokens.push({
                    type: 'openTag',
                    value: fileText.substring(i, end + 1)
                });
                i = end + 1;
            }
        } else {
            // Text content
            const end = fileText.indexOf('<', i);
            if (end === -1) break;
            const text = fileText.substring(i, end).trim();
            if (text) {
                tokens.push({
                    type: 'text',
                    value: text
                });
            }
            i = end;
        }
    }
    
    return tokens;
}

const parseTagAttributes = (tagString) => {
    // Remove < > brackets and split by first space
    const content = tagString.slice(1, -1).trim();
    const firstSpace = content.indexOf(' ');
    
    if (firstSpace === -1) {
        // No attributes
        return { name: content, attributes: {} };
    }
    
    const name = content.slice(0, firstSpace);
    const attributesString = content.slice(firstSpace + 1);
    
    const attributes = {};
    // Parse attributes using regex
    const attrRegex = /([\w-]+)(?:="([^"]*)"|='([^']*)'|=(\S+))?/g;
    let match;
    
    while ((match = attrRegex.exec(attributesString)) !== null) {
        const key = match[1];
        const value = match[2] || match[3] || match[4] || true;
        attributes[key] = value;
    }
    
    return { name, attributes };
}

const loadToolMetadata = (toolName) => {
    try {
        // Remove 'Tool' suffix if present to get the actual tool name
        const actualToolName = toolName.endsWith('Tool') ? toolName.slice(0, -4).toLowerCase() : toolName.toLowerCase();
        const toolPath = path.join('tools', `${actualToolName}.js`);
        
        if (fs.existsSync(toolPath)) {
            // Require the tool module
            const toolModule = require(path.resolve(toolPath));
            const toolFunction = toolModule[actualToolName];
            
            // Get description and input_schema if available
            return {
                description: toolFunction.description || '',
                input_schema: toolFunction.input_schema || {}
            };
        }
    } catch (error) {
        console.error(`Error loading metadata for tool ${toolName}:`, error);
    }
    
    return { description: '', input_schema: {} };
};

const loadAgentMetadata = (agentName, tag, isRoot = false) => {
    console.log("here:", {agentName, tag, isRoot})
    // Don't load metadata for the root agent since we're already parsing its file
    if (isRoot) {
        return {
            description: tag.attributes.description || '',
            input_schema: {}
        };
    }

    const agentMetadata = {
        tag: tag.name,
        attributes: tag.attributes,
        children: [],
        isTool: false,
        isAgent: true,
        description: tag.attributes.description || '',
        input_schema: {
            type: "object",
            properties: {
                prompt: { type: "string" }
            }
        }
    };
    return agentMetadata;
}

const parseTokens = (tokens) => {
    const rootNode = { children: [] };
    const stack = [rootNode];
    let currentNode = rootNode;
    let isRoot = true;  // Track if we're parsing the root agent
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.type === 'openTag') {
            // Parse tag name and attributes
            const tag = parseTagAttributes(token.value);
            const isTool = tag.name.endsWith('Tool');
            const isAgent = tag.name.endsWith('Agent');
            let metadata = {};
            
            // If it's a tool, load its metadata
            if (isTool) {
                metadata = loadToolMetadata(tag.name);
            }

            if (isAgent) {
                metadata = loadAgentMetadata(tag.name, tag, isRoot);
            }
            
            const newNode = {
                tag: tag.name,
                attributes: tag.attributes,
                children: [],
                isTool,
                isAgent,
                description: metadata.description || '',
                input_schema: metadata.input_schema || {}
            };
            
            currentNode.children.push(newNode);
            stack.push(newNode);
            currentNode = newNode;
            isRoot = false;  // After first tag, we're no longer at root
        } 
        else if (token.type === 'closeTag') {
            stack.pop();
            currentNode = stack[stack.length - 1];
        } 
        else if (token.type === 'text') {
            currentNode.children.push({
                type: 'text',
                value: token.value
            });
        }
    }
    
    return rootNode.children[0] || {};
}

const dasherize = (name) => {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Export functions for testing
module.exports = {
    xmlParse,
    parse,
    parseAgentFileByName,
    tokenize,
    parseTokens,
    parseTagAttributes,
    loadToolMetadata
};
