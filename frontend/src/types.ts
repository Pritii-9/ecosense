export interface User {
  id: string
  name: string
  email: string
  email_verified: boolean
  total_points: number
  org_id?: string
  role?: string
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

export interface ForecastData {
  forecast_period_days: number
  daily_forecast_kg_co2: number[]
  total_forecast_kg_co2: number
  last_30_days_total_kg_co2: number
  avg_daily_kg_co2: number
  data_quality: 'sparse' | 'sufficient'
  days_with_data: number
  model_used: 'growth_fallback' | 'linear_regression'
}

export interface DepartmentImpact {
  department: string
  total_kg_recycled: number
  total_points: number
  log_count: number
}

export interface OrgImpactData {
  total_org_points: number
  total_org_kg_recycled: number
  department_breakdown: DepartmentImpact[]
}

export interface TeamMember extends User {
  rank: number
  department?: string
}

export interface TeamInviteResult {
  invited: string[]
  already_exists: string[]
  failed: { email: string; reason: string }[]
}

export interface PendingInvite {
  _id: string
  email: string
  org_id: string
  invited_by: string
  code: string
  status: string
  created_at: string
  expires_at: string
}
