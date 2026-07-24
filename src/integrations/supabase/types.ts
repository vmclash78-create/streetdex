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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_purchase_amount: number | null
          status: string | null
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_purchase_amount?: number | null
          status?: string | null
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_purchase_amount?: number | null
          status?: string | null
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          expense_date: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          expense_date?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          expense_date?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          active: boolean | null
          created_at: string
          cta: string | null
          id: string
          img: string
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          cta?: string | null
          id?: string
          img: string
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          cta?: string | null
          id?: string
          img?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_img: string | null
          product_name: string
          quantity: number
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_img?: string | null
          product_name: string
          quantity?: number
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_img?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_cep: string | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_street: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          order_number: number
          payment_method: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
        }
        Insert: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_street?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Update: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_street?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_costs: {
        Row: {
          cost: number | null
          created_at: string | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          colors: string[] | null
          cost: number | null
          created_at: string
          description: string | null
          free_shipping: boolean | null
          id: string
          img: string
          img2: string | null
          measurements: Json | null
          name: string
          old_price: number | null
          price: number
          shipping_cost: number
          sizes: string[]
          sort_order: number | null
          status: string | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          id?: string
          img: string
          img2?: string | null
          measurements?: Json | null
          name: string
          old_price?: number | null
          price: number
          shipping_cost?: number
          sizes?: string[]
          sort_order?: number | null
          status?: string | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string
          description?: string | null
          free_shipping?: boolean | null
          id?: string
          img?: string
          img2?: string | null
          measurements?: Json | null
          name?: string
          old_price?: number | null
          price?: number
          shipping_cost?: number
          sizes?: string[]
          sort_order?: number | null
          status?: string | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          size: string | null
          unit_cost: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          size?: string | null
          unit_cost?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          size?: string | null
          unit_cost?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_name: string | null
          discount: number | null
          id: string
          notes: string | null
          order_number: number | null
          payment_method: string
          sale_date: string
          total: number
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: number | null
          payment_method?: string
          sale_date?: string
          total?: number
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: number | null
          payment_method?: string
          sale_date?: string
          total?: number
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string
          carrier_order_id: string | null
          carrier_service: string | null
          created_at: string
          delivered_at: string | null
          id: string
          label_url: string | null
          order_id: string
          posted_at: string | null
          raw_response: Json
          shipping_cost: number | null
          status: string
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string
          carrier_order_id?: string | null
          carrier_service?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          label_url?: string | null
          order_id: string
          posted_at?: string | null
          raw_response?: Json
          shipping_cost?: number | null
          status?: string
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string
          carrier_order_id?: string | null
          carrier_service?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          label_url?: string | null
          order_id?: string
          posted_at?: string | null
          raw_response?: Json
          shipping_cost?: number | null
          status?: string
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          product_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          product_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_storefront_order: {
        Args: {
          p_address_cep?: string
          p_address_city?: string
          p_address_complement?: string
          p_address_neighborhood?: string
          p_address_number?: string
          p_address_street?: string
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone: string
          p_items?: Json
          p_notes?: string
          p_payment_method?: string
          p_total?: number
        }
        Returns: {
          id: string
          order_number: number
        }[]
      }
      get_order_for_tracking: {
        Args: { p_order_id: string }
        Returns: {
          address_cep: string
          address_city: string
          address_complement: string
          address_neighborhood: string
          address_number: string
          address_street: string
          created_at: string
          id: string
          notes: string
          order_items: Json
          order_number: number
          payment_method: string
          status: string
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_coupon: { Args: { p_id: string }; Returns: undefined }
      validate_coupon: {
        Args: { p_code: string; p_total: number }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
          id: string
          min_purchase_amount: number
          reason: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "aguardando_pagamento"
        | "pago"
        | "preparando"
        | "etiqueta_gerada"
        | "enviado"
        | "postado"
        | "em_transito"
        | "entregue"
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
      app_role: ["admin", "user"],
      order_status: [
        "aguardando_pagamento",
        "pago",
        "preparando",
        "etiqueta_gerada",
        "enviado",
        "postado",
        "em_transito",
        "entregue",
      ],
    },
  },
} as const
