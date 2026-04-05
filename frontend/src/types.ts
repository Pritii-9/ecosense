export interface User {
  id: string
  name: string
  email: string
  email_verified: boolean
  total_points: number
}

export interface WasteLog {
  id: string
  user_id: string
  type: string
  quantity: number
  points: number
  date: string
  created_at: string | null
}

export interface PointsResponse {
  total_points: number
  recent_logs: WasteLog[]
  waste_breakdown: {
    type: string
    quantity: number
    points: number
  }[]
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  email: string
  total_points: number
}

export interface RecyclingCenter {
  name: string
  address: string
  lat: number
  lng: number
  distance_km: number | null
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ApiMessageResponse {
  message: string
  email?: string
}

export interface ImpactStats {
  total_quantity: number
  total_points: number
  total_co2_saved_kg: number
  trees_saved_equivalent: number
  log_count: number
}

export interface TypeBreakdown {
  [key: string]: {
    quantity: number
    points: number
    co2_saved_kg: number
  }
}

export interface ImpactData {
  today: ImpactStats
  this_week: ImpactStats
  this_month: ImpactStats
  all_time: ImpactStats
  active_recyclers_24h: number
  total_users: number
  type_breakdown: TypeBreakdown
}

export interface ActivityFeedItem {
  user_name: string
  type: string
  quantity: number
  points: number
  time_ago: string
}

export interface ActivityFeedResponse {
  feed: ActivityFeedItem[]
}
