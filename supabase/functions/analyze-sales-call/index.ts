import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  callId: string;
  transcript: string;
  datasetType: 'set_a' | 'set_b';
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { callId, transcript, datasetType }: AnalysisRequest = await req.json();

    console.log(`Analyzing call ${callId} for dataset ${datasetType}`);

    // Comprehensive AI analysis prompt
    const analysisPrompt = `
    You are an expert sales call analyst for e-GMAT, an educational company. Analyze this sales call transcript and provide a comprehensive analysis.

    TRANSCRIPT:
    ${transcript}

    Please provide a detailed JSON response with the following structure:

    {
      "conversion_likelihood": "high" | "medium" | "low",
      "conversion_score": number (0-100),
      "total_duration_minutes": number (estimated from transcript),
      "sales_rep_talk_ratio": number (percentage 0-100),
      "customer_talk_ratio": number (percentage 0-100),
      "sentiment_score": number (-100 to +100),
      "engagement_score": number (0-100),
      "key_insights": {
        "main_pain_points": [string],
        "customer_objections": [string],
        "sales_rep_strengths": [string],
        "sales_rep_weaknesses": [string],
        "decisive_moments": [string],
        "missed_opportunities": [string]
      },
      "statistical_data": {
        "question_count": number,
        "objection_count": number,
        "positive_indicators": number,
        "negative_indicators": number,
        "urgency_mentions": number,
        "price_discussions": number,
        "competitor_mentions": number
      },
      "improvement_suggestions": [
        {
          "area": string,
          "suggestion": string,
          "impact": "high" | "medium" | "low",
          "implementation_difficulty": "easy" | "medium" | "hard"
        }
      ],
      "customer_demographics": {
        "experience_level": "beginner" | "intermediate" | "advanced",
        "urgency_level": "high" | "medium" | "low",
        "budget_indicators": "high" | "medium" | "low" | "unclear",
        "decision_making_authority": "high" | "medium" | "low" | "unclear",
        "geographic_indicators": string,
        "industry_background": string
      },
      "sales_rep_performance": {
        "rapport_building": number (1-10),
        "needs_discovery": number (1-10),
        "objection_handling": number (1-10),
        "closing_techniques": number (1-10),
        "product_knowledge": number (1-10),
        "listening_skills": number (1-10),
        "overall_performance": number (1-10)
      }
    }

    Base your analysis on:
    1. Conversation flow and structure
    2. Customer engagement indicators
    3. Sales rep techniques and effectiveness
    4. Pain point identification and resolution
    5. Objection handling quality
    6. Closing attempts and customer responses
    7. Overall conversation sentiment and momentum

    Provide specific, actionable insights that can help improve conversion rates.
    `;

    // Call OpenAI API for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        hasApiKey: !!OPENAI_API_KEY,
        apiKeyLength: OPENAI_API_KEY?.length || 0
      });
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const analysisContent = aiResponse.choices[0].message.content;

    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(analysisContent);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI analysis response');
    }

    // Update the sales call record with analysis results
    const { error: updateError } = await supabaseClient
      .from('sales_calls')
      .update({
        analyzed_at: new Date().toISOString(),
        conversion_likelihood: analysisResult.conversion_likelihood,
        conversion_score: analysisResult.conversion_score,
        total_duration_minutes: analysisResult.total_duration_minutes,
        sales_rep_talk_ratio: analysisResult.sales_rep_talk_ratio,
        customer_talk_ratio: analysisResult.customer_talk_ratio,
        sentiment_score: analysisResult.sentiment_score,
        engagement_score: analysisResult.engagement_score,
        key_insights: analysisResult.key_insights,
        statistical_data: analysisResult.statistical_data,
        improvement_suggestions: analysisResult.improvement_suggestions,
        customer_demographics: analysisResult.customer_demographics,
        sales_rep_performance: analysisResult.sales_rep_performance
      })
      .eq('id', callId);

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`);
    }

    console.log(`Successfully analyzed call ${callId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call analyzed successfully',
        analysis: analysisResult 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in analyze-sales-call function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});