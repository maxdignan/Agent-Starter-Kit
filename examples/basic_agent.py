import asyncio
from simple_agent import SimpleAgent, Tool

async def main():
    # Create a simple tool
    async def read_file(file_path: str) -> str:
        try:
            with open(file_path, 'r') as file:
                return file.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"

    file_reader_tool = Tool(
        name="read_file",
        description="A tool that reads the contents of a local file",
        function=read_file
    )

    # Create and configure the agent
    agent = SimpleAgent() \
        .setSystemPrompt("You are a helpful assistant that can read local files.") \
        .setTools([file_reader_tool])

    # Run the agent
    response = await agent.run("Please write a short summary of the contents of examples/basic_agent.py")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())