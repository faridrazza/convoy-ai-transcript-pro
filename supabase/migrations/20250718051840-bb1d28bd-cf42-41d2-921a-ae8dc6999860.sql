-- Create enum for dataset types
CREATE TYPE public.dataset_type AS ENUM ('set_a', 'set_b');

-- Create enum for conversion likelihood
CREATE TYPE public.conversion_likelihood AS ENUM ('high', 'medium', 'low');

-- Create table for sales call transcripts
CREATE TABLE public.sales_calls (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    dataset_type dataset_type NOT NULL,
    transcript_content TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    
    -- Analysis results
    conversion_likelihood conversion_likelihood,
    conversion_score DECIMAL(5,2), -- 0.00 to 100.00
    
    -- Key metrics
    total_duration_minutes INTEGER,
    sales_rep_talk_ratio DECIMAL(5,2), -- percentage
    customer_talk_ratio DECIMAL(5,2), -- percentage
    sentiment_score DECIMAL(5,2), -- -100 to +100
    engagement_score DECIMAL(5,2), -- 0 to 100
    
    -- Detailed analysis
    key_insights JSONB,
    statistical_data JSONB,
    improvement_suggestions JSONB,
    customer_demographics JSONB,
    sales_rep_performance JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sales_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow all operations on sales_calls" 
ON public.sales_calls 
FOR ALL 
USING (true);

-- Create table for comparative analysis results
CREATE TABLE public.dataset_comparisons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Set A statistics
    set_a_total_calls INTEGER NOT NULL,
    set_a_conversion_rate DECIMAL(5,2),
    set_a_avg_sentiment DECIMAL(5,2),
    set_a_avg_engagement DECIMAL(5,2),
    
    -- Set B statistics  
    set_b_total_calls INTEGER NOT NULL,
    set_b_conversion_rate DECIMAL(5,2),
    set_b_avg_sentiment DECIMAL(5,2),
    set_b_avg_engagement DECIMAL(5,2),
    
    -- Comparative insights
    performance_difference_analysis JSONB,
    correlation_patterns JSONB,
    statistical_significance JSONB,
    ai_recommendations JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dataset_comparisons ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on dataset_comparisons" 
ON public.dataset_comparisons 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_calls_updated_at
    BEFORE UPDATE ON public.sales_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sales_calls_dataset_type ON public.sales_calls(dataset_type);
CREATE INDEX idx_sales_calls_conversion_likelihood ON public.sales_calls(conversion_likelihood);
CREATE INDEX idx_sales_calls_conversion_score ON public.sales_calls(conversion_score DESC);
CREATE INDEX idx_sales_calls_uploaded_at ON public.sales_calls(uploaded_at DESC);