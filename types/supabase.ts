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
      bottles_catalog: {
        Row: {
          brand: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_en: string
          name_zh: string
          slug: string
          spirit_type_id: string
          volume_ml: number | null
        }
        Insert: {
          brand?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_zh: string
          slug: string
          spirit_type_id: string
          volume_ml?: number | null
        }
        Update: {
          brand?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_zh?: string
          slug?: string
          spirit_type_id?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bottles_catalog_spirit_type_id_fkey"
            columns: ["spirit_type_id"]
            isOneToOne: false
            referencedRelation: "spirit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          amount: string
          id: string
          is_spirit: boolean
          name_en: string | null
          name_zh: string | null
          recipe_id: string
          sort_order: number
          spirit_type_id: string | null
        }
        Insert: {
          amount: string
          id?: string
          is_spirit: boolean
          name_en?: string | null
          name_zh?: string | null
          recipe_id: string
          sort_order?: number
          spirit_type_id?: string | null
        }
        Update: {
          amount?: string
          id?: string
          is_spirit?: boolean
          name_en?: string | null
          name_zh?: string | null
          recipe_id?: string
          sort_order?: number
          spirit_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_spirit_type_id_fkey"
            columns: ["spirit_type_id"]
            isOneToOne: false
            referencedRelation: "spirit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          abv_percent: number | null
          author_id: string | null
          base_popularity: number
          base_rating: number
          created_at: string
          description_en: string | null
          description_zh: string | null
          difficulty: string
          flavor_tags: string[]
          id: string
          image_url: string | null
          instructions_en: string[]
          instructions_zh: string[]
          is_public: boolean
          name_en: string
          name_zh: string
          prep_minutes: number
          slug: string
          tip_en: string | null
          tip_zh: string | null
        }
        Insert: {
          abv_percent?: number | null
          author_id?: string | null
          base_popularity?: number
          base_rating?: number
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          difficulty: string
          flavor_tags?: string[]
          id?: string
          image_url?: string | null
          instructions_en: string[]
          instructions_zh: string[]
          is_public?: boolean
          name_en: string
          name_zh: string
          prep_minutes: number
          slug: string
          tip_en?: string | null
          tip_zh?: string | null
        }
        Update: {
          abv_percent?: number | null
          author_id?: string | null
          base_popularity?: number
          base_rating?: number
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          difficulty?: string
          flavor_tags?: string[]
          id?: string
          image_url?: string | null
          instructions_en?: string[]
          instructions_zh?: string[]
          is_public?: boolean
          name_en?: string
          name_zh?: string
          prep_minutes?: number
          slug?: string
          tip_en?: string | null
          tip_zh?: string | null
        }
        Relationships: []
      }
      spirit_types: {
        Row: {
          category: string
          id: string
          name_en: string
          name_zh: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: string
          id?: string
          name_en: string
          name_zh: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: string
          id?: string
          name_en?: string
          name_zh?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_bottles: {
        Row: {
          bottle_id: string | null
          created_at: string
          custom_name: string | null
          id: string
          spirit_type_id: string | null
          status: string
          user_id: string
          volume_ml: number | null
        }
        Insert: {
          bottle_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          spirit_type_id?: string | null
          status?: string
          user_id: string
          volume_ml?: number | null
        }
        Update: {
          bottle_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          spirit_type_id?: string | null
          status?: string
          user_id?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bottles_bottle_id_fkey"
            columns: ["bottle_id"]
            isOneToOne: false
            referencedRelation: "bottles_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bottles_spirit_type_id_fkey"
            columns: ["spirit_type_id"]
            isOneToOne: false
            referencedRelation: "spirit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pour_logs: {
        Row: {
          created_at: string
          id: string
          note: string | null
          poured_at: string
          rating: number | null
          recipe_id: string
          taste_tags: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          poured_at?: string
          rating?: number | null
          recipe_id: string
          taste_tags?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          poured_at?: string
          rating?: number | null
          recipe_id?: string
          taste_tags?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pour_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recipe_marks: {
        Row: {
          is_favorite: boolean
          rating: number | null
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          is_favorite?: boolean
          rating?: number | null
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          is_favorite?: boolean
          rating?: number | null
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recipe_marks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

