const weather = async (attributes, inputs) => {
    const weather = 'sunny, 70 degrees, and 5 mph winds';
    return weather;
};

weather.input_schema = {
    type: 'object',
    properties: {
        location: { type: 'string', description: 'The location to get the weather in' }
    }
};

weather.description = 'Get the weather in a given location';

module.exports = { weather };
