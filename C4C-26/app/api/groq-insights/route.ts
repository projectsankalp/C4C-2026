import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GroqInsightRequest } from '@/lib/groqClient';

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body: unknown = await request.json();
    
    // Type checking request body
    if (
      !body ||
      typeof body !== 'object' ||
      !('location' in body) ||
      !('cropType' in body) ||
      !('landSize' in body) ||
      !('irrigationFrequency' in body) ||
      !('householdSize' in body) ||
      !('sustainabilityScore' in body)
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters in request body' },
        { status: 400 }
      );
    }

    const {
      location,
      cropType,
      landSize,
      irrigationFrequency,
      householdSize,
      sustainabilityScore,
    } = body as GroqInsightRequest;

    const groq = new Groq({ apiKey });

    const prompt = `You are an expert Indian agricultural groundwater sustainability advisor. 
A farmer has the following profile:
- Location: ${location}
- Crop Type: ${cropType}
- Land Size: ${landSize} acres
- Irrigation Method: ${irrigationFrequency}
- Household Size: ${householdSize} people
- Current Sustainability Score: ${sustainabilityScore}/100

Provide exactly ONE highly specific, actionable sustainability tip tailored to this exact profile. 
Reference their crop type and location specifically. 
Keep your response to 2-3 sentences maximum. 
Be direct and practical. Do not use bullet points or headers.`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const insightText = completion.choices[0]?.message?.content ?? '';
    return NextResponse.json({ insight: insightText.trim() });

  } catch (error) {
    console.error('Groq intelligence layer failure:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 502 }
    );
  }
}
