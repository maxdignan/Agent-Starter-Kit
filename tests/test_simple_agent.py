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