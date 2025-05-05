# Agent Starter Kit - Product Requirements Document

## Overview
Agent Starter Kit is a Python-based framework designed to simplify the development of AI agents. Inspired by React's design principles, it aims to provide a declarative, component-based approach to building agents while maintaining simplicity and extensibility.

## Core Philosophy
The framework follows these key principles:
- Declarative programming style - where possible
- Component-based architecture
- Easy onboarding and setup
- Composable components
- Simple component interfaces
- Props-based data flow over global state
- Hook-based extensibility
- Functional programming approach
- Explicit state management
- Abstracted LLM context window management
- Fine-grained control over context window operations

## Core Components

### SimpleAgent Class
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
   - `run(prompt: str) -> str`: Main execution method that takes a user prompt and returns the final LLM response

#### Event Listeners
1. **Before Tool Call Listener**
   - Called before each tool execution
   - Must return truthy value to proceed with tool call
   - Can be used for user/developer intervention
   - Async support

2. **After Tool Call Listener**
   - Called after each tool execution
   - Receives tool execution results

3. **Before Assistant Message Listener**
   - Called before each assistant message generation
   - Can modify or intercept message generation

4. **After Assistant Message Listener**
   - Called after each assistant message generation
   - Can process or modify generated messages

## Tool System
- Tools can be:
  - External MCP servers
  - Other agents
  - Simple functions
- Tools are added via `setTools` method
- Tools are executed in sequence until completion
- Tool execution can be intercepted and modified via listeners

## Execution Flow
1. Agent receives user prompt
2. Enters main execution loop
3. For each iteration:
   - Processes current context
   - Determines next action
   - Executes tools if needed
   - Generates responses
   - Updates context
4. Loop continues until no more tools to call
5. Returns final response

## Technical Requirements

### Python Version
- Python 3.8 or higher

### Dependencies
- OpenAI Python client
- Type hints support
- Async/await support
- Pydantic for data validation (optional)

### Code Organization
```
agent_starter_kit/
├── __init__.py
├── simple_agent.py
├── examples/
├── tests/
├── docs/
├── README.md
└── requirements.txt
```

## Future Extensions
1. **Advanced Agent Types**
   - Multi-agent systems
   - Hierarchical agents
   - Specialized agents for specific domains

2. **Tool Ecosystem**
   - Standard tool library
   - Tool composition system
   - Tool validation framework

3. **Context Management**
   - Advanced context window strategies
   - Memory systems
   - State persistence

4. **Development Tools**
   - Debugging utilities
   - Testing framework
   - Performance monitoring

## Success Metrics
1. **Developer Experience**
   - Time to first agent
   - Code complexity reduction
   - Debugging ease

2. **Performance**
   - Response time
   - Context window efficiency
   - Tool execution speed

3. **Adoption**
   - Community size
   - Documentation quality
   - Example coverage

## Next Steps
1. Implement SimpleAgent core class
2. Create basic tool system
3. Implement event listener system
4. Add documentation and examples
5. Create testing framework
6. Develop example agents 