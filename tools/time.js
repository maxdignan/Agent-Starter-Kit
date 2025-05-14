const time = async (attributes, inputs) => {
    const time = new Date();
    return time.toISOString();
};

time.input_schema = {
    type: 'object',
    properties: {
        timezone: { type: 'string', description: 'The timezone to get the time in' }
    }
};

time.description = 'Get the current time in a given timezone';

module.exports = { time };