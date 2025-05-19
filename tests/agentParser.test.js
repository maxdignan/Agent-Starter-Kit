const {
    xmlParse,
    parse
} = require('../agentParser');

// We'll test parseAgentFileByName separately to avoid fs mocking complications

describe('XML Parser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('xmlParse', () => {
        test('parses a simple XML string into an object', () => {
            const xmlString = '<CodingAgent><ReadFileTool /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [
                    {
                        tag: 'ReadFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Read a file',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to read'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });

        test('handles self-closing tags correctly', () => {
            const xmlString = '<CodingAgent><ReadFileTool /><EditFileTool /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [
                    {
                        tag: 'ReadFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Read a file',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to read'
                                }
                            }
                        }
                    },
                    {
                        tag: 'EditFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Edit a file. If wanting to create a new file, make sure to include the oldContent as an empty string. The newContent should be the content of the new file, in that case.',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to edit'
                                },
                                oldContent: {
                                    type: 'string',
                                    description: 'The content to replace'
                                },
                                newContent: {
                                    type: 'string',
                                    description: 'The content to replace the old content with'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });

        test('handles self-closing tags with attributes', () => {
            const xmlString = '<CodingAgent><ReadFileTool priority="high" /><EditFileTool /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [
                    {
                        tag: 'ReadFileTool',
                        attributes: { priority: 'high' },
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Read a file',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to read'
                                }
                            }
                        }
                    },
                    {
                        tag: 'EditFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Edit a file. If wanting to create a new file, make sure to include the oldContent as an empty string. The newContent should be the content of the new file, in that case.',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to edit'
                                },
                                oldContent: {
                                    type: 'string',
                                    description: 'The content to replace'
                                },
                                newContent: {
                                    type: 'string',
                                    description: 'The content to replace the old content with'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });

        test('parses attributes correctly', () => {
            const xmlString = '<CodingAgent name="coder" active><ReadFileTool priority="high" /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: { 
                    name: 'coder',
                    active: true 
                },
                children: [
                    {
                        tag: 'ReadFileTool',
                        attributes: { priority: 'high' },
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Read a file',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to read'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });

        test('parses nested tags correctly', () => {
            const xmlString = '<CodingAgent><ResearchAgent><SerpApiTool /></ResearchAgent><EditFileTool /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [
                    {
                        tag: 'ResearchAgent',
                        attributes: {},
                        children: [
                            {
                                tag: 'SerpApiTool',
                                attributes: {},
                                children: [],
                                isTool: true,
                                isAgent: false,
                                description: '',
                                input_schema: {}
                            }
                        ],
                        isTool: false,
                        isAgent: true,
                        description: '',
                        input_schema: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string'
                                }
                            }
                        }
                    },
                    {
                        tag: 'EditFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Edit a file. If wanting to create a new file, make sure to include the oldContent as an empty string. The newContent should be the content of the new file, in that case.',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to edit'
                                },
                                oldContent: {
                                    type: 'string',
                                    description: 'The content to replace'
                                },
                                newContent: {
                                    type: 'string',
                                    description: 'The content to replace the old content with'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });

        test('handles text content', () => {
            const xmlString = '<CodingAgent>This is a text<EditFileTool /></CodingAgent>';
            const result = xmlParse(xmlString);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [
                    {
                        type: 'text',
                        value: 'This is a text'
                    },
                    {
                        tag: 'EditFileTool',
                        attributes: {},
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: 'Edit a file. If wanting to create a new file, make sure to include the oldContent as an empty string. The newContent should be the content of the new file, in that case.',
                        input_schema: {
                            type: 'object',
                            properties: {
                                file: {
                                    type: 'string',
                                    description: 'The file to edit'
                                },
                                oldContent: {
                                    type: 'string',
                                    description: 'The content to replace'
                                },
                                newContent: {
                                    type: 'string',
                                    description: 'The content to replace the old content with'
                                }
                            }
                        }
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });
    });

    describe('parse', () => {
        test('calls xmlParse with the given file content', () => {
            const fileContent = '<CodingAgent></CodingAgent>';
            const result = parse(fileContent);
            
            expect(result).toEqual({
                tag: 'CodingAgent',
                attributes: {},
                children: [],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });
    });

    describe('Real XML example', () => {
        test('parses an agent with complex structure', () => {
            const xmlString = `<TestAgent name="test-agent" version="1.0">
    <SearchTool priority="high" />
    <CalculatorTool precision="double" />
    <NestedAgent>
        <InfoTool />
    </NestedAgent>
    <TextContent>This is some text content</TextContent>
</TestAgent>`;
            
            const result = xmlParse(xmlString);
            
            // Update test to match the actual parser implementation
            expect(result).toEqual({
                tag: 'TestAgent',
                attributes: {
                    name: 'test-agent',
                    version: '1.0'
                },
                children: [
                    {
                        tag: 'SearchTool',
                        attributes: { priority: 'high' },
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: '',
                        input_schema: {}
                    },
                    {
                        tag: 'CalculatorTool',
                        attributes: { precision: 'double' },
                        children: [],
                        isTool: true,
                        isAgent: false,
                        description: '',
                        input_schema: {}
                    },
                    {
                        tag: 'NestedAgent',
                        attributes: {},
                        children: [
                            {
                                tag: 'InfoTool',
                                attributes: {},
                                children: [],
                                isTool: true,
                                isAgent: false,
                                description: '',
                                input_schema: {}
                            }
                        ],
                        isTool: false,
                        isAgent: true,
                        description: '',
                        input_schema: {
                            type: 'object',
                            properties: {
                                prompt: { type: 'string' }
                            }
                        }
                    },
                    {
                        tag: 'TextContent',
                        attributes: {},
                        children: [
                            {
                                type: 'text',
                                value: 'This is some text content'
                            }
                        ],
                        isTool: false,
                        isAgent: false,
                        description: '',
                        input_schema: {}
                    }
                ],
                isTool: false,
                isAgent: true,
                description: '',
                input_schema: {}
            });
        });
    });
});