import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Brain,
  FileText,
  Lightbulb,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SalesCall {
  id: string;
  filename: string;
  dataset_type: 'set_a' | 'set_b';
  conversion_likelihood: 'high' | 'medium' | 'low';
  conversion_score: number;
  sentiment_score: number;
  engagement_score: number;
  sales_rep_talk_ratio: number;
  customer_talk_ratio: number;
  key_insights: any;
  improvement_suggestions: any;
  customer_demographics: any;
  sales_rep_performance: any;
  uploaded_at: string;
  analyzed_at: string;
}

interface ComparisonData {
  setAStats: any;
  setBStats: any;
  comparison: any;
  topPerformers: {
    setA: SalesCall[];
    setB: SalesCall[];
  };
  bottomPerformers: {
    setA: SalesCall[];
    setB: SalesCall[];
  };
}

const Dashboard = () => {
  const [salesCalls, setSalesCalls] = useState<SalesCall[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchSalesCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_calls')
        .select('*')
        .not('analyzed_at', 'is', null)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setSalesCalls(data || []);
    } catch (error) {
      console.error('Error fetching sales calls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales calls data.",
        variant: "destructive",
      });
    }
  };

  const runComparison = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('compare-datasets');
      
      if (error) throw error;
      
      setComparisonData(data);
      toast({
        title: "Analysis Complete",
        description: "Dataset comparison has been updated with latest insights.",
      });
    } catch (error) {
      console.error('Error running comparison:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete comparison analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchSalesCalls();
      await runComparison();
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const getConversionColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConversionVariant = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const setACalls = salesCalls.filter(call => call.dataset_type === 'set_a');
  const setBCalls = salesCalls.filter(call => call.dataset_type === 'set_b');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Call Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive AI-powered analysis of your sales performance
            </p>
          </div>
          <Button onClick={runComparison} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesCalls.length}</div>
              <p className="text-xs text-muted-foreground">
                Set A: {setACalls.length} | Set B: {setBCalls.length}
              </p>
            </CardContent>
          </Card>

          {comparisonData && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((comparisonData.setAStats.conversionRate + comparisonData.setBStats.conversionRate) / 2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A: {comparisonData.setAStats.conversionRate}% | B: {comparisonData.setBStats.conversionRate}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((comparisonData.setAStats.avgSentiment + comparisonData.setBStats.avgSentiment) / 2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A: {comparisonData.setAStats.avgSentiment} | B: {comparisonData.setBStats.avgSentiment}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Better Performing Set</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {comparisonData.comparison?.performance_difference_analysis?.better_performing_set?.toUpperCase() || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {comparisonData.comparison?.performance_difference_analysis?.performance_gap_percentage}% difference
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Set Comparison</TabsTrigger>
            <TabsTrigger value="performers">Top/Bottom Performers</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Set A Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    Set A Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setACalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{call.filename}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getConversionVariant(call.conversion_likelihood)} className="text-xs">
                            {call.conversion_likelihood}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {call.conversion_score}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Sentiment: {call.sentiment_score}</div>
                        <div className="text-xs text-muted-foreground">
                          Engagement: {call.engagement_score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Set B Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    Set B Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setBCalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{call.filename}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getConversionVariant(call.conversion_likelihood)} className="text-xs">
                            {call.conversion_likelihood}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Score: {call.conversion_score}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Sentiment: {call.sentiment_score}</div>
                        <div className="text-xs text-muted-foreground">
                          Engagement: {call.engagement_score}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            {comparisonData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analysis</CardTitle>
                    <CardDescription>
                      AI-powered comparison between Set A and Set B
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Better Performing Set:</span>
                        <Badge>
                          {comparisonData.comparison?.performance_difference_analysis?.better_performing_set?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Performance Gap:</span>
                        <span className="text-sm font-medium">
                          {comparisonData.comparison?.performance_difference_analysis?.performance_gap_percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Statistical Significance:</span>
                        <Badge variant="outline">
                          {comparisonData.comparison?.performance_difference_analysis?.statistical_significance}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Differentiating Factors:</h4>
                      <ul className="space-y-1">
                        {comparisonData.comparison?.performance_difference_analysis?.key_differentiating_factors?.map((factor: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Root Cause Analysis</CardTitle>
                    <CardDescription>
                      Understanding the drivers of performance differences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Primary Hypothesis:</h4>
                      <p className="text-sm text-muted-foreground">
                        {comparisonData.comparison?.root_cause_analysis?.primary_hypothesis}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Supporting Evidence:</h4>
                      <ul className="space-y-1">
                        {comparisonData.comparison?.root_cause_analysis?.supporting_evidence?.map((evidence: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Comparison Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload transcripts to both Set A and Set B to generate comparison insights
                  </p>
                  <Button onClick={runComparison}>Run Analysis</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performers" className="space-y-4">
            {comparisonData ? (
              <div className="space-y-6">
                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Top 5 Performers (Most Likely to Convert)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Set A</h4>
                        {comparisonData.topPerformers.setA.map((call, index) => (
                          <div key={call.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">#{index + 1} {call.filename}</span>
                              <Badge variant="default">{call.conversion_score}%</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Sentiment: {call.sentiment_score}</span>
                              <span>Engagement: {call.engagement_score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-green-600">Set B</h4>
                        {comparisonData.topPerformers.setB.map((call, index) => (
                          <div key={call.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">#{index + 1} {call.filename}</span>
                              <Badge variant="default">{call.conversion_score}%</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Sentiment: {call.sentiment_score}</span>
                              <span>Engagement: {call.engagement_score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Bottom 5 Performers (Least Likely to Convert)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Set A</h4>
                        {comparisonData.bottomPerformers.setA.map((call, index) => (
                          <div key={call.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{call.filename}</span>
                              <Badge variant="destructive">{call.conversion_score}%</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Sentiment: {call.sentiment_score}</span>
                              <span>Engagement: {call.engagement_score}%</span>
                            </div>
                            {call.improvement_suggestions && Array.isArray(call.improvement_suggestions) && call.improvement_suggestions.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-orange-600">Improvement Suggestions:</span>
                                {call.improvement_suggestions.slice(0, 2).map((suggestion: any, idx: number) => (
                                  <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                    <Lightbulb className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                                    {suggestion.suggestion || suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-green-600">Set B</h4>
                        {comparisonData.bottomPerformers.setB.map((call, index) => (
                          <div key={call.id} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{call.filename}</span>
                              <Badge variant="destructive">{call.conversion_score}%</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>Sentiment: {call.sentiment_score}</span>
                              <span>Engagement: {call.engagement_score}%</span>
                            </div>
                            {call.improvement_suggestions && Array.isArray(call.improvement_suggestions) && call.improvement_suggestions.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-orange-600">Improvement Suggestions:</span>
                                {call.improvement_suggestions.slice(0, 2).map((suggestion: any, idx: number) => (
                                  <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                    <Lightbulb className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                                    {suggestion.suggestion || suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Performance Data Available</h3>
                  <p className="text-muted-foreground">
                    Upload and analyze transcripts to see top and bottom performers
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {comparisonData?.comparison?.actionable_insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonData.comparison.actionable_insights.map((insight: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{insight.insight}</span>
                        <Badge variant={insight.expected_impact === 'high' ? 'default' : 
                                     insight.expected_impact === 'medium' ? 'secondary' : 'outline'}>
                          {insight.expected_impact} impact
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Evidence:</span>
                        <p className="text-sm text-muted-foreground mt-1">{insight.evidence}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Recommended Action:</span>
                        <p className="text-sm text-muted-foreground mt-1">{insight.recommended_action}</p>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Priority: <Badge variant="outline" className="text-xs">{insight.implementation_priority}</Badge></span>
                        <span>Impact: <Badge variant="outline" className="text-xs">{insight.expected_impact}</Badge></span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
                  <p className="text-muted-foreground">
                    Complete dataset comparison to generate actionable insights
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;