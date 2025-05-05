This Repository is Agent Starter Kit.

The goal of Agent Starter Kit is to provide a simple and easy to understand example of how to build an agent.

There is much talk online about how there is not yet a framework that properly abstracts the challenges associate with building agents.

This is a repo trying to achieve this goal.

I am going to take from the philosophy of what made React into the most popular library for building web app user interfaces.

I would argue that it is the following traits that are present in React that should be present in an agent framework:
 - Declarative
 - Component Based
 - Easy to start
 - Composable
 - Simple interface at component level
 - props (passing in data, like parameters to a function) over global state
 - hooks for extensibility
 - functional over imperative
 - Explicitly stateful or default pure components (at the interface level)
 - Dom mgmt abstracted/LLM message queue (llm context window) mgmt abstracted
 - Lots of fine tuned access and control of dom elements/lots of fine tuned access and control of context window


Now what is the core of an agent?

I would arge that it is this mathematical formula:

```
agent = while loop + llm + tools
```

Tools can be an external MCP server, another agent, or just a simple function.

What is the most vanilla agent that we can build?

We'll call it "Simple Agent"

All other agents will inherit from this.

The core of the Simple Agent is the following:

 - chainable setters
   - eg `agent.setSystemPrompt(message)` returns the agent object so that we can chain it with other setters like `agent.setModel(model)`
 - No system prompt by default
 - has a `run` method that takes a user prompt and returns the final response from the LLM
 - has a `setTools` method that takes an array of tools - it appends the tools to the list of existing tools and returns the agent object so that we can chain it with other setters like `agent.setModel(model)`
 - has a `setModel` method that takes a model name and returns the agent object so that we can chain it with other setters like `agent.setSystemPrompt(prompt)`
 - has a `setBeforeToolCallListener` method that takes a function and returns the agent object so that we can chain it with other setters like `agent.setAfterToolCallListener(listener)`
 - has a `setAfterToolCallListener` method that takes a function and returns the agent object so that we can chain it with other setters like `agent.setBeforeAssistantMessageListener(listener)`
 - has a `setBeforeAssistantMessageListener` method that takes a function and returns the agent object so that we can chain it with other setters like `agent.setAfterAssistantMessageListener(listener)`
 - has a `setAfterAssistantMessageListener` method that takes a function and returns the agent object so that we can chain it with other setters like `agent.setAfterAssistantMessageListener(listener)`
 - OpenAI model by default
 - the function given to `setBeforeToolCallListener` is called before the tool call. The function may be async, but it must return a truthy value in order to proceed with the tool call. This provides a way to user - or developer - intervention prior to the tool call.
 - No tools by default
 - The while loop continues until there are no more tools to call, then it returns the final response from the LLM
 - The expected behavior - without alterations - would be for the agent to simply respond to whatever is placed in the user prompt
