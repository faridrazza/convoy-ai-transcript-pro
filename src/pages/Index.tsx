import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, Brain, TrendingUp, Zap, Target } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              AI-Powered Sales Call Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your sales performance with comprehensive AI analysis. Upload transcripts, 
              get detailed insights, and discover what drives conversions.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/upload" className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Start Analyzing
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Deep AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get comprehensive insights including sentiment analysis, conversion likelihood, 
                and detailed performance metrics for every call.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compare datasets, identify top performers, and understand the key factors 
                that drive successful conversions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Actionable Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive specific recommendations to improve conversion rates and 
                optimize your sales process.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
