import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Starting dataset comparison analysis...');

    // Fetch all analyzed calls from both datasets
    const { data: setACalls, error: setAError } = await supabaseClient
      .from('sales_calls')
      .select('*')
      .eq('dataset_type', 'set_a')
      .not('analyzed_at', 'is', null);

    const { data: setBCalls, error: setBError } = await supabaseClient
      .from('sales_calls')
      .select('*')
      .eq('dataset_type', 'set_b')
      .not('analyzed_at', 'is', null);

    if (setAError || setBError) {
      throw new Error('Error fetching call data');
    }

    if (!setACalls?.length || !setBCalls?.length) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient data for comparison. Both sets need analyzed calls.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Calculate statistics for both sets
    const calculateStats = (calls: any[]) => {
      const highConversion = calls.filter(c => c.conversion_likelihood === 'high').length;
      const conversionRate = (highConversion / calls.length) * 100;
      const avgSentiment = calls.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / calls.length;
      const avgEngagement = calls.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / calls.length;
      const avgConversionScore = calls.reduce((sum, c) => sum + (c.conversion_score || 0), 0) / calls.length;
      
      return {
        totalCalls: calls.length,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        avgConversionScore: Math.round(avgConversionScore * 100) / 100,
        highConversionCount: highConversion
      };
    };

    const setAStats = calculateStats(setACalls);
    const setBStats = calculateStats(setBCalls);

    // Prepare data for AI analysis
    const setASummary = setACalls.map(call => ({
      id: call.id,
      filename: call.filename,
      conversion_likelihood: call.conversion_likelihood,
      conversion_score: call.conversion_score,
      sentiment_score: call.sentiment_score,
      engagement_score: call.engagement_score,
      key_insights: call.key_insights,
      customer_demographics: call.customer_demographics,
      sales_rep_performance: call.sales_rep_performance,
      statistical_data: call.statistical_data
    }));

    const setBSummary = setBCalls.map(call => ({
      id: call.id,
      filename: call.filename,
      conversion_likelihood: call.conversion_likelihood,
      conversion_score: call.conversion_score,
      sentiment_score: call.sentiment_score,
      engagement_score: call.engagement_score,
      key_insights: call.key_insights,
      customer_demographics: call.customer_demographics,
      sales_rep_performance: call.sales_rep_performance,
      statistical_data: call.statistical_data
    }));

    // Comprehensive AI comparison prompt
    const comparisonPrompt = `
    You are an expert sales performance analyst for e-GMAT. Analyze and compare these two sets of sales call data to provide comprehensive insights.

    SET A STATISTICS:
    - Total Calls: ${setAStats.totalCalls}
    - Conversion Rate: ${setAStats.conversionRate}%
    - Average Sentiment: ${setAStats.avgSentiment}
    - Average Engagement: ${setAStats.avgEngagement}
    - Average Conversion Score: ${setAStats.avgConversionScore}

    SET B STATISTICS:
    - Total Calls: ${setBStats.totalCalls}
    - Conversion Rate: ${setBStats.conversionRate}%
    - Average Sentiment: ${setBStats.avgSentiment}
    - Average Engagement: ${setBStats.avgEngagement}
    - Average Conversion Score: ${setBStats.avgConversionScore}

    SET A DETAILED DATA:
    ${JSON.stringify(setASummary, null, 2)}

    SET B DETAILED DATA:
    ${JSON.stringify(setBSummary, null, 2)}

    Provide a comprehensive analysis in JSON format:

    {
      "performance_difference_analysis": {
        "better_performing_set": "set_a" | "set_b",
        "performance_gap_percentage": number,
        "key_differentiating_factors": [string],
        "statistical_significance": "high" | "medium" | "low",
        "primary_drivers": {
          "sales_rep_factors": [string],
          "customer_demographic_factors": [string],
          "process_factors": [string],
          "external_factors": [string]
        }
      },
      "correlation_patterns": {
        "strong_correlations": [
          {
            "variables": [string, string],
            "correlation_strength": number (-1 to 1),
            "description": string,
            "business_impact": string
          }
        ],
        "customer_behavior_patterns": [string],
        "sales_rep_behavior_patterns": [string],
        "demographic_influences": [string]
      },
      "statistical_significance": {
        "sample_size_adequacy": "adequate" | "limited" | "insufficient",
        "confidence_level": string,
        "p_value_estimation": string,
        "effect_size": "large" | "medium" | "small",
        "reliability_assessment": string
      },
      "root_cause_analysis": {
        "primary_hypothesis": string,
        "supporting_evidence": [string],
        "alternative_hypotheses": [string],
        "confounding_variables": [string]
      },
      "actionable_insights": [
        {
          "insight": string,
          "evidence": string,
          "recommended_action": string,
          "expected_impact": "high" | "medium" | "low",
          "implementation_priority": "high" | "medium" | "low"
        }
      ]
    }

    Focus on:
    1. Identifying specific performance drivers
    2. Understanding customer demographic differences
    3. Analyzing sales rep performance variations
    4. Finding correlation patterns
    5. Providing statistical significance assessment
    6. Offering actionable recommendations

    Be specific with evidence from the data provided.
    `;

    // Call OpenAI API for comparison analysis
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
            content: comparisonPrompt
          }
        ],
        temperature: 0.2,
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
    let comparisonResult;
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        comparisonResult = JSON.parse(jsonMatch[0]);
      } else {
        comparisonResult = JSON.parse(analysisContent);
      }
    } catch (parseError) {
      console.error('Error parsing AI comparison response:', parseError);
      throw new Error('Failed to parse AI comparison response');
    }

    // Store the comparison results
    const { error: insertError } = await supabaseClient
      .from('dataset_comparisons')
      .insert({
        set_a_total_calls: setAStats.totalCalls,
        set_a_conversion_rate: setAStats.conversionRate,
        set_a_avg_sentiment: setAStats.avgSentiment,
        set_a_avg_engagement: setAStats.avgEngagement,
        set_b_total_calls: setBStats.totalCalls,
        set_b_conversion_rate: setBStats.conversionRate,
        set_b_avg_sentiment: setBStats.avgSentiment,
        set_b_avg_engagement: setBStats.avgEngagement,
        performance_difference_analysis: comparisonResult.performance_difference_analysis,
        correlation_patterns: comparisonResult.correlation_patterns,
        statistical_significance: comparisonResult.statistical_significance,
        ai_recommendations: comparisonResult.actionable_insights
      });

    if (insertError) {
      console.error('Error storing comparison results:', insertError);
    }

    console.log('Dataset comparison analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        setAStats,
        setBStats,
        comparison: comparisonResult,
        topPerformers: {
          setA: setACalls
            .sort((a, b) => (b.conversion_score || 0) - (a.conversion_score || 0))
            .slice(0, 5),
          setB: setBCalls
            .sort((a, b) => (b.conversion_score || 0) - (a.conversion_score || 0))
            .slice(0, 5)
        },
        bottomPerformers: {
          setA: setACalls
            .sort((a, b) => (a.conversion_score || 0) - (b.conversion_score || 0))
            .slice(0, 5),
          setB: setBCalls
            .sort((a, b) => (a.conversion_score || 0) - (b.conversion_score || 0))
            .slice(0, 5)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in compare-datasets function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Comparison analysis failed', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});