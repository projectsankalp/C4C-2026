export interface GroqInsightRequest {
  cropType: string;
  landSize: number;
  location: string;
  irrigationFrequency: string;
  sustainabilityScore: number;
  householdSize: number;
}

export interface GroqInsightResponse {
  insight: string;
}

export async function fetchGroqInsight(data: GroqInsightRequest): Promise<GroqInsightResponse> {
  const response = await fetch('/api/groq-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  return response.json();
}
