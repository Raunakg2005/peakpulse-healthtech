import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const response = await fetch(`${ML_API_URL}/api/predict-dropout-quantum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ML API error: ${response.statusText} - ${error}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Quantum dropout prediction error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to get quantum prediction',
                details: error instanceof Error ? error.message : 'Unknown error',
                available: false
            },
            { status: 500 }
        );
    }
}
