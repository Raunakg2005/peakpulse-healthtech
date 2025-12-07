import { NextRequest, NextResponse } from 'next/server';

// Using Groq API - Free tier: 30 req/min, 14,400 req/day
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_6vqYWZ7XqE8xK3L9mRnPWGdyb3FYoK1hJ2cT4vU5wXyZ8aB9cD';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
    try {
        const { message, conversationHistory } = await req.json();

        console.log('Groq API Key status:', GROQ_API_KEY ? `Present (${GROQ_API_KEY.substring(0, 10)}...)` : 'Missing');
        
        if (!GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Groq API key not configured' },
                { status: 500 }
            );
        }

        // Build conversation with system prompt
        const messages = [
            {
                role: 'system',
                content: 'You are PeakPulse Health Assistant. Answer naturally and conversationally. If the user asks about health, fitness, nutrition, mental health, sleep, exercise, or app features, provide helpful advice. If they ask about non-health topics, politely say "I can only assist with health and wellness questions. How can I help with your health goals?" Keep responses concise and friendly.'
            },
            ...conversationHistory.slice(-6).map((msg: any) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            {
                role: 'user',
                content: message
            }
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 300,
                top_p: 0.95,
                stream: false
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                apiKey: GROQ_API_KEY ? 'Present' : 'Missing'
            });
            return NextResponse.json(
                { 
                    error: 'Failed to get response from AI',
                    details: errorText,
                    status: response.status
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Groq response:', JSON.stringify(data, null, 2));
        
        const aiResponse = data.choices?.[0]?.message?.content || 
            'I apologize, but I couldn\'t process that. Could you rephrase your question?';

        return NextResponse.json({ response: aiResponse });

    } catch (error: any) {
        console.error('Chatbot API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
