// Simple JSX Parser and Compiler
const fs = require('fs');
const path = require('path');

class JSXParser {
    constructor() {
        this.pos = 0;
        this.input = '';
        this.jsCode = [];
    }

    // Main parse function
    parse(input) {
        this.input = input;
        this.pos = 0;
        this.jsCode = [];
        return this.parseMixedContent();
    }

    // Parse mixed JavaScript and JSX content
    parseMixedContent() {
        const result = [];
        let currentJS = '';
        let braceCount = 0;
        let inString = false;
        let stringChar = '';
        let inTemplateLiteral = false;
        
        while (this.pos < this.input.length) {
            const char = this.input[this.pos];
            const nextChar = this.input[this.pos + 1];
            
            // Handle strings
            if ((char === '"' || char === "'") && !inTemplateLiteral) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                currentJS += char;
                this.pos++;
                continue;
            }
            
            // Handle template literals
            if (char === '`') {
                inTemplateLiteral = !inTemplateLiteral;
                currentJS += char;
                this.pos++;
                continue;
            }
            
            // Handle braces
            if (char === '{' && !inString && !inTemplateLiteral) {
                braceCount++;
                currentJS += char;
                this.pos++;
                continue;
            }
            
            if (char === '}' && !inString && !inTemplateLiteral) {
                braceCount--;
                currentJS += char;
                this.pos++;
                continue;
            }
            
            // Check for JSX start
            if (char === '<' && this.isJSXStart() && !inString && !inTemplateLiteral) {
                // If we have accumulated JavaScript, add it to result
                if (currentJS.trim()) {
                    result.push({
                        type: 'javascript',
                        value: currentJS.trim()
                    });
                    currentJS = '';
                }
                
                // Parse JSX
                result.push(this.parseElement());
                continue;
            }
            
            currentJS += char;
            this.pos++;
        }
        
        // Add any remaining JavaScript
        if (currentJS.trim()) {
            result.push({
                type: 'javascript',
                value: currentJS.trim()
            });
        }
        
        return result;
    }

    // Check if we're at the start of a JSX element
    isJSXStart() {
        const nextChar = this.input[this.pos + 1];
        return /[a-zA-Z]/.test(nextChar) || nextChar === '/';
    }

    // Parse a JSX element
    parseElement() {
        this.skipWhitespace();
        
        if (this.input[this.pos] !== '<') {
            throw new Error('Expected JSX element to start with <');
        }
        
        this.pos++; // Skip <
        const tagName = this.parseTagName();
        const props = this.parseProps();
        
        let children = [];
        
        if (this.input[this.pos] === '>') {
            this.pos++; // Skip >
            children = this.parseChildren();
            
            if (this.input[this.pos] !== '<' || this.input[this.pos + 1] !== '/') {
                throw new Error('Expected closing tag');
            }
            
            this.pos += 2; // Skip </
            const closingTag = this.parseTagName();
            
            if (closingTag !== tagName) {
                throw new Error(`Mismatched tags: ${tagName} and ${closingTag}`);
            }
            
            if (this.input[this.pos] !== '>') {
                throw new Error('Expected > after closing tag');
            }
            this.pos++;
        } else if (this.input[this.pos] === '/' && this.input[this.pos + 1] === '>') {
            this.pos += 2; // Skip />
        }
        
        return {
            type: 'element',
            tagName,
            props,
            children
        };
    }

    // Parse tag name
    parseTagName() {
        let tagName = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9]/.test(this.input[this.pos])) {
            tagName += this.input[this.pos];
            this.pos++;
        }
        return tagName;
    }

    // Parse props
    parseProps() {
        const props = {};
        this.skipWhitespace();
        
        while (this.pos < this.input.length && this.input[this.pos] !== '>' && this.input[this.pos] !== '/') {
            const propName = this.parsePropName();
            this.skipWhitespace();
            
            if (this.input[this.pos] === '=') {
                this.pos++; // Skip =
                this.skipWhitespace();
                props[propName] = this.parsePropValue();
            } else {
                props[propName] = true;
            }
            
            this.skipWhitespace();
        }
        
        return props;
    }

    // Parse prop name
    parsePropName() {
        let name = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9-]/.test(this.input[this.pos])) {
            name += this.input[this.pos];
            this.pos++;
        }
        return name;
    }

    // Parse prop value
    parsePropValue() {
        if (this.input[this.pos] === '"' || this.input[this.pos] === "'") {
            const quote = this.input[this.pos];
            this.pos++;
            let value = '';
            
            while (this.pos < this.input.length && this.input[this.pos] !== quote) {
                value += this.input[this.pos];
                this.pos++;
            }
            
            this.pos++; // Skip closing quote
            return value;
        }
        
        if (this.input[this.pos] === '{') {
            this.pos++; // Skip {
            let value = '';
            let braceCount = 1;
            
            while (this.pos < this.input.length && braceCount > 0) {
                if (this.input[this.pos] === '{') braceCount++;
                if (this.input[this.pos] === '}') braceCount--;
                if (braceCount > 0) {
                    value += this.input[this.pos];
                }
                this.pos++;
            }
            
            return value.trim();
        }
        
        throw new Error('Invalid prop value');
    }

    // Parse children
    parseChildren() {
        const children = [];
        
        while (this.pos < this.input.length) {
            this.skipWhitespace();
            
            if (this.input[this.pos] === '<' && this.input[this.pos + 1] === '/') {
                break;
            }
            
            if (this.input[this.pos] === '<') {
                children.push(this.parseElement());
            } else if (this.input[this.pos] === '{') {
                children.push(this.parseExpression());
            } else {
                children.push(this.parseText());
            }
        }
        
        return children;
    }

    // Parse JSX expression
    parseExpression() {
        this.pos++; // Skip {
        let expr = '';
        let braceCount = 1;
        
        while (this.pos < this.input.length && braceCount > 0) {
            if (this.input[this.pos] === '{') braceCount++;
            if (this.input[this.pos] === '}') braceCount--;
            if (braceCount > 0) {
                expr += this.input[this.pos];
            }
            this.pos++;
        }
        
        return {
            type: 'expression',
            value: expr.trim()
        };
    }

    // Parse text content
    parseText() {
        let text = '';
        
        while (this.pos < this.input.length && this.input[this.pos] !== '<' && this.input[this.pos] !== '{') {
            text += this.input[this.pos];
            this.pos++;
        }
        
        return {
            type: 'text',
            value: text.trim()
        };
    }

    // Skip whitespace
    skipWhitespace() {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this.pos++;
        }
    }
}

