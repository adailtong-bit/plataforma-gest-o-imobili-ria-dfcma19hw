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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
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
            foreignKeyName: 'conversation_participants_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_participants_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
      ledger_entries: {
        Row: {
          amount: number
          category: string | null
          cost_type: string | null
          created_at: string
          date: string
          description: string
          id: string
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
          is_recurring?: boolean | null
          property_id?: string | null
          recurrence_frequency?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ledger_entries_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
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
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          pm_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          pm_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          pm_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_pm_id_fkey'
            columns: ['pm_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          state?: string | null
          status?: string | null
          tower_id?: string | null
          type?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'properties_agent_id_fkey'
            columns: ['agent_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_hotel_id_fkey'
            columns: ['hotel_id']
            isOneToOne: false
            referencedRelation: 'hotels'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_pm_id_fkey'
            columns: ['pm_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_tower_id_fkey'
            columns: ['tower_id']
            isOneToOne: false
            referencedRelation: 'towers'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          approval_status: string | null
          assignee: string | null
          assignee_id: string | null
          created_at: string
          date: string | null
          id: string
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
          date?: string | null
          id?: string
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
          date?: string | null
          id?: string
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
            foreignKeyName: 'tasks_assignee_id_fkey'
            columns: ['assignee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
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
            foreignKeyName: 'towers_hotel_id_fkey'
            columns: ['hotel_id']
            isOneToOne: false
            referencedRelation: 'hotels'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_or_pm: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: conversation_participants
//   conversation_id: uuid (not null)
//   profile_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: conversations
//   id: uuid (not null, default: gen_random_uuid())
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: towers
//   id: uuid (not null, default: gen_random_uuid())
//   hotel_id: uuid (not null)
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: conversation_participants
//   FOREIGN KEY conversation_participants_conversation_id_fkey: FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
//   PRIMARY KEY conversation_participants_pkey: PRIMARY KEY (conversation_id, profile_id)
//   FOREIGN KEY conversation_participants_profile_id_fkey: FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: conversations
//   PRIMARY KEY conversations_pkey: PRIMARY KEY (id)
// Table: hotels
//   PRIMARY KEY hotels_pkey: PRIMARY KEY (id)
// Table: ledger_entries
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
//   FOREIGN KEY properties_tower_id_fkey: FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE SET NULL
// Table: tasks
//   FOREIGN KEY tasks_assignee_id_fkey: FOREIGN KEY (assignee_id) REFERENCES profiles(id)
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tasks_property_id_fkey: FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
// Table: towers
//   FOREIGN KEY towers_hotel_id_fkey: FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
//   PRIMARY KEY towers_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: conversation_participants
//   Policy "Participants can view their participations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((profile_id = auth.uid()) OR (conversation_id IN ( SELECT conversation_participants_1.conversation_id    FROM conversation_participants conversation_participants_1   WHERE (conversation_participants_1.profile_id = auth.uid()))) OR is_admin_or_pm())
//   Policy "Users can add participants" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
// Table: conversations
//   Policy "Users can insert conversations" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "conversations_select_all" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: hotels
//   Policy "hotels_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "hotels_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "hotels_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//   Policy "hotels_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: ledger_entries
//   Policy "ledger_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "ledger_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "ledger_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR is_admin_or_pm())
//   Policy "ledger_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: messages
//   Policy "Participants can insert messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((sender_id = auth.uid()) AND ((conversation_id IN ( SELECT conversation_participants.conversation_id    FROM conversation_participants   WHERE (conversation_participants.profile_id = auth.uid()))) OR is_admin_or_pm()))
//   Policy "Participants can view messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((conversation_id IN ( SELECT conversation_participants.conversation_id    FROM conversation_participants   WHERE (conversation_participants.profile_id = auth.uid()))) OR is_admin_or_pm())
// Table: profiles
//   Policy "profiles_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "profiles_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "profiles_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "profiles_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: properties
//   Policy "properties_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "properties_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_admin_or_pm()
//   Policy "properties_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR (agent_id = auth.uid()) OR is_admin_or_pm())
//   Policy "properties_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((owner_id = auth.uid()) OR (agent_id = auth.uid()) OR is_admin_or_pm())
// Table: tasks
//   Policy "tasks_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tasks_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "tasks_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((property_id IN ( SELECT properties.id    FROM properties   WHERE ((properties.owner_id = auth.uid()) OR (properties.agent_id = auth.uid())))) OR (assignee_id = auth.uid()) OR is_admin_or_pm())
//   Policy "tasks_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: towers
//   Policy "towers_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "towers_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "towers_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin_or_pm()
//   Policy "towers_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
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
