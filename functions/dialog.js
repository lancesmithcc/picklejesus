require('dotenv').config();
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { character } = event.queryStringParameters;

    const prompt = `
        You are ${character}, a character in a fighting game. 
        Generate 5 short, witty, and slightly absurd taunts (max 10 words each), inspired by "Pickle's Day Out".
        The theme is a religious argument between Pickle Jesus and Tomato Jesus.
        Each taunt should end with a relevant emoji.
        Return as a JSON array of strings. Example: ["My brine is divine! 🙏", "You're just a salad ingredient! 🥗"]
    `;
    
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ "role": "user", "content": prompt }],
                max_tokens: 200,
                temperature: 0.9,
            })
        });
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Clean the content to extract raw JSON
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;

        return {
            statusCode: 200,
            body: JSON.stringify({ lines: JSON.parse(jsonString) })
        };
    } catch (error) {
        console.error('DeepSeek API error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ lines: [`My lips are sealed... for now. 😡`] })
        };
    }
}; 