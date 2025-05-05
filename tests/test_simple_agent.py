import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from simple_agent import SimpleAgent, Tool, ModelClient

@pytest.fixture
def mock_model_client():
    client = Mock(spec=ModelClient)
    client.generate_response = AsyncMock()
    client.extract_tool_calls = AsyncMock()
    client.get_last_response = Mock()
    client.set_system_prompt = AsyncMock()
    client.append_message = Mock()
    client.append_tool_message = Mock()
    return client

@pytest.mark.asyncio
async def test_simple_agent_initialization(mock_model_client):
    agent = SimpleAgent()
    assert agent.system_prompt is None
    assert agent.model_client is None
    assert agent.tools == []
    assert agent.before_tool_call_listener is None
    assert agent.after_tool_call_listener is None
    assert agent.before_assistant_message_listener is None
    assert agent.after_assistant_message_listener is None

@pytest.mark.asyncio
async def test_chainable_setters(mock_model_client):
    agent = SimpleAgent()
    
    # Test chaining setters
    agent = agent \
        .set_system_prompt("Test prompt") \
        .set_model_client(mock_model_client) \
        .set_tools([])
    
    assert agent.system_prompt == "Test prompt"
    assert agent.model_client == mock_model_client
    assert agent.tools == []

@pytest.mark.asyncio
async def test_tool_execution(mock_model_client):
    async def test_tool(x: int) -> int:
        return x * 2
    
    tool = Tool(
        name="test_tool",
        description="A test tool",
        function=test_tool
    )
    
    # Configure mock response
    mock_model_client.generate_response.return_value = "Test response"
    mock_model_client.extract_tool_calls.return_value = []
    mock_model_client.get_last_response.return_value = "Test response"
    
    agent = SimpleAgent() \
        .set_model_client(mock_model_client) \
        .set_tools([tool])
    
    # Run the agent
    response = await agent.run("Test prompt")
    assert response == "Test response"
    
    # Verify the mock was called
    mock_model_client.generate_response.assert_called_once()

@pytest.mark.asyncio
async def test_actual_tool_execution(mock_model_client):
    async def calculator(a: float, b: float, operation: str) -> float:
        if operation == "add":
            return a + b
        elif operation == "subtract":
            return a - b
        elif operation == "multiply":
            return a * b
        elif operation == "divide":
            return a / b
        else:
            raise ValueError(f"Unknown operation: {operation}")
    
    calculator_tool = Tool(
        name="calculator",
        description="A simple calculator that can perform basic arithmetic operations",
        function=calculator
    )
    
    # Configure mock responses
    # First response will request a tool call
    first_response = {
        "content": None,
        "tool_calls": [{
            "id": "call_123",
            "name": "calculator",
            "arguments": {"a": 5, "b": 3, "operation": "add"}
        }]
    }
    
    # Second response will be the final answer
    second_response = "The result of 5 + 3 is 8"
    
    # Set up the side effect to return different values on each call
    async def mock_generate_response(messages, *args, **kwargs):
        if mock_model_client.generate_response.call_count == 0:
            return first_response
        return second_response
    
    mock_model_client.generate_response.side_effect = mock_generate_response
    mock_model_client.extract_tool_calls.side_effect = [
        [{
            "id": "call_123",
            "name": "calculator",
            "arguments": {"a": 5, "b": 3, "operation": "add"}
        }],
        []  # Second call should return no tool calls
    ]
    
    agent = SimpleAgent() \
        .set_model_client(mock_model_client) \
        .set_tools([calculator_tool])
    
    # Run the agent
    response = await agent.run("What is 5 plus 3?")
    assert response == "The result of 5 + 3 is 8"
    
    # Verify the mock was called twice (once for tool call, once for final response)
    assert mock_model_client.generate_response.call_count == 2
    # Verify the tool message was appended
    mock_model_client.append_tool_message.assert_called_once_with("call_123", "8") 