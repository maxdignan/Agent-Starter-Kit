import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from simple_agent import SimpleAgent, Tool

@pytest.fixture
def mock_openai_client():
    client = Mock()
    client.chat = Mock()
    client.chat.completions = Mock()
    client.chat.completions.create = AsyncMock()
    return client

@pytest.mark.asyncio
async def test_simple_agent_initialization(mock_openai_client):
    agent = SimpleAgent(client=mock_openai_client)
    assert agent.system_prompt is None
    assert agent.model == "gpt-3.5-turbo"
    assert agent.tools == []
    assert agent.before_tool_call_listener is None
    assert agent.after_tool_call_listener is None
    assert agent.before_assistant_message_listener is None
    assert agent.after_assistant_message_listener is None

@pytest.mark.asyncio
async def test_chainable_setters(mock_openai_client):
    agent = SimpleAgent(client=mock_openai_client)
    
    # Test chaining setters
    agent = agent \
        .setSystemPrompt("Test prompt") \
        .setModel("gpt-4") \
        .setTools([])
    
    assert agent.system_prompt == "Test prompt"
    assert agent.model == "gpt-4"
    assert agent.tools == []

@pytest.mark.asyncio
async def test_tool_execution(mock_openai_client):
    async def test_tool(x: int) -> int:
        return x * 2
    
    tool = Tool(
        name="test_tool",
        description="A test tool",
        function=test_tool
    )
    
    # Configure mock response
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message = Mock()
    mock_response.choices[0].message.content = "Test response"
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    agent = SimpleAgent(client=mock_openai_client).setTools([tool])
    
    # Run the agent
    response = await agent.run("Test prompt")
    assert response == "Test response"
    
    # Verify the mock was called
    mock_openai_client.chat.completions.create.assert_called_once() 