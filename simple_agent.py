from typing import List, Callable, Any, Optional, Tuple
from dataclasses import dataclass
import openai
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Tool:
    name: str
    description: str
    function: Callable[..., Any]

class ModelClient:
    def __init__(self):
        self.messages: List[dict] = []
        self.system_prompt: Optional[str] = None

    def set_messages(self, messages: List[dict]) -> 'ModelClient':
        self.messages = messages
        return self

    def append_message(self, role: str, message: str) -> 'ModelClient':
        self.messages.append({"role": role, "content": message})
        return self
    
    def append_tool_message(self, tool_id: str, message: str) -> 'ModelClient':
        pass

    async def generate_response(self, messages: List[dict]) -> Any:
        pass

    async def set_system_prompt(self, message: str) -> 'ModelClient':
        pass

    async def extract_tool_calls(self, message: Any) -> List[dict]:
        pass

    def get_last_response(self, messages: List[dict]) -> Any:
        pass

class SimpleAgent:
    def __init__(self):
        """Initialize a new SimpleAgent instance."""
        self.system_prompt: Optional[str] = None
        self.model_client: Optional[ModelClient] = None
        self.tools: List[Tool] = []
        self.before_tool_call_listener: Optional[Callable] = None
        self.after_tool_call_listener: Optional[Callable] = None
        self.before_assistant_message_listener: Optional[Callable] = None
        self.after_assistant_message_listener: Optional[Callable] = None

    def set_model_client(self, model_client: ModelClient) -> 'SimpleAgent':
        """Set the model client for the agent."""
        self.model_client = model_client
        return self

    def set_system_prompt(self, message: str) -> 'SimpleAgent':
        """Set the system prompt for the agent."""
        self.system_prompt = message
        return self

    def set_tools(self, tools: List[Tool]) -> 'SimpleAgent':
        """Set the tools available to the agent."""
        self.tools = tools
        return self

    def set_before_tool_call_listener(self, callback: Callable[[List[dict]], Tuple[List[dict], bool]]) -> 'SimpleAgent':
        """Set the listener to be called before tool execution."""
        self.before_tool_call_listener = callback
        return self

    def set_after_tool_call_listener(self, callback: Callable[[List[dict]], Tuple[List[dict], bool]]) -> 'SimpleAgent':
        """Set the listener to be called after tool execution."""
        self.after_tool_call_listener = callback
        return self

    def set_before_assistant_message_listener(self, callback: Callable[[List[dict]], Tuple[List[dict], bool]]) -> 'SimpleAgent':
        """Set the listener to be called before assistant message generation."""
        self.before_assistant_message_listener = callback
        return self

    def set_after_assistant_message_listener(self, callback: Callable[[List[dict]], Tuple[List[dict], bool]]) -> 'SimpleAgent':
        """Set the listener to be called after assistant message generation."""
        self.after_assistant_message_listener = callback
        return self

    async def run(self, prompt: str) -> str:
        """Run the agent with the given prompt."""
        if not self.model_client:
            raise ValueError("Model client must be set before running the agent")
            
        messages = []
        
        if self.system_prompt:
            self.model_client.set_system_prompt(self.system_prompt)
        
        self.model_client.append_message("user", prompt)
        
        while True:
            # Generate response
            if self.before_assistant_message_listener:
                messages, should_continue = await self.before_assistant_message_listener(messages)
                if not should_continue:
                    return self.get_last_response(messages)
            
            response = await self.model_client.generate_response(messages, Any)

            self.model_client.append_message("assistant", str(response))
            
            if self.after_assistant_message_listener:
                messages, should_continue = await self.after_assistant_message_listener(messages)
                if not should_continue:
                    return self.get_last_response(messages)
            
            # Check if we need to execute any tools
            tool_calls = await self.model_client.extract_tool_calls(response)
            if not tool_calls:
                return response
            
            # Execute tools
            for tool_call in tool_calls:
                tool = next((t for t in self.tools if t.name == tool_call["name"]), None)
                if not tool:
                    continue
                
                if self.before_tool_call_listener:
                    messages, should_continue = await self.before_tool_call_listener(messages)
                    if not should_continue:
                        return self.get_last_response(messages)
                
                result = await tool.function(**tool_call["arguments"])

                self.model_client.append_tool_message(tool_call["id"], str(result))

                
                if self.after_tool_call_listener:
                    messages, should_continue = await self.after_tool_call_listener(messages)
                    if not should_continue:
                        return self.get_last_response(messages)
                
