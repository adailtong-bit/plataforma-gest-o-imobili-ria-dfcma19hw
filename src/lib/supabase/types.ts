// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      advertisers: {
        Row: {
          billing_address: string | null
          billing_email: string
          billing_phone: string | null
          city: string | null
          complement: string | null
          contacts: Json | null
          country: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          state: string | null
          street: string | null
          tax_id: string | null
          zip_code: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_email: string
          billing_phone?: string | null
          city?: string | null
          complement?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
          tax_id?: string | null
          zip_code?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_email?: string
          billing_phone?: string | null
          city?: string | null
          complement?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          street?: string | null
          tax_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          approval_status: string | null
          base_amount: number | null
          check_in: string
          check_out: string
          created_at: string
          discount_amount: number | null
          guest_id: string | null
          id: string
          origin: string | null
          property_id: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          approval_status?: string | null
          base_amount?: number | null
          check_in: string
          check_out: string
          created_at?: string
          discount_amount?: number | null
          guest_id?: string | null
          id?: string
          origin?: string | null
          property_id?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          approval_status?: string | null
          base_amount?: number | null
          check_in?: string
          check_out?: string
          created_at?: string
          discount_amount?: number | null
          guest_id?: string | null
          id?: string
          origin?: string | null
          property_id?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          city: string
          country: string | null
          created_at: string
          id: string
          manager_email: string | null
          manager_name: string | null
          manager_phone: string | null
          name: string
          neighborhood: string | null
          number: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city: string
          country?: string | null
          created_at?: string
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          country?: string | null
          created_at?: string
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          due_date: string | null
          from_address: string | null
          from_email: string | null
          from_id: string | null
          from_name: string | null
          from_phone: string | null
          id: string
          invoice_number: string | null
          items: Json | null
          notes: string | null
          payment_link: string | null
          property_id: string | null
          status: string | null
          to_address: string | null
          to_email: string | null
          to_id: string | null
          to_name: string | null
          to_phone: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          due_date?: string | null
          from_address?: string | null
          from_email?: string | null
          from_id?: string | null
          from_name?: string | null
          from_phone?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          payment_link?: string | null
          property_id?: string | null
          status?: string | null
          to_address?: string | null
          to_email?: string | null
          to_id?: string | null
          to_name?: string | null
          to_phone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          due_date?: string | null
          from_address?: string | null
          from_email?: string | null
          from_id?: string | null
          from_name?: string | null
          from_phone?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json | null
          notes?: string | null
          payment_link?: string | null
          property_id?: string | null
          status?: string | null
          to_address?: string | null
          to_email?: string | null
          to_id?: string | null
          to_name?: string | null
          to_phone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          category: string | null
          cost_type: string | null
          created_at: string
          date: string
          description: string
          id: string
          invoice_id: string | null
          is_recurring: boolean | null
          property_id: string | null
          recurrence_frequency: string | null
          status: string | null
          type: string
        }
        Insert: {
          amount: number
          category?: string | null
          cost_type?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          invoice_id?: string | null
          is_recurring?: boolean | null
          property_id?: string | null
          recurrence_frequency?: string | null
          status?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          cost_type?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          invoice_id?: string | null
          is_recurring?: boolean | null
          property_id?: string | null
          recurrence_frequency?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          document: string | null
          email: string
          id: string
          language_preference: string | null
          name: string
          neighborhood: string | null
          origin: string | null
          owner_decision: string | null
          phone: string | null
          pm_id: string | null
          role: string
          source: string | null
          state: string | null
          status: string | null
          tags: Json | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document?: string | null
          email: string
          id: string
          language_preference?: string | null
          name: string
          neighborhood?: string | null
          origin?: string | null
          owner_decision?: string | null
          phone?: string | null
          pm_id?: string | null
          role?: string
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: Json | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          language_preference?: string | null
          name?: string
          neighborhood?: string | null
          origin?: string | null
          owner_decision?: string | null
          phone?: string | null
          pm_id?: string | null
          role?: string
          source?: string | null
          state?: string | null
          status?: string | null
          tags?: Json | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          agent_id: string | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          community: string | null
          condominium_id: string | null
          country: string | null
          created_at: string
          floor: string | null
          guests: number | null
          hoa_value: number | null
          hotel_id: string | null
          id: string
          image: string | null
          listing_price: number | null
          name: string
          neighborhood: string | null
          number: string | null
          owner_id: string | null
          pm_id: string | null
          profile_type: string | null
          room_number: string | null
          room_type_id: string | null
          state: string | null
          status: string | null
          tower_id: string | null
          type: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          agent_id?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          community?: string | null
          condominium_id?: string | null
          country?: string | null
          created_at?: string
          floor?: string | null
          guests?: number | null
          hoa_value?: number | null
          hotel_id?: string | null
          id?: string
          image?: string | null
          listing_price?: number | null
          name: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          pm_id?: string | null
          profile_type?: string | null
          room_number?: string | null
          room_type_id?: string | null
          state?: string | null
          status?: string | null
          tower_id?: string | null
          type?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          agent_id?: string | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          community?: string | null
          condominium_id?: string | null
          country?: string | null
          created_at?: string
          floor?: string | null
          guests?: number | null
          hoa_value?: number | null
          hotel_id?: string | null
          id?: string
          image?: string | null
          listing_price?: number | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string | null
          pm_id?: string | null
          profile_type?: string | null
          room_number?: string | null
          room_type_id?: string | null
          state?: string | null
          status?: string | null
          tower_id?: string | null
          type?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "towers"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_campaigns: {
        Row: {
          advertiser_id: string | null
          clicks_count: number | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          impressions_count: number | null
          last_notified_at: string | null
          link_url: string | null
          pricing_id: string | null
          start_date: string | null
          status: string | null
          title: string
          total_amount: number | null
        }
        Insert: {
          advertiser_id?: string | null
          clicks_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          last_notified_at?: string | null
          link_url?: string | null
          pricing_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_amount?: number | null
        }
        Update: {
          advertiser_id?: string | null
          clicks_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          last_notified_at?: string | null
          link_url?: string | null
          pricing_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publicity_campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publicity_campaigns_pricing_id_fkey"
            columns: ["pricing_id"]
            isOneToOne: false
            referencedRelation: "publicity_pricing_matrix"
            referencedColumns: ["id"]
          },
        ]
      }
      publicity_pricing_matrix: {
        Row: {
          created_at: string
          duration_days: number
          id: string
          location_key: string
          price: number
          valid_from: string | null
        }
        Insert: {
          created_at?: string
          duration_days: number
          id?: string
          location_key: string
          price: number
          valid_from?: string | null
        }
        Update: {
          created_at?: string
          duration_days?: number
          id?: string
          location_key?: string
          price?: number
          valid_from?: string | null
        }
        Relationships: []
      }
      room_types: {
        Row: {
          base_price: number
          bathrooms: number | null
          bedrooms: number | null
          capacity: number | null
          characteristics: Json | null
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          bathrooms?: number | null
          bedrooms?: number | null
          capacity?: number | null
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approval_status: string | null
          assignee: string | null
          assignee_id: string | null
          created_at: string
          created_by: string | null
          date: string | null
          id: string
          images: string[] | null
          labor_cost: number | null
          partner_employee_id: string | null
          price: number | null
          pricing_model: string | null
          priority: string | null
          property_address: string | null
          property_id: string | null
          property_name: string | null
          source: string | null
          status: string | null
          team_member_payout: number | null
          title: string
          type: string | null
        }
        Insert: {
          approval_status?: string | null
          assignee?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          images?: string[] | null
          labor_cost?: number | null
          partner_employee_id?: string | null
          price?: number | null
          pricing_model?: string | null
          priority?: string | null
          property_address?: string | null
          property_id?: string | null
          property_name?: string | null
          source?: string | null
          status?: string | null
          team_member_payout?: number | null
          title: string
          type?: string | null
        }
        Update: {
          approval_status?: string | null
          assignee?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          id?: string
          images?: string[] | null
          labor_cost?: number | null
          partner_employee_id?: string | null
          price?: number | null
          pricing_model?: string | null
          priority?: string | null
          property_address?: string | null
          property_id?: string | null
          property_name?: string | null
          source?: string | null
          status?: string | null
          team_member_payout?: number | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      towers: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "towers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_translations: {
        Row: {
          id: string
          key: string
          locale: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          locale: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          locale?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile: {
        Args: {
          p_city?: string
          p_document?: string
          p_email: string
          p_name: string
          p_password: string
          p_phone?: string
          p_role: string
          p_state?: string
          p_status?: string
        }
        Returns: string
      }
      is_admin_or_pm: { Args: never; Returns: boolean }
      update_expired_campaigns: { Args: never; Returns: undefined }
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: advertisers
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   tax_id: text (nullable)
//   billing_email: text (not null)
//   billing_phone: text (nullable)
//   billing_address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   street: text (nullable)
//   number: text (nullable)
//   complement: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip_code: text (nullable)
//   country: text (nullable)
//   contacts: jsonb (nullable, default: '[]'::jsonb)
// Table: bookings
//   id: uuid (not null, default: gen_random_uuid())
//   property_id: uuid (nullable)
//   guest_id: uuid (nullable)
//   check_in: timestamp with time zone (not null)
//   check_out: timestamp with time zone (not null)
//   status: text (nullable, default: 'confirmed'::text)
//   origin: text (nullable, default: 'presential'::text)
//   total_amount: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   base_amount: numeric (nullable, default: 0)
//   discount_amount: numeric (nullable, default: 0)
//   approval_status: text (nullable, default: 'approved'::text)
// Table: conversation_participants
//   conversation_id: uuid (not null)
//   profile_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: conversations
//   id: uuid (not null, default: gen_random_uuid())
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: guests
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: hotels
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   manager_name: text (nullable)
//   manager_phone: text (nullable)
//   manager_email: text (nullable)
//   address: text (nullable)
//   number: text (nullable)
//   neighborhood: text (nullable)
//   city: text (not null)
//   state: text (nullable)
//   zip_code: text (nullable)
//   country: text (nullable, default: 'US'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: invoices
//   id: uuid (not null, default: gen_random_uuid())
//   invoice_number: text (nullable)
//   description: text (nullable)
//   amount: numeric (nullable, default: 0)
//   status: text (nullable, default: 'pending'::text)
//   date: timestamp with time zone (nullable, default: now())
//   due_date: timestamp with time zone (nullable)
//   from_name: text (nullable)
//   from_email: text (nullable)
//   from_phone: text (nullable)
//   from_address: text (nullable)
//   to_name: text (nullable)
//   to_email: text (nullable)
//   to_phone: text (nullable)
//   to_address: text (nullable)
//   from_id: uuid (nullable)
//   to_id: uuid (nullable)
//   property_id: uuid (nullable)
//   type: text (nullable)
//   booking_id: text (nullable)
//   items: jsonb (nullable, default: '[]'::jsonb)
//   notes: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   payment_link: text (nullable)
// Table: ledger_entries
//   id: uuid (not null, default: gen_random_uuid())
//   description: text (not null)
//   amount: numeric (not null)
//   type: text (not null)
//   date: timestamp with time zone (not null)
//   status: text (nullable, default: 'pending'::text)
//   category: text (nullable)
//   property_id: uuid (nullable)
//   cost_type: text (nullable)
//   is_recurring: boolean (nullable, default: false)
//   recurrence_frequency: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   invoice_id: uuid (nullable)
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   conversation_id: uuid (not null)
//   sender_id: uuid (not null)
//   content: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (not null, default: 'tenant'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   pm_id: uuid (nullable)
//   source: text (nullable)
//   origin: text (nullable)
//   tags: jsonb (nullable, default: '[]'::jsonb)
//   owner_decision: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   language_preference: text (nullable, default: 'en'::text)
//   phone: text (nullable)
//   document: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   country: text (nullable)
//   address: text (nullable)
//   zip_code: text (nullable)
//   neighborhood: text (nullable)
// Table: properties
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   address: text (not null)
//   number: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip_code: text (nullable)
//   country: text (nullable)
//   type: text (nullable)
//   profile_type: text (nullable)
//   community: text (nullable)
//   condominium_id: uuid (nullable)
//   hotel_id: uuid (nullable)
//   tower_id: uuid (nullable)
//   floor: text (nullable)
//   room_number: text (nullable)
//   status: text (nullable, default: 'available'::text)
//   image: text (nullable)
//   bedrooms: integer (nullable, default: 0)
//   bathrooms: integer (nullable, default: 0)
//   guests: integer (nullable, default: 0)
//   owner_id: uuid (nullable)
//   agent_id: uuid (nullable)
//   listing_price: numeric (nullable, default: 0)
//   hoa_value: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   area: numeric (nullable, default: 0)
//   pm_id: uuid (nullable)
//   room_type_id: uuid (nullable)
// Table: publicity_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null, default: 'Campaign'::text)
//   advertiser_id: uuid (nullable)
//   pricing_id: uuid (nullable)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   status: text (nullable, default: 'pending'::text)
//   total_amount: numeric (nullable)
//   image_url: text (nullable)
//   link_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   last_notified_at: timestamp with time zone (nullable)
//   impressions_count: integer (nullable, default: 0)
//   clicks_count: integer (nullable, default: 0)
// Table: publicity_pricing_matrix
//   id: uuid (not null, default: gen_random_uuid())
//   location_key: text (not null)
//   duration_days: integer (not null)
//   price: numeric (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   valid_from: timestamp with time zone (nullable, default: now())
// Table: room_types
//   id: uuid (not null, default: gen_random_uuid())
//   hotel_id: uuid (not null)
//   name: text (not null)
//   description: text (nullable)
//   base_price: numeric (not null, default: 0)
//   capacity: integer (nullable, default: 1)
//   bedrooms: integer (nullable, default: 1)
//   bathrooms: integer (nullable, default: 1)
//   characteristics: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   property_id: uuid (nullable)
//   property_name: text (nullable)
//   property_address: text (nullable)
//   type: text (nullable)
//   priority: text (nullable)
//   status: text (nullable, default: 'pending'::text)
//   approval_status: text (nullable)
//   date: text (nullable)
//   assignee_id: uuid (nullable)
//   partner_employee_id: text (nullable)
//   assignee: text (nullable)
//   pricing_model: text (nullable)
//   price: numeric (nullable, default: 0)
//   labor_cost: numeric (nullable, default: 0)
//   team_member_payout: numeric (nullable, default: 0)
//   source: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   images: _text (nullable, default: '{}'::text[])
//   created_by: uuid (nullable, default: auth.uid())
// Table: towers
//   id: uuid (not null, default: gen_random_uuid())
//   hotel_id: uuid (not null)
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: ui_translations
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   locale: text (not null)
//   value: text (not null)

// --- CONSTRAINTS ---
// Table: advertisers
//   PRIMARY KEY advertisers_pkey: PRIMARY KEY (id)
// Table: bookings
//   FOREIGN KEY bookings_guest_id_fkey: FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
//   PRIMARY KEY bookings_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bookings_property_id_fkey: FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
// Table: conversation_participants
//   FOREIGN KEY conversation_participants_conversation_id_fkey: FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
//   PRIMARY KEY conversation_participants_pkey: PRIMARY KEY (conversation_id, profile_id)
//   FOREIGN KEY conversation_participants_profile_id_fkey: FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: conversations
//   PRIMARY KEY conversations_pkey: PRIMARY KEY (id)
// Table: guests
//   PRIMARY KEY guests_pkey: PRIMARY KEY (id)
// Table: hotels
//   PRIMARY KEY hotels_pkey: PRIMARY KEY (id)
// Table: invoices
//   CHECK check_different_entities: CHECK (((from_id IS NULL) OR (to_id IS NULL) OR (from_id <> to_id)))
//   FOREIGN KEY invoices_from_id_fkey: FOREIGN KEY (from_id) REFERENCES profiles(id) ON DELETE SET NULL
//   PRIMARY KEY invoices_pkey: PRIMARY KEY (id)
//   FOREIGN KEY invoices_property_id_fkey: FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
//   FOREIGN KEY invoices_to_id_fkey: FOREIGN KEY (to_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: ledger_entries
//   FOREIGN KEY ledger_entries_invoice_id_fkey: FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
//   PRIMARY KEY ledger_entries_pkey: PRIMARY KEY (id)
//   FOREIGN KEY ledger_entries_property_id_fkey: FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
// Table: messages
//   FOREIGN KEY messages_conversation_id_fkey: FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY messages_sender_id_fkey: FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   FOREIGN KEY profiles_pm_id_fkey: FOREIGN KEY (pm_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: properties
//   FOREIGN KEY properties_agent_id_fkey: FOREIGN KEY (agent_id) REFERENCES profiles(id) ON DELETE SET NULL
//   FOREIGN KEY properties_hotel_id_fkey: FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
//   FOREIGN KEY properties_owner_id_fkey: FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL
//   PRIMARY KEY properties_pkey: PRIMARY KEY (id)
//   FOREIGN KEY properties_pm_id_fkey: FOREIGN KEY (pm_id) REFERENCES profiles(id) ON DELETE SET NULL
//   FOREIGN KEY properties_room_type_id_fkey: FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
//   FOREIGN KEY properties_tower_id_fkey: FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL
// Table: publicity_campaigns
//   FOREIGN KEY publicity_campaigns_advertiser_id_fkey: FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE
//   PRIMARY KEY publicity_campaigns_pkey: PRIMARY KEY (id)
//   FOREIGN KEY publicity_campaigns_pricing_id_fkey: FOREIGN KEY (pricing_id) REFERENCES publicity_pricing_matrix(id) ON DELETE SET NULL
// Table: publicity_pricing_matrix
//   PRIMARY KEY publicity_pricing_matrix_pkey: PRIMARY KEY (id)
// Table: room_types
//   FOREIGN KEY room_types_hotel_id_fkey: FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
//   PRIMARY KEY room_types_pkey: PRIMARY KEY (id)
// Table: tasks
//   FOREIGN KEY tasks_assignee_id_fkey: FOREIGN KEY (assignee_id) REFERENCES profiles(id)
//   FOREIGN KEY tasks_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id)
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tasks_property_id_fkey: FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
// Table: towers
//   FOREIGN KEY towers_hotel_id_fkey: FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
//   PRIMARY KEY towers_pkey: PRIMARY KEY (id)
// Table: ui_translations
//   UNIQUE ui_translations_key_locale_key: UNIQUE (key, locale)
//   PRIMARY KEY ui_translations_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: advertisers
//   Policy "admin_all_advertisers" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
// Table: bookings
//   Policy "bookings_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: conversation_participants
//   Policy "conversation_participants_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: conversations
//   Policy "conversations_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: guests
//   Policy "guests_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: hotels
//   Policy "hotels_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "hotels_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "hotels_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "hotels_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "master_all_hotels" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
// Table: invoices
//   Policy "admin_all_invoices" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
//   Policy "invoices_advertiser_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (from_id = auth.uid()) OR (to_id = auth.uid()) OR (property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (to_email = (( SELECT users.email    FROM auth.users   WHERE (users.id = auth.uid())))::text))
//   Policy "invoices_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "invoices_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//   Policy "invoices_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "invoices_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (from_id = auth.uid()) OR (to_id = auth.uid()) OR (property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))))
//   Policy "invoices_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (from_id = auth.uid()) OR (to_id = auth.uid()) OR (property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))))
// Table: ledger_entries
//   Policy "ledger_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//   Policy "ledger_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "ledger_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))))
//   Policy "ledger_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))))
// Table: messages
//   Policy "messages_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "master_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
//   Policy "profiles_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "profiles_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "profiles_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "profiles_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: properties
//   Policy "master_all_properties" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
//   Policy "properties_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "properties_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "properties_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "properties_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: publicity_campaigns
//   Policy "admin_all_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
//   Policy "campaigns_advertiser_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_admin_or_pm() OR (advertiser_id IN ( SELECT advertisers.id    FROM advertisers   WHERE (advertisers.billing_email = (( SELECT users.email            FROM auth.users           WHERE (users.id = auth.uid())))::text))))
// Table: publicity_pricing_matrix
//   Policy "admin_all_pricing" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//     WITH CHECK: is_admin_or_pm()
// Table: room_types
//   Policy "room_types_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tasks
//   Policy "tasks_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (assignee_id = auth.uid()) OR (created_by = auth.uid()) OR is_admin_or_pm())
//   Policy "tasks_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "tasks_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (assignee_id = auth.uid()) OR (created_by = auth.uid()) OR is_admin_or_pm())
//   Policy "tasks_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (assignee_id = auth.uid()) OR (partner_employee_id = (auth.uid())::text) OR (created_by = auth.uid()) OR is_admin_or_pm() OR (auth.uid() IN ( SELECT profiles.id    FROM profiles   WHERE (profiles.role = ANY (ARRAY['partner'::text, 'partner_employee'::text])))))
//     WITH CHECK: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (assignee_id = auth.uid()) OR (partner_employee_id = (auth.uid())::text) OR (created_by = auth.uid()) OR is_admin_or_pm() OR (auth.uid() IN ( SELECT profiles.id    FROM profiles   WHERE (profiles.role = ANY (ARRAY['partner'::text, 'partner_employee'::text])))))
// Table: towers
//   Policy "towers_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "towers_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "towers_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "towers_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: ui_translations
//   Policy "admin_manage_translations" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin_or_pm()
//   Policy "authenticated_select_translations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION check_campaign_slot_limit()
//   CREATE OR REPLACE FUNCTION public.check_campaign_slot_limit()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     loc_key TEXT;
//     overlapping_count INT;
//   BEGIN
//     IF NEW.pricing_id IS NOT NULL THEN
//       SELECT location_key INTO loc_key FROM public.publicity_pricing_matrix WHERE id = NEW.pricing_id;
//       
//       IF loc_key IS NOT NULL THEN
//         SELECT COUNT(*) INTO overlapping_count
//         FROM public.publicity_campaigns pc
//         JOIN public.publicity_pricing_matrix pm ON pc.pricing_id = pm.id
//         WHERE pm.location_key = loc_key
//           AND (NEW.id IS NULL OR pc.id != NEW.id)
//           AND pc.status IN ('active', 'pending')
//           AND pc.start_date <= NEW.end_date
//           AND pc.end_date >= NEW.start_date;
//           
//         IF overlapping_count >= 10 THEN
//           RAISE EXCEPTION 'No available slots for this location in the selected period.';
//         END IF;
//       END IF;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION create_user_profile(text, text, text, text, text, text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.create_user_profile(p_email text, p_password text, p_name text, p_role text, p_phone text DEFAULT NULL::text, p_document text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_status text DEFAULT 'active'::text)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     new_user_id uuid;
//   BEGIN
//     IF NOT public.is_admin_or_pm() THEN
//       RAISE EXCEPTION 'Unauthorized';
//     END IF;
//   
//     SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;
//     
//     IF new_user_id IS NULL THEN
//       new_user_id := gen_random_uuid();
//       INSERT INTO auth.users (
//         id, instance_id, email, encrypted_password, email_confirmed_at,
//         created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
//         is_super_admin, role, aud,
//         confirmation_token, recovery_token, email_change_token_new,
//         email_change, email_change_token_current,
//         phone, phone_change, phone_change_token, reauthentication_token
//       ) VALUES (
//         new_user_id,
//         '00000000-0000-0000-0000-000000000000',
//         p_email,
//         crypt(p_password, gen_salt('bf')),
//         NOW(), NOW(), NOW(),
//         '{"provider": "email", "providers": ["email"]}',
//         json_build_object('name', p_name, 'role', p_role),
//         false, 'authenticated', 'authenticated',
//         '', '', '', '', '', NULL, '', '', ''
//       );
//     END IF;
//   
//     INSERT INTO public.profiles (id, email, name, role, phone, document, city, state, status)
//     VALUES (new_user_id, p_email, p_name, p_role, p_phone, p_document, p_city, p_state, p_status)
//     ON CONFLICT (id) DO UPDATE SET
//       name = EXCLUDED.name,
//       role = EXCLUDED.role,
//       phone = EXCLUDED.phone,
//       document = EXCLUDED.document,
//       city = EXCLUDED.city,
//       state = EXCLUDED.state,
//       status = EXCLUDED.status;
//   
//     RETURN new_user_id;
//   END;
//   $function$
//   
// FUNCTION handle_campaign_invoice()
//   CREATE OR REPLACE FUNCTION public.handle_campaign_invoice()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     adv_name text;
//     adv_email text;
//     inv_number text;
//     invoice_exists boolean;
//   BEGIN
//     -- Get advertiser name and email
//     SELECT name, billing_email INTO adv_name, adv_email FROM public.advertisers WHERE id = NEW.advertiser_id;
//     
//     -- Generate invoice number base
//     inv_number := 'PUB-' || to_char(NEW.created_at, 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
//   
//     IF TG_OP = 'INSERT' THEN
//       INSERT INTO public.invoices (
//         invoice_number, description, amount, status, date, to_name, to_email, type, from_name, booking_id
//       ) VALUES (
//         inv_number, 'Publicity Campaign: ' || NEW.title, NEW.total_amount, 'pending', NEW.created_at, adv_name, adv_email, 'publicity_sale', 'Platform Admin', NEW.id::text
//       );
//     ELSIF TG_OP = 'UPDATE' THEN
//       -- Check if it's a renewal: end_date changed and increased
//       IF NEW.end_date IS DISTINCT FROM OLD.end_date AND NEW.end_date > OLD.end_date THEN
//         -- Create renewal invoice
//         inv_number := 'PUB-REN-' || to_char(NOW(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
//         
//         -- Check idempotency: avoid creating duplicate invoice for the same campaign renewal on the same day
//         SELECT EXISTS (
//           SELECT 1 FROM public.invoices 
//           WHERE description = 'Publicity Campaign Renewal: ' || NEW.title 
//             AND date::date = NOW()::date
//             AND booking_id = NEW.id::text
//         ) INTO invoice_exists;
//   
//         IF NOT invoice_exists THEN
//           INSERT INTO public.invoices (
//             invoice_number, description, amount, status, date, to_name, to_email, type, from_name, booking_id
//           ) VALUES (
//             inv_number, 'Publicity Campaign Renewal: ' || NEW.title, NEW.total_amount, 'pending', NOW(), adv_name, adv_email, 'publicity_renewal', 'Platform Admin', NEW.id::text
//           );
//         END IF;
//       END IF;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'role', 'master'));
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION is_admin_or_pm()
//   CREATE OR REPLACE FUNCTION public.is_admin_or_pm()
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT EXISTS (
//       SELECT 1 FROM public.profiles 
//       WHERE id = auth.uid() AND role IN ('master', 'software_tenant', 'internal_user', 'platform_owner')
//     );
//   $function$
//   
// FUNCTION prevent_locked_invoice_update()
//   CREATE OR REPLACE FUNCTION public.prevent_locked_invoice_update()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF OLD.status IN ('finalized', 'issued', 'paid') THEN
//       -- If something other than status changed, block it to enforce immutability
//       IF (NEW.amount IS DISTINCT FROM OLD.amount) OR 
//          (NEW.items::text IS DISTINCT FROM OLD.items::text) OR 
//          (NEW.from_id IS DISTINCT FROM OLD.from_id) OR 
//          (NEW.to_id IS DISTINCT FROM OLD.to_id) OR
//          (NEW.due_date IS DISTINCT FROM OLD.due_date)
//       THEN
//         RAISE EXCEPTION 'Cannot modify locked invoice data (Traceability & Immutability policy).';
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION sync_room_type_price()
//   CREATE OR REPLACE FUNCTION public.sync_room_type_price()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.base_price IS DISTINCT FROM OLD.base_price THEN
//       UPDATE public.properties
//       SET listing_price = NEW.base_price
//       WHERE room_type_id = NEW.id;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_expired_campaigns()
//   CREATE OR REPLACE FUNCTION public.update_expired_campaigns()
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.publicity_campaigns
//     SET status = 'concluded'
//     WHERE status = 'active' AND end_date < NOW();
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: invoices
//   trg_prevent_locked_invoice_update: CREATE TRIGGER trg_prevent_locked_invoice_update BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION prevent_locked_invoice_update()
// Table: publicity_campaigns
//   trg_check_campaign_slot_limit: CREATE TRIGGER trg_check_campaign_slot_limit BEFORE INSERT OR UPDATE ON public.publicity_campaigns FOR EACH ROW EXECUTE FUNCTION check_campaign_slot_limit()
//   trg_create_campaign_invoice: CREATE TRIGGER trg_create_campaign_invoice AFTER INSERT OR UPDATE ON public.publicity_campaigns FOR EACH ROW EXECUTE FUNCTION handle_campaign_invoice()
// Table: room_types
//   on_room_type_price_update: CREATE TRIGGER on_room_type_price_update AFTER UPDATE ON public.room_types FOR EACH ROW EXECUTE FUNCTION sync_room_type_price()

// --- INDEXES ---
// Table: ui_translations
//   CREATE UNIQUE INDEX ui_translations_key_locale_key ON public.ui_translations USING btree (key, locale)

