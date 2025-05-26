import { createClient } from "@supabase/supabase-js"

// Types for our database
export type Database = {
  public: {
    tables: {
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          name: string
          url: string
          description: string | null
          is_default: boolean
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          url: string
          description?: string | null
          is_default?: boolean
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          url?: string
          description?: string | null
          is_default?: boolean
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ping_history: {
        Row: {
          id: string
          project_id: string
          status: boolean
          response_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          status: boolean
          response_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          status?: boolean
          response_time?: number | null
          created_at?: string
        }
      }
    }
  }
}

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton pattern for the client-side Supabase client
let clientSingleton: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (clientSingleton) return clientSingleton

  clientSingleton = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return clientSingleton
}

// Server-side client with service role for admin operations
export function createServerSupabaseClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