// Compiler to convert AST to JavaScript
class JSXCompiler {
    compile(ast) {
        if (Array.isArray(ast)) {
            return ast.map(node => this.compile(node)).join('\n');
        }
        
        if (ast.type === 'javascript') {
            return ast.value;
        }
        
        if (ast.type === 'element') {
            const props = Object.entries(ast.props)
                .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
                .join(', ');
            
            const children = ast.children
                .map(child => this.compile(child))
                .join(', ');
            
            return `React.createElement("${ast.tagName}", {${props}}, ${children})`;
        }
        
        if (ast.type === 'text') {
            return `"${ast.value}"`;
        }
        
        if (ast.type === 'expression') {
            return ast.value;
        }
        
        throw new Error('Unknown AST node type');
    }
}

// Function to read and process a JSX file
function processJSXFile(filePath) {
    try {
        // Read the file
        const jsxContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse and compile
        const parser = new JSXParser();
        const compiler = new JSXCompiler();
        
        const ast = parser.parse(jsxContent);
        const compiled = compiler.compile(ast);
        
        // Print results
        console.log('AST:', JSON.stringify(ast, null, 2));
        console.log('\nCompiled JavaScript:');
        console.log(compiled);
        
        // Write to a new file
        const outputPath = path.join(
            path.dirname(filePath),
            path.basename(filePath, path.extname(filePath)) + '.compiled.js'
        );
        fs.writeFileSync(outputPath, compiled);
        console.log(`\nCompiled output written to: ${outputPath}`);
        
    } catch (error) {
        console.error('Error processing JSX file:', error.message);
        process.exit(1);
    }
}

// Check if file path is provided as command line argument
if (process.argv.length < 3) {
    console.error('Please provide a JSX file path as an argument');
    console.error('Usage: node jsxParser.js <path-to-jsx-file>');
    process.exit(1);
}

// Get the file path from command line arguments
const jsxFilePath = process.argv[2];

// Process the JSX file
processJSXFile(jsxFilePath);

module.exports = { JSXParser, JSXCompiler }; 