# Agent Starter Kit

A Python-based framework for building AI agents, inspired by React's design principles. The framework provides a declarative, component-based approach to building agents while maintaining simplicity and extensibility.

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

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agent-starter-kit.git
cd agent-starter-kit
```

2. Install dependencies using uv:
```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

3. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Quick Start

```python
from simple_agent import SimpleAgent, Tool

# Create a tool
async def calculator(a: float, b: float, operation: str) -> float:
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        return a / b

calculator_tool = Tool(
    name="calculator",
    description="A simple calculator",
    function=calculator
)

# Create and configure the agent
agent = SimpleAgent() \
    .setSystemPrompt("You are a helpful assistant") \
    .setTools([calculator_tool])

# Run the agent
response = await agent.run("What is 5 plus 3?")
print(response)
```

## Core Components

### SimpleAgent

The foundation of the framework is the `SimpleAgent` class, which implements the basic agent formula:
```
agent = while loop + llm + tools
```

#### Core Methods

1. **Constructor**
   - Initializes with default OpenAI model
   - No system prompt by default
   - No tools by default

2. **Chainable Setters**
   - `setSystemPrompt(message: str) -> SimpleAgent`
   - `setModel(model: str) -> SimpleAgent`
   - `setTools(tools: List[Tool]) -> SimpleAgent`
   - `setBeforeToolCallListener(callback: Callable) -> SimpleAgent`
   - `setAfterToolCallListener(callback: Callable) -> SimpleAgent`
   - `setBeforeAssistantMessageListener(callback: Callable) -> SimpleAgent`
   - `setAfterAssistantMessageListener(callback: Callable) -> SimpleAgent`

3. **Core Methods**
   - `run(prompt: str) -> str`: Main execution method

## Examples

Check out the `examples/` directory for more usage examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT