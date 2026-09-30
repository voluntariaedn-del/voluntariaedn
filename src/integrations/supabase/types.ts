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
      applications: {
        Row: {
          availability: string | null
          created_at: string
          id: string
          message: string
          opportunity_id: string
          org_reply: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          id?: string
          message?: string
          opportunity_id: string
          org_reply?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          id?: string
          message?: string
          opportunity_id?: string
          org_reply?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      causes: {
        Row: {
          description: string | null
          icon: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          cause: string | null
          city: string | null
          created_at: string
          date: string | null
          description: string
          duration_hours: number | null
          id: string
          modality: string
          organization_id: string
          skills: string[]
          slots: number
          state: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          time: string | null
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          cause?: string | null
          city?: string | null
          created_at?: string
          date?: string | null
          description?: string
          duration_hours?: number | null
          id?: string
          modality?: string
          organization_id: string
          skills?: string[]
          slots?: number
          state?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          time?: string | null
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          cause?: string | null
          city?: string | null
          created_at?: string
          date?: string | null
          description?: string
          duration_hours?: number | null
          id?: string
          modality?: string
          organization_id?: string
          skills?: string[]
          slots?: number
          state?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          time?: string | null
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          causes: string[]
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          document: string | null
          founded_year: number | null
          id: string
          instagram: string | null
          logo_url: string | null
          mission: string | null
          name: string
          owner_id: string
          slug: string
          state: string | null
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          causes?: string[]
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          document?: string | null
          founded_year?: number | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          mission?: string | null
          name: string
          owner_id: string
          slug: string
          state?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          causes?: string[]
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          document?: string | null
          founded_year?: number | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          mission?: string | null
          name?: string
          owner_id?: string
          slug?: string
          state?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_demo: boolean
          name: string
          photo_url: string | null
          role: string
          sort_order: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          photo_url?: string | null
          role: string
          sort_order?: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_photos: {
        Row: {
          caption: string | null
          city: string | null
          created_at: string
          id: string
          image_url: string
          is_demo: boolean
          org_name: string | null
          sort_order: number
          state: string | null
          title: string
          visit_date: string | null
        }
        Insert: {
          caption?: string | null
          city?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_demo?: boolean
          org_name?: string | null
          sort_order?: number
          state?: string | null
          title: string
          visit_date?: string | null
        }
        Update: {
          caption?: string | null
          city?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_demo?: boolean
          org_name?: string | null
          sort_order?: number
          state?: string | null
          title?: string
          visit_date?: string | null
        }
        Relationships: []
      }
      volunteer_profiles: {
        Row: {
          availability: string[]
          birth_date: string | null
          created_at: string
          experience: string | null
          hours_per_week: number | null
          interests: string[]
          modality: string
          skills: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string[]
          birth_date?: string | null
          created_at?: string
          experience?: string | null
          hours_per_week?: number | null
          interests?: string[]
          modality?: string
          skills?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string[]
          birth_date?: string | null
          created_at?: string
          experience?: string | null
          hours_per_week?: number | null
          interests?: string[]
          modality?: string
          skills?: string[]
          updated_at?: string
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
      app_role: "volunteer" | "organization" | "admin"
      application_status: "pendente" | "aceita" | "recusada" | "contatada"
      opportunity_status: "aberta" | "encerrada"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["volunteer", "organization", "admin"],
      application_status: ["pendente", "aceita", "recusada", "contatada"],
      opportunity_status: ["aberta", "encerrada"],
    },
  },
} as const
