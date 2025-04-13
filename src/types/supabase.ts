export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          email: string;
          hashed_password: string;
          full_name: string;
          bio: string | null;
          availability: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          email: string;
          hashed_password: string;
          full_name: string;
          bio?: string | null;
          availability?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          hashed_password?: string;
          full_name?: string;
          bio?: string | null;
          availability?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          skill_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          skill_id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          skill_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_skills: {
        Row: {
          user_skill_id: string;
          user_id: string;
          skill_id: string;
          type: "offer" | "request" | "both";
          created_at: string;
        };
        Insert: {
          user_skill_id?: string;
          user_id: string;
          skill_id: string;
          type: "offer" | "request" | "both";
          created_at?: string;
        };
        Update: {
          user_skill_id?: string;
          user_id?: string;
          skill_id?: string;
          type?: "offer" | "request" | "both";
          created_at?: string;
        };
      };
      connection_requests: {
        Row: {
          connection_id: string;
          sender_id: string;
          receiver_id: string;
          status: "pending" | "accepted" | "rejected";
          created_at: string;
        };
        Insert: {
          connection_id?: string;
          sender_id: string;
          receiver_id: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
        };
        Update: {
          connection_id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
        };
      };
      messages: {
        Row: {
          message_id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          sent_at: string;
        };
        Insert: {
          message_id?: string;
          connection_id: string;
          sender_id: string;
          content: string;
          sent_at?: string;
        };
        Update: {
          message_id?: string;
          connection_id?: string;
          sender_id?: string;
          content?: string;
          sent_at?: string;
        };
      };
      sessions: {
        Row: {
          session_id: string;
          organizer_id: string;
          participant_id: string;
          scheduled_at: string;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          session_id?: string;
          organizer_id: string;
          participant_id: string;
          scheduled_at: string;
          duration_minutes: number;
          created_at?: string;
        };
        Update: {
          session_id?: string;
          organizer_id?: string;
          participant_id?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          created_at?: string;
        };
      };
      group_sessions: {
        Row: {
          session_id: string;
          organizer_id: string;
          topic: string;
          scheduled_at: string;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          session_id?: string;
          organizer_id: string;
          topic: string;
          scheduled_at: string;
          duration_minutes: number;
          created_at?: string;
        };
        Update: {
          session_id?: string;
          organizer_id?: string;
          topic?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          created_at?: string;
        };
      };
      group_session_participants: {
        Row: {
          session_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      reviews: {
        Row: {
          review_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          review_id?: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          review_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      credits_transactions: {
        Row: {
          transaction_id: string;
          user_id: string;
          change_amount: number;
          balance_after: number;
          transaction_type: string;
          created_at: string;
        };
        Insert: {
          transaction_id?: string;
          user_id: string;
          change_amount: number;
          balance_after: number;
          transaction_type: string;
          created_at?: string;
        };
        Update: {
          transaction_id?: string;
          user_id?: string;
          change_amount?: number;
          balance_after?: number;
          transaction_type?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          notification_id: string;
          user_id: string;
          type: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          notification_id?: string;
          user_id: string;
          type: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          notification_id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          report_id: string;
          reporter_id: string;
          reported_user_id: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          report_id?: string;
          reporter_id: string;
          reported_user_id: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          report_id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          details?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
