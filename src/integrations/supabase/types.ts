export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      dataset_comparisons: {
        Row: {
          ai_recommendations: Json | null
          analysis_date: string
          correlation_patterns: Json | null
          created_at: string
          id: string
          performance_difference_analysis: Json | null
          set_a_avg_engagement: number | null
          set_a_avg_sentiment: number | null
          set_a_conversion_rate: number | null
          set_a_total_calls: number
          set_b_avg_engagement: number | null
          set_b_avg_sentiment: number | null
          set_b_conversion_rate: number | null
          set_b_total_calls: number
          statistical_significance: Json | null
        }
        Insert: {
          ai_recommendations?: Json | null
          analysis_date?: string
          correlation_patterns?: Json | null
          created_at?: string
          id?: string
          performance_difference_analysis?: Json | null
          set_a_avg_engagement?: number | null
          set_a_avg_sentiment?: number | null
          set_a_conversion_rate?: number | null
          set_a_total_calls: number
          set_b_avg_engagement?: number | null
          set_b_avg_sentiment?: number | null
          set_b_conversion_rate?: number | null
          set_b_total_calls: number
          statistical_significance?: Json | null
        }
        Update: {
          ai_recommendations?: Json | null
          analysis_date?: string
          correlation_patterns?: Json | null
          created_at?: string
          id?: string
          performance_difference_analysis?: Json | null
          set_a_avg_engagement?: number | null
          set_a_avg_sentiment?: number | null
          set_a_conversion_rate?: number | null
          set_a_total_calls?: number
          set_b_avg_engagement?: number | null
          set_b_avg_sentiment?: number | null
          set_b_conversion_rate?: number | null
          set_b_total_calls?: number
          statistical_significance?: Json | null
        }
        Relationships: []
      }
      sales_calls: {
        Row: {
          analyzed_at: string | null
          conversion_likelihood:
            | Database["public"]["Enums"]["conversion_likelihood"]
            | null
          conversion_score: number | null
          created_at: string
          customer_demographics: Json | null
          customer_talk_ratio: number | null
          dataset_type: Database["public"]["Enums"]["dataset_type"]
          engagement_score: number | null
          filename: string
          id: string
          improvement_suggestions: Json | null
          key_insights: Json | null
          sales_rep_performance: Json | null
          sales_rep_talk_ratio: number | null
          sentiment_score: number | null
          statistical_data: Json | null
          total_duration_minutes: number | null
          transcript_content: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          analyzed_at?: string | null
          conversion_likelihood?:
            | Database["public"]["Enums"]["conversion_likelihood"]
            | null
          conversion_score?: number | null
          created_at?: string
          customer_demographics?: Json | null
          customer_talk_ratio?: number | null
          dataset_type: Database["public"]["Enums"]["dataset_type"]
          engagement_score?: number | null
          filename: string
          id?: string
          improvement_suggestions?: Json | null
          key_insights?: Json | null
          sales_rep_performance?: Json | null
          sales_rep_talk_ratio?: number | null
          sentiment_score?: number | null
          statistical_data?: Json | null
          total_duration_minutes?: number | null
          transcript_content: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          analyzed_at?: string | null
          conversion_likelihood?:
            | Database["public"]["Enums"]["conversion_likelihood"]
            | null
          conversion_score?: number | null
          created_at?: string
          customer_demographics?: Json | null
          customer_talk_ratio?: number | null
          dataset_type?: Database["public"]["Enums"]["dataset_type"]
          engagement_score?: number | null
          filename?: string
          id?: string
          improvement_suggestions?: Json | null
          key_insights?: Json | null
          sales_rep_performance?: Json | null
          sales_rep_talk_ratio?: number | null
          sentiment_score?: number | null
          statistical_data?: Json | null
          total_duration_minutes?: number | null
          transcript_content?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conversion_likelihood: "high" | "medium" | "low"
      dataset_type: "set_a" | "set_b"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversion_likelihood: ["high", "medium", "low"],
      dataset_type: ["set_a", "set_b"],
    },
  },
} as const
