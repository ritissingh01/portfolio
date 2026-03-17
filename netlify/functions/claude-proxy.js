exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    const geminiBody = {
      contents: [{
        parts: [{ text: body.messages[0].content }]
      }],
      generationConfig: {
        maxOutputTokens: body.max_tokens || 1000
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      }
    );

    const data = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    const anthropicFormat = {
      content: [{ type: 'text', text: text }]
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(anthropicFormat)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error: ' + error.message })
    };
  }
};
