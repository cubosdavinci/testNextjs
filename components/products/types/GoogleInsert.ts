Insert: {
    checksum ?: string | null
    created_at ?: string
    description ?: string | null
    file_cache_expires_at ?: string | null
    file_cache_id: string
    file_name: string
    file_size: number
    file_type: string
    hash ?: string | null
    id ?: string
    linked_account_id ?: string | null
    product_id: string
    provider ?: Database["public"]["Enums"]["storage_provider"]
    provider_metadata ?: Json | null
    provider_user_name ?: string | null
    sort_order ?: number | null
    updated_at ?: string
}

//Google Insert Type
file_id: string
file_name(added from metadata),
linked_account_id(added from metadata),
provider(added from db types)
provider_user_name(added from metadata),
provider_metadata(added from metadata),
file_name (added from metadata),
file_type (added from metadata),
file_size (added from metadata),
checksum ? (added from metadata),
hash ? (added from metadata),


file_id: string
file_name: string
file_size: number
file_type: string
linked_account_id: string
product_id: string

