export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      document_purchases: {
        Row: {
          amount_paid: number | null
          checkout_session_data: Json | null
          currency: string | null
          email: string | null
          id: string
          purchase_date: string | null
          quantity: number
          remaining_quantity: number | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string | null
          used_quantity: number | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          checkout_session_data?: Json | null
          currency?: string | null
          email?: string | null
          id?: string
          purchase_date?: string | null
          quantity: number
          remaining_quantity?: number | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          used_quantity?: number | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          checkout_session_data?: Json | null
          currency?: string | null
          email?: string | null
          id?: string
          purchase_date?: string | null
          quantity?: number
          remaining_quantity?: number | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          used_quantity?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          detailed_feedback: string | null
          download_type: string | null
          id: string
          rating: number
          role: string
          source_page: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          detailed_feedback?: string | null
          download_type?: string | null
          id?: string
          rating: number
          role: string
          source_page?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          detailed_feedback?: string | null
          download_type?: string | null
          id?: string
          rating?: number
          role?: string
          source_page?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp: string
          token: string
          used: boolean | null
        }
        Insert: {
          created_at: string
          email: string
          expires_at: string
          id?: string
          otp: string
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_gateway: string
          payment_id: string | null
          plan_id: string
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          payment_gateway: string
          payment_id?: string | null
          plan_id: string
          status: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_gateway?: string
          payment_id?: string | null
          plan_id?: string
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          download_count: number
          email: string | null
          first_name: string | null
          free_downloads_remaining: number | null
          id: string
          interview_generations: number
          job_title: string | null
          last_name: string | null
          latitude: number | null
          location_display: string | null
          longitude: number | null
          otp: string | null
          otp_sent_at: string | null
          otp_verified: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          download_count?: number
          email?: string | null
          first_name?: string | null
          free_downloads_remaining?: number | null
          id: string
          interview_generations?: number
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          location_display?: string | null
          longitude?: number | null
          otp?: string | null
          otp_sent_at?: string | null
          otp_verified?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          download_count?: number
          email?: string | null
          first_name?: string | null
          free_downloads_remaining?: number | null
          id?: string
          interview_generations?: number
          job_title?: string | null
          last_name?: string | null
          latitude?: number | null
          location_display?: string | null
          longitude?: number | null
          otp?: string | null
          otp_sent_at?: string | null
          otp_verified?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_product_mappings: {
        Row: {
          created_at: string | null
          id: string
          plan_type: string
          price_id: string | null
          product_id: string
          product_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_type: string
          price_id?: string | null
          product_id: string
          product_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_type?: string
          price_id?: string | null
          product_id?: string
          product_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          cancel_type: string | null
          created_at: string
          current_period_end: string | null
          event_type: string
          id: string
          plan_type: string
          stripe_subscription_id: string
          user_id: string
        }
        Insert: {
          cancel_type?: string | null
          created_at?: string
          current_period_end?: string | null
          event_type: string
          id?: string
          plan_type: string
          stripe_subscription_id: string
          user_id: string
        }
        Update: {
          cancel_type?: string | null
          created_at?: string
          current_period_end?: string | null
          event_type?: string
          id?: string
          plan_type?: string
          stripe_subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          downloads_remaining: number | null
          email: string | null
          id: string
          is_one_time_purchase: boolean | null
          payment_status: string | null
          plan_amount: number | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          product_name: string | null
          status: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          total_downloads: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          downloads_remaining?: number | null
          email?: string | null
          id?: string
          is_one_time_purchase?: boolean | null
          payment_status?: string | null
          plan_amount?: number | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          product_name?: string | null
          status: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          total_downloads?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          downloads_remaining?: number | null
          email?: string | null
          id?: string
          is_one_time_purchase?: boolean | null
          payment_status?: string | null
          plan_amount?: number | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          product_name?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          total_downloads?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_constants: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at: string
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_download: {
        Args: { user_id: string }
        Returns: boolean
      }
      decrement_document_purchase_quantity: {
        Args: { user_id: string }
        Returns: boolean
      }
      increment_download_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_interview_generations: {
        Args: { user_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      upsert_subscription: {
        Args:
          | {
              p_stripe_subscription_id: string
              p_user_id: string
              p_plan_type: string
              p_status: string
              p_current_period_start: string
              p_current_period_end: string
              p_email: string
            }
          | {
              p_stripe_subscription_id: string
              p_user_id: string
              p_plan_type: string
              p_status: string
              p_current_period_start: string
              p_current_period_end: string
              p_email: string
              p_payment_status?: string
            }
        Returns: undefined
      }
      upsert_subscription_extended: {
        Args: {
          p_stripe_subscription_id: string
          p_user_id: string
          p_plan_type: string
          p_status: string
          p_current_period_start: string
          p_current_period_end: string
          p_email: string
          p_payment_status?: string
          p_stripe_product_id?: string
          p_stripe_price_id?: string
          p_product_name?: string
          p_plan_amount?: number
          p_currency?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      subscription_plan_type: "basic" | "plus"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      subscription_plan_type: ["basic", "plus"],
      user_role: ["user", "admin"],
    },
  },
} as const
