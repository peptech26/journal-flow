export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          actor_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          details: Json | null
          id: string
          manuscript_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          details?: Json | null
          id?: string
          manuscript_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          details?: Json | null
          id?: string
          manuscript_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_versions: {
        Row: {
          cover_letter: string | null
          created_at: string
          file_name: string | null
          file_path: string
          id: string
          manuscript_id: string
          uploaded_by: string | null
          version_number: number
          word_count: number | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          file_name?: string | null
          file_path: string
          id?: string
          manuscript_id: string
          uploaded_by?: string | null
          version_number: number
          word_count?: number | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          file_name?: string | null
          file_path?: string
          id?: string
          manuscript_id?: string
          uploaded_by?: string | null
          version_number?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_versions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscripts: {
        Row: {
          abstract: string | null
          assigned_editor: string | null
          assigned_secretary: string | null
          author_id: string
          created_at: string
          current_version: number
          id: string
          keywords: string[] | null
          published_at: string | null
          published_pdf_url: string | null
          rejection_reason: string | null
          routed_to: string | null
          status: Database["public"]["Enums"]["manuscript_status"]
          subject_area: string | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          assigned_editor?: string | null
          assigned_secretary?: string | null
          author_id: string
          created_at?: string
          current_version?: number
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          published_pdf_url?: string | null
          rejection_reason?: string | null
          routed_to?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"]
          subject_area?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          assigned_editor?: string | null
          assigned_secretary?: string | null
          author_id?: string
          created_at?: string
          current_version?: number
          id?: string
          keywords?: string[] | null
          published_at?: string | null
          published_pdf_url?: string | null
          rejection_reason?: string | null
          routed_to?: string | null
          status?: Database["public"]["Enums"]["manuscript_status"]
          subject_area?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliation: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          expertise: string[] | null
          full_name: string | null
          id: string
          orcid: string | null
          updated_at: string
        }
        Insert: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string[] | null
          full_name?: string | null
          id: string
          orcid?: string | null
          updated_at?: string
        }
        Update: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          orcid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviewer_assignments: {
        Row: {
          assigned_by: string | null
          comments_to_author: string | null
          comments_to_editor: string | null
          created_at: string
          decline_reason: string | null
          due_date: string | null
          id: string
          manuscript_id: string
          recommendation:
            | Database["public"]["Enums"]["review_recommendation"]
            | null
          reviewer_id: string
          round: number
          status: Database["public"]["Enums"]["assignment_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          comments_to_author?: string | null
          comments_to_editor?: string | null
          created_at?: string
          decline_reason?: string | null
          due_date?: string | null
          id?: string
          manuscript_id: string
          recommendation?:
            | Database["public"]["Enums"]["review_recommendation"]
            | null
          reviewer_id: string
          round?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          comments_to_author?: string | null
          comments_to_editor?: string | null
          created_at?: string
          decline_reason?: string | null
          due_date?: string | null
          id?: string
          manuscript_id?: string
          recommendation?:
            | Database["public"]["Enums"]["review_recommendation"]
            | null
          reviewer_id?: string
          round?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_assignments_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_cvs: {
        Row: {
          file_name: string | null
          file_path: string
          id: string
          reviewer_id: string
          uploaded_at: string
        }
        Insert: {
          file_name?: string | null
          file_path: string
          id?: string
          reviewer_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string | null
          file_path?: string
          id?: string
          reviewer_id?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      role_request_history: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["role_request_status"] | null
          id: string
          notes: string | null
          request_id: string
          to_status: Database["public"]["Enums"]["role_request_status"] | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["role_request_status"]
            | null
          id?: string
          notes?: string | null
          request_id: string
          to_status?: Database["public"]["Enums"]["role_request_status"] | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["role_request_status"]
            | null
          id?: string
          notes?: string | null
          request_id?: string
          to_status?: Database["public"]["Enums"]["role_request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "role_request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "role_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      role_requests: {
        Row: {
          created_at: string
          id: string
          justification: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["role_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          justification?: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["role_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          justification?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["role_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "author"
        | "reviewer"
        | "editorial_secretary"
        | "editor_in_chief"
        | "admin"
      assignment_status:
        | "invited"
        | "accepted"
        | "declined"
        | "submitted"
        | "expired"
      manuscript_status:
        | "submitted"
        | "with_secretary"
        | "rejected_by_secretary"
        | "under_review"
        | "revision_requested"
        | "accepted"
        | "galley_proof"
        | "published"
        | "withdrawn"
        | "reviews_complete"
        | "resubmitted"
        | "with_eic"
        | "approved_for_publication"
      review_recommendation:
        | "accept"
        | "minor_revision"
        | "major_revision"
        | "reject"
      role_request_status: "pending" | "approved" | "rejected"
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
      app_role: [
        "author",
        "reviewer",
        "editorial_secretary",
        "editor_in_chief",
        "admin",
      ],
      assignment_status: [
        "invited",
        "accepted",
        "declined",
        "submitted",
        "expired",
      ],
      manuscript_status: [
        "submitted",
        "with_secretary",
        "rejected_by_secretary",
        "under_review",
        "revision_requested",
        "accepted",
        "galley_proof",
        "published",
        "withdrawn",
        "reviews_complete",
        "resubmitted",
        "with_eic",
        "approved_for_publication",
      ],
      review_recommendation: [
        "accept",
        "minor_revision",
        "major_revision",
        "reject",
      ],
      role_request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
