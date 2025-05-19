// ok, let's test this out
// let's create a simple agent from the test.xml file and then run it

const agentModule = require('./agentBase');
const agentParser = require('./agentParser');
const agentRuntime = require('./agentRuntime');

// const parsedAgent = agentParser.parseAgentFileByName('another_test');
// const agent = new agentModule.Agent(parsedAgent);

// agentRuntime.run(agent, "What's the weather and time in San Francisco?");


const codingTestAgent = agentParser.parseAgentFileByName('coding_test');
const agent = new agentModule.Agent(codingTestAgent);

agentRuntime.run(agent, "Please read all the content in agentBase.js. Think about each function. then write a jsdoc for each function. Only edit jsdocs, do not write new code. Make sure the types make sense for their usage. ");
