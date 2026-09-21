export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      biography_sections: {
        Row: {
          id: number;
          subtitle: string | null;
          body_text: string;
          heading_level: 'large' | 'medium' | 'small';
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          subtitle?: string | null;
          body_text: string;
          heading_level?: 'large' | 'medium' | 'small';
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          subtitle?: string | null;
          body_text?: string;
          heading_level?: 'large' | 'medium' | 'small';
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      series: {
        Row: {
          id: number;
          title: string;
          slug: string;
          essay_text: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          slug: string;
          essay_text?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          slug?: string;
          essay_text?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      artworks: {
        Row: {
          id: number;
          series_id: number;
          title: string;
          year: string | null;
          technique: string;
          height_cm: number | null;
          width_cm: number | null;
          availability: Database['public']['Enums']['availability'];
          image_path: string | null;
          microstory: string | null;
          display_order: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          series_id: number;
          title?: string;
          year?: string | null;
          technique: string;
          height_cm?: number | null;
          width_cm?: number | null;
          availability?: Database['public']['Enums']['availability'];
          image_path?: string | null;
          microstory?: string | null;
          display_order?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          series_id?: number;
          title?: string;
          year?: string | null;
          technique?: string;
          height_cm?: number | null;
          width_cm?: number | null;
          availability?: Database['public']['Enums']['availability'];
          image_path?: string | null;
          microstory?: string | null;
          display_order?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: number;
          name: string;
          email: string;
          request_type: string;
          details: string;
          is_read: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          request_type: string;
          details: string;
          is_read?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          request_type?: string;
          details?: string;
          is_read?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      rate_limit_buckets: {
        Row: {
          scope: string;
          subject_hash: string;
          window_started_at: string;
          request_count: number;
        };
        Insert: {
          scope: string;
          subject_hash: string;
          window_started_at?: string;
          request_count?: number;
        };
        Update: {
          scope?: string;
          subject_hash?: string;
          window_started_at?: string;
          request_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_rate_limit: {
        Args: {
          p_scope: string;
          p_subject_hash: string;
          p_window_seconds: number;
          p_max_requests: number;
        };
        Returns: boolean;
      };
      reset_rate_limit: {
        Args: {
          p_scope: string;
          p_subject_hash: string;
        };
        Returns: undefined;
      };
      reorder_biography_sections: {
        Args: {
          p_ordered_ids: number[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
    };
    CompositeTypes: Record<string, never>;
  };
};
