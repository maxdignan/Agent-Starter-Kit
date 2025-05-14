# Agent Starter Kit

A JavaScript-based framework for building AI agents, inspired by React's design principles. The framework provides a declarative, component-based approach to building agents while maintaining simplicity and extensibility.

![Agent Starter Kit](agent_starter_pack_img.png)

## Features

- Declarative programming style
- Component-based architecture
- Easy onboarding and setup
- Composable components
- Simple component interfaces
- Props-based data flow
- Hook-based extensibility
- Functional programming approach
- Explicit state management
- Abstracted LLM context window management
- XML/JSX-based agent definitions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agent-starter-kit.git
cd agent-starter-kit
```

2. Install dependencies using npm:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

## Quick Start

```javascript
import { AgentRuntime } from './agentRuntime';
import { Tool } from './tools';

// Create a tool
const calculator = async (a, b, operation) => {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
    default: throw new Error('Invalid operation');
  }
};

const calculatorTool = new Tool({
  name: 'calculator',
  description: 'A simple calculator',
  function: calculator
});

// Create and configure the agent
const agent = new AgentRuntime()
  .setSystemPrompt('You are a helpful assistant')
  .setTools([calculatorTool]);

// Run the agent
const response = await agent.run('What is 5 plus 3?');
console.log(response);
```

## Core Components

### AgentRuntime

The foundation of the framework is the `AgentRuntime` class, which implements the basic agent formula:
```
agent = while loop + llm + tools
```

#### Core Methods

1. **Constructor**
   - Initializes with default Anthropic model
   - No system prompt by default
   - No tools by default

2. **Chainable Setters**
   - `setSystemPrompt(message: string) -> AgentRuntime`
   - `setModel(model: string) -> AgentRuntime`
   - `setTools(tools: Tool[]) -> AgentRuntime`
   - `setBeforeToolCallListener(callback: Function) -> AgentRuntime`
   - `setAfterToolCallListener(callback: Function) -> AgentRuntime`
   - `setBeforeAssistantMessageListener(callback: Function) -> AgentRuntime`
   - `setAfterAssistantMessageListener(callback: Function) -> AgentRuntime`

3. **Core Methods**
   - `run(prompt: string) -> Promise<string>`: Main execution method

## Examples

Check out the `examples/` directory for more usage examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT