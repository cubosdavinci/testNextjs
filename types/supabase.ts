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
    PostgrestVersion: "13.0.4"
  }
  gotit: {
    Tables: {
      google_linked_accounts: {
        Row: {
          access_token: string
          consent_expired: boolean | null
          created_at: string | null
          expires_at: string
          google_email: string
          google_sub: string
          id: string
          is_main: boolean
          refresh_token: string | null
          scopes: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          consent_expired?: boolean | null
          created_at?: string | null
          expires_at: string
          google_email: string
          google_sub: string
          id?: string
          is_main?: boolean
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          consent_expired?: boolean | null
          created_at?: string | null
          expires_at?: string
          google_email?: string
          google_sub?: string
          id?: string
          is_main?: boolean
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rpc_create_product: {
        Args: { p_files: Json; p_licenses: Json; p_product: Json }
        Returns: {
          product_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          oauth_token: string | null
          oauth_token_secret: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string | null
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId?: string | null
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: Json | null
          id: number
          level: number
          lft: number
          name: string
          parent_id: number | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          products_count: number
          rght: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          subcategories_count: number
          thumbnail_url: string | null
          tree_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: Json | null
          id?: number
          level?: number
          lft: number
          name: string
          parent_id?: number | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          products_count?: number
          rght: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          subcategories_count?: number
          thumbnail_url?: string | null
          tree_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: Json | null
          id?: number
          level?: number
          lft?: number
          name?: string
          parent_id?: number | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          products_count?: number
          rght?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          subcategories_count?: number
          thumbnail_url?: string | null
          tree_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_reservations: {
        Row: {
          coupon_id: string
          created_at: string | null
          currency: string
          expires_at: string
          id: string
          price: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          currency?: string
          expires_at: string
          id?: string
          price: number
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          currency?: string
          expires_at?: string
          id?: string
          price?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_reservations_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          max_redemptions: number | null
          plan_id: string | null
          product_id: string | null
          start_at: string | null
          updated_at: string | null
          used_count: number | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_redemptions?: number | null
          plan_id?: string | null
          product_id?: string | null
          start_at?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_redemptions?: number | null
          plan_id?: string | null
          product_id?: string | null
          start_at?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      external_file_cache: {
        Row: {
          created_at: string
          file_name: string
          id: string
          last_accessed_at: string
          last_synced_at: string | null
          mime_type: string
          provider: Database["public"]["Enums"]["storage_provider"]
          provider_etag: string | null
          provider_file_id: string
          provider_hash: string | null
          provider_md5: string | null
          raw_metadata: Json | null
          size_bytes: number
          storage_path: string
          storage_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          last_accessed_at?: string
          last_synced_at?: string | null
          mime_type: string
          provider?: Database["public"]["Enums"]["storage_provider"]
          provider_etag?: string | null
          provider_file_id: string
          provider_hash?: string | null
          provider_md5?: string | null
          raw_metadata?: Json | null
          size_bytes: number
          storage_path: string
          storage_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          last_accessed_at?: string
          last_synced_at?: string | null
          mime_type?: string
          provider?: Database["public"]["Enums"]["storage_provider"]
          provider_etag?: string | null
          provider_file_id?: string
          provider_hash?: string | null
          provider_md5?: string | null
          raw_metadata?: Json | null
          size_bytes?: number
          storage_path?: string
          storage_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      license_download_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          link_token: string
          order_license_id: string
          revoked: boolean
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          link_token: string
          order_license_id: string
          revoked?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          link_token?: string
          order_license_id?: string
          revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_license"
            columns: ["order_license_id"]
            isOneToOne: false
            referencedRelation: "order_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_types: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string | null
          end_date: string | null
          google_sub: string | null
          id: number
          last_updated: string | null
          metadata: Json | null
          saleor_user_email: string | null
          saleor_user_id: string
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          tier: Database["public"]["Enums"]["membership_tier_old"]
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          google_sub?: string | null
          id?: number
          last_updated?: string | null
          metadata?: Json | null
          saleor_user_email?: string | null
          saleor_user_id: string
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          tier: Database["public"]["Enums"]["membership_tier_old"]
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          google_sub?: string | null
          id?: number
          last_updated?: string | null
          metadata?: Json | null
          saleor_user_email?: string | null
          saleor_user_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          tier?: Database["public"]["Enums"]["membership_tier_old"]
        }
        Relationships: []
      }
      order_downloads: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          product_file_id: string
          signed_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          product_file_id: string
          signed_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          product_file_id?: string
          signed_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_licenses: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          license_key: string | null
          order_id: string
          product_license_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          license_key?: string | null
          order_id: string
          product_license_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          license_key?: string | null
          order_id?: string
          product_license_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_license"
            columns: ["product_license_id"]
            isOneToOne: false
            referencedRelation: "product_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_license"
            columns: ["product_license_id"]
            isOneToOne: false
            referencedRelation: "product_licenses_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          crypto_base_price: number | null
          crypto_currency: Database["public"]["Enums"]["crypto_currency"]
          crypto_fee: number | null
          crypto_network: Database["public"]["Enums"]["crypto_network"]
          crypto_price: number | null
          fiat_base_price: number | null
          fiat_currency: Database["public"]["Enums"]["fiat_currency"]
          fiat_fee: number | null
          fiat_payment_id: string | null
          fiat_payment_provider: string | null
          fiat_price: number | null
          id: string
          license_code: string
          license_id: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crypto_base_price?: number | null
          crypto_currency?: Database["public"]["Enums"]["crypto_currency"]
          crypto_fee?: number | null
          crypto_network?: Database["public"]["Enums"]["crypto_network"]
          crypto_price?: number | null
          fiat_base_price?: number | null
          fiat_currency?: Database["public"]["Enums"]["fiat_currency"]
          fiat_fee?: number | null
          fiat_payment_id?: string | null
          fiat_payment_provider?: string | null
          fiat_price?: number | null
          id?: string
          license_code: string
          license_id?: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crypto_base_price?: number | null
          crypto_currency?: Database["public"]["Enums"]["crypto_currency"]
          crypto_fee?: number | null
          crypto_network?: Database["public"]["Enums"]["crypto_network"]
          crypto_price?: number | null
          fiat_base_price?: number | null
          fiat_currency?: Database["public"]["Enums"]["fiat_currency"]
          fiat_fee?: number | null
          fiat_payment_id?: string | null
          fiat_payment_provider?: string | null
          fiat_price?: number | null
          id?: string
          license_code?: string
          license_id?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "product_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "product_licenses_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          interval: string
          name: string
          price: number
          provider: string | null
          provider_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          interval: string
          name: string
          price: number
          provider?: string | null
          provider_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          interval?: string
          name?: string
          price?: number
          provider?: string | null
          provider_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: number | null
          value_json: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: number | null
          value_json?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: number | null
          value_json?: Json | null
        }
        Relationships: []
      }
      product_3d_details: {
        Row: {
          animation_types: string[] | null
          compatible_software: string[] | null
          complexity: string | null
          file_size_mb: number | null
          geometry_type: string | null
          has_textures: boolean | null
          is_animated: boolean | null
          is_pbr: boolean | null
          is_rigged: boolean | null
          is_uv_unwrapped: boolean | null
          main_format: string | null
          poly_count: number | null
          product_id: string
          real_world_scale: boolean | null
          render_engines: string[] | null
          supported_formats: string[] | null
          texture_maps: string[] | null
          texture_resolution: string | null
          units: string | null
          vertex_count: number | null
        }
        Insert: {
          animation_types?: string[] | null
          compatible_software?: string[] | null
          complexity?: string | null
          file_size_mb?: number | null
          geometry_type?: string | null
          has_textures?: boolean | null
          is_animated?: boolean | null
          is_pbr?: boolean | null
          is_rigged?: boolean | null
          is_uv_unwrapped?: boolean | null
          main_format?: string | null
          poly_count?: number | null
          product_id: string
          real_world_scale?: boolean | null
          render_engines?: string[] | null
          supported_formats?: string[] | null
          texture_maps?: string[] | null
          texture_resolution?: string | null
          units?: string | null
          vertex_count?: number | null
        }
        Update: {
          animation_types?: string[] | null
          compatible_software?: string[] | null
          complexity?: string | null
          file_size_mb?: number | null
          geometry_type?: string | null
          has_textures?: boolean | null
          is_animated?: boolean | null
          is_pbr?: boolean | null
          is_rigged?: boolean | null
          is_uv_unwrapped?: boolean | null
          main_format?: string | null
          poly_count?: number | null
          product_id?: string
          real_world_scale?: boolean | null
          render_engines?: string[] | null
          supported_formats?: string[] | null
          texture_maps?: string[] | null
          texture_resolution?: string | null
          units?: string | null
          vertex_count?: number | null
        }
        Relationships: []
      }
      product_files: {
        Row: {
          created_at: string
          description: string | null
          file_cache_expires_at: string | null
          file_cache_id: string | null
          file_checksum: string | null
          file_hash: string | null
          file_id: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          linked_account_id: string
          product_id: string
          provider: Database["public"]["Enums"]["storage_provider"]
          provider_metadata: Json | null
          provider_user_name: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_cache_expires_at?: string | null
          file_cache_id?: string | null
          file_checksum?: string | null
          file_hash?: string | null
          file_id: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          linked_account_id: string
          product_id: string
          provider?: Database["public"]["Enums"]["storage_provider"]
          provider_metadata?: Json | null
          provider_user_name?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_cache_expires_at?: string | null
          file_cache_id?: string | null
          file_checksum?: string | null
          file_hash?: string | null
          file_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          linked_account_id?: string
          product_id?: string
          provider?: Database["public"]["Enums"]["storage_provider"]
          provider_metadata?: Json | null
          provider_user_name?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_files_file_cache_id_fkey"
            columns: ["file_cache_id"]
            isOneToOne: false
            referencedRelation: "external_file_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_licenses: {
        Row: {
          base_price_cents: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_main: boolean
          license_duration: Database["public"]["Enums"]["license_duration"]
          max_downloads: number | null
          max_license_users: number
          max_user_devices: number
          name: string
          product_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          license_duration?: Database["public"]["Enums"]["license_duration"]
          max_downloads?: number | null
          max_license_users?: number
          max_user_devices?: number
          name: string
          product_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          license_duration?: Database["public"]["Enums"]["license_duration"]
          max_downloads?: number | null
          max_license_users?: number
          max_user_devices?: number
          name?: string
          product_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_type_metadata: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          icon_url: string | null
          type: Database["public"]["Enums"]["product_type_old"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          icon_url?: string | null
          type: Database["public"]["Enums"]["product_type_old"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          icon_url?: string | null
          type?: Database["public"]["Enums"]["product_type_old"]
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: number
          category_name: string
          created_at: string | null
          creator_has_membership: boolean | null
          creator_id: string
          creator_is_banned: boolean | null
          creator_is_suspended: boolean | null
          description: string | null
          id: string
          is_active: boolean | null
          is_published: boolean
          label: string | null
          only_for_followers: boolean | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          tags: string[] | null
          thumbnail_url: string
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string | null
          user_tags: string[] | null
          version: string | null
        }
        Insert: {
          category_id?: number
          category_name?: string
          created_at?: string | null
          creator_has_membership?: boolean | null
          creator_id: string
          creator_is_banned?: boolean | null
          creator_is_suspended?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean
          label?: string | null
          only_for_followers?: boolean | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          thumbnail_url?: string
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
          user_tags?: string[] | null
          version?: string | null
        }
        Update: {
          category_id?: number
          category_name?: string
          created_at?: string | null
          creator_has_membership?: boolean | null
          creator_id?: string
          creator_is_banned?: boolean | null
          creator_is_suspended?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean
          label?: string | null
          only_for_followers?: boolean | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          thumbnail_url?: string
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
          user_tags?: string[] | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          banned_reason: string | null
          created_at: string
          creator_banned: boolean | null
          creator_suspended: boolean | null
          full_name: string | null
          id: string
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          modified_at: string
          role: Database["public"]["Enums"]["profile_role"]
          strikes: number | null
          suspension_expires_at: string | null
          suspension_reason: string | null
          username: string | null
          wallet_address: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string
          banned_reason?: string | null
          created_at?: string
          creator_banned?: boolean | null
          creator_suspended?: boolean | null
          full_name?: string | null
          id: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          modified_at?: string
          role?: Database["public"]["Enums"]["profile_role"]
          strikes?: number | null
          suspension_expires_at?: string | null
          suspension_reason?: string | null
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string
          banned_reason?: string | null
          created_at?: string
          creator_banned?: boolean | null
          creator_suspended?: boolean | null
          full_name?: string | null
          id?: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          modified_at?: string
          role?: Database["public"]["Enums"]["profile_role"]
          strikes?: number | null
          suspension_expires_at?: string | null
          suspension_reason?: string | null
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string | null
        }
        Insert: {
          expires: string
          id?: string
          sessionToken: string
          userId?: string | null
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string
          current_period_start: string
          discount_code: string | null
          id: string
          plan_id: string
          price_paid: number | null
          provider: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          discount_code?: string | null
          id?: string
          plan_id: string
          price_paid?: number | null
          provider?: string | null
          provider_subscription_id?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          discount_code?: string | null
          id?: string
          plan_id?: string
          price_paid?: number | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          creator_id: string | null
          id: string
          name: string
        }
        Insert: {
          creator_id?: string | null
          id?: string
          name: string
        }
        Update: {
          creator_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          provider: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          provider?: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          provider?: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          saleorid: string
        }
        Insert: {
          email: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          saleorid: string
        }
        Update: {
          email?: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          saleorid?: string
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          expires: string
          identifier: string | null
          token: string
        }
        Insert: {
          expires: string
          identifier?: string | null
          token: string
        }
        Update: {
          expires?: string
          identifier?: string | null
          token?: string
        }
        Relationships: []
      }
      wallet_nonces: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          message: string
          nonce: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          message: string
          nonce: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          message?: string
          nonce?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          chain_id: number
          created_at: string | null
          id: string
          is_active: boolean
          provider: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          chain_id: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          provider?: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          chain_id?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          provider?: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      web3_supported_networks: {
        Row: {
          chain_id: number
          created_at: string | null
          explorer_url: string
          icon_path: string
          is_active: boolean
          key: string
          name: string
          short_name: string
        }
        Insert: {
          chain_id: number
          created_at?: string | null
          explorer_url: string
          icon_path: string
          is_active?: boolean
          key: string
          name: string
          short_name: string
        }
        Update: {
          chain_id?: number
          created_at?: string | null
          explorer_url?: string
          icon_path?: string
          is_active?: boolean
          key?: string
          name?: string
          short_name?: string
        }
        Relationships: []
      }
      web3_supported_tokens: {
        Row: {
          chain_id: number
          created_at: string | null
          decimals: number
          explorer_url: string
          icon_path: string
          is_active: boolean
          name: string
          symbol: string
          token_address: string
        }
        Insert: {
          chain_id: number
          created_at?: string | null
          decimals: number
          explorer_url: string
          icon_path: string
          is_active?: boolean
          name: string
          symbol: string
          token_address: string
        }
        Update: {
          chain_id?: number
          created_at?: string | null
          decimals?: number
          explorer_url?: string
          icon_path?: string
          is_active?: boolean
          name?: string
          symbol?: string
          token_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_chain"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "web3_supported_networks"
            referencedColumns: ["chain_id"]
          },
        ]
      }
      web3_supported_wallet_providers: {
        Row: {
          created_at: string | null
          icon_path: string
          is_active: boolean
          name: string
          rdns: string
        }
        Insert: {
          created_at?: string | null
          icon_path: string
          is_active?: boolean
          name: string
          rdns: string
        }
        Update: {
          created_at?: string | null
          icon_path?: string
          is_active?: boolean
          name?: string
          rdns?: string
        }
        Relationships: []
      }
      web3_user_payment_methods: {
        Row: {
          chain_id: number
          created_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          label: string | null
          token_address: string
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Insert: {
          chain_id: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string | null
          token_address: string
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Update: {
          chain_id?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string | null
          token_address?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_supported_token"
            columns: ["chain_id", "token_address"]
            isOneToOne: false
            referencedRelation: "web3_supported_tokens"
            referencedColumns: ["chain_id", "token_address"]
          },
          {
            foreignKeyName: "fk_wallet_provider"
            columns: ["wallet_provider"]
            isOneToOne: false
            referencedRelation: "web3_supported_wallet_providers"
            referencedColumns: ["rdns"]
          },
        ]
      }
      web3_user_wallets: {
        Row: {
          chain_id: number
          created_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          token_address: string
          token_sym: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Insert: {
          chain_id: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          token_address: string
          token_sym?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_provider: string
        }
        Update: {
          chain_id?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          token_address?: string
          token_sym?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "web3_user_wallets_chain_addr_sym_fkey"
            columns: ["chain_id", "token_address", "token_sym"]
            isOneToOne: false
            referencedRelation: "web3_supported_tokens"
            referencedColumns: ["chain_id", "token_address", "symbol"]
          },
          {
            foreignKeyName: "web3_user_wallets_wallet_provider_fkey"
            columns: ["wallet_provider"]
            isOneToOne: false
            referencedRelation: "web3_supported_wallet_providers"
            referencedColumns: ["rdns"]
          },
        ]
      }
    }
    Views: {
      product_licenses_pricing: {
        Row: {
          base_price_cents: number | null
          created_at: string | null
          description: string | null
          final_price_cents: number | null
          id: string | null
          is_active: boolean | null
          license_duration:
            | Database["public"]["Enums"]["license_duration"]
            | null
          max_downloads: number | null
          max_license_users: number | null
          max_user_devices: number | null
          name: string | null
          product_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      web3_user_wallets_v: {
        Row: {
          chain_id: number | null
          created_at: string | null
          explorer_url: string | null
          icon_path: string | null
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          token_address: string | null
          token_dec: number | null
          token_name: string | null
          token_sym: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
          wallet_provider: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web3_user_wallets_wallet_provider_fkey"
            columns: ["wallet_provider"]
            isOneToOne: false
            referencedRelation: "web3_supported_wallet_providers"
            referencedColumns: ["rdns"]
          },
        ]
      }
    }
    Functions: {
      add_verified_wallet: {
        Args: {
          p_provider: Database["public"]["Enums"]["wallet_provider_enu"]
          p_user_id: string
          p_wallet_address: string
        }
        Returns: {
          created_at: string | null
          id: string
          is_active: boolean
          provider: Database["public"]["Enums"]["wallet_provider_enu"]
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        SetofOptions: {
          from: "*"
          to: "user_wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_membership_json: {
        Args: { p_fields: Json; p_saleor_user_id: string }
        Returns: Json
      }
      disconnect_provider: {
        Args: { p_provider: string; p_user_email: string }
        Returns: undefined
      }
      get_account: {
        Args: { p_provider: string; p_provider_account_id: string }
        Returns: Database["public"]["Tables"]["accounts"]["Row"]
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_connected_providers: {
        Args: { p_user_email: string }
        Returns: {
          provider: string
        }[]
      }
      get_membership_by_google_sub: {
        Args: { p_google_sub: string }
        Returns: Json
      }
      reserve_coupon: {
        Args: { coupon_code: string; input_user_id?: string }
        Returns: {
          coupon_id: string
          expires_at: string
          reservation_id: string
        }[]
      }
      rpc_create_external_file_cache: {
        Args: {
          p_file_name: string
          p_mime_type: string
          p_product_file_id: string
          p_provider: Database["public"]["Enums"]["storage_provider"]
          p_provider_file_id: string
          p_size_bytes: number
          p_storage_path: string
          p_storage_url: string
        }
        Returns: string
      }
      uid: { Args: never; Returns: string }
      update_membership_json: {
        Args: { p_fields: Json; p_saleor_user_id: string }
        Returns: {
          created_at: string
          end_date: string
          last_updated: string
          metadata: Json
          saleor_email: string
          saleor_user_id: string
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          tier: Database["public"]["Enums"]["membership_tier_old"]
        }[]
      }
      update_products_count_tree: {
        Args: { category_id: number; delta: number }
        Returns: undefined
      }
      update_session_provider: {
        Args: { p_provider: string; p_user_id: string }
        Returns: Database["public"]["Tables"]["sessions"]["Row"]
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      crypto_currency: "SOL" | "USDC"
      crypto_network: "solana"
      fiat_currency: "USD" | "EUR"
      license_duration:
        | "Forever"
        | "1 Year"
        | "2 Years"
        | "3 Years"
        | "4 Years"
        | "5 Years"
      membership_status: "active" | "paused" | "expired"
      membership_tier: "Free" | "Basic" | "Creator"
      membership_tier_old: "Basic" | "Personal" | "Business"
      payment_type: "fiat" | "crypto"
      product_status:
        | "Draft"
        | "Published"
        | "Unpublished"
        | "Temporarily Unavailable"
        | "Restricted"
        | "Archived"
      product_type:
        | "Image"
        | "Video"
        | "Music"
        | "Apps"
        | "Games"
        | "Courses"
        | "E-Books"
        | "A-Books"
        | "Icons"
        | "Vector"
        | "Templates"
        | "Fonts"
        | "3D"
        | "AR/VR"
        | "IoT"
        | "Technical"
        | "Other"
      product_type_old:
        | "general"
        | "3d"
        | "image"
        | "video"
        | "audio"
        | "ebooks"
      profile_role: "user" | "team" | "admin"
      storage_provider: "google_drive" | "onedrive" | "dropbox" | "box" | "s3"
      wallet_provider_enu:
        | "MetaMask"
        | "TrustWallet"
        | "CoinbaseWallet"
        | "Phantom"
        | "WalletConnect"
        | "Rabby"
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
  gotit: {
    Enums: {},
  },
  public: {
    Enums: {
      crypto_currency: ["SOL", "USDC"],
      crypto_network: ["solana"],
      fiat_currency: ["USD", "EUR"],
      license_duration: [
        "Forever",
        "1 Year",
        "2 Years",
        "3 Years",
        "4 Years",
        "5 Years",
      ],
      membership_status: ["active", "paused", "expired"],
      membership_tier: ["Free", "Basic", "Creator"],
      membership_tier_old: ["Basic", "Personal", "Business"],
      payment_type: ["fiat", "crypto"],
      product_status: [
        "Draft",
        "Published",
        "Unpublished",
        "Temporarily Unavailable",
        "Restricted",
        "Archived",
      ],
      product_type: [
        "Image",
        "Video",
        "Music",
        "Apps",
        "Games",
        "Courses",
        "E-Books",
        "A-Books",
        "Icons",
        "Vector",
        "Templates",
        "Fonts",
        "3D",
        "AR/VR",
        "IoT",
        "Technical",
        "Other",
      ],
      product_type_old: ["general", "3d", "image", "video", "audio", "ebooks"],
      profile_role: ["user", "team", "admin"],
      storage_provider: ["google_drive", "onedrive", "dropbox", "box", "s3"],
      wallet_provider_enu: [
        "MetaMask",
        "TrustWallet",
        "CoinbaseWallet",
        "Phantom",
        "WalletConnect",
        "Rabby",
      ],
    },
  },
} as const
