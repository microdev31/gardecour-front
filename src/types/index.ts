/* ── GardeCoeur — Types TypeScript ──────────────────────────────────────── */

export type UserRole = 'PARENT' | 'RETIRED'
export type Availability = 'FULL' | 'PARTIAL' | 'WEEKEND'
export type GuardLocation = 'HOME' | 'RETIRED' | 'FLEXIBLE'
export type HomeType = 'HOUSE' | 'APARTMENT'
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'

export type ReportReason = 'INAPPROPRIATE' | 'FAKE_PROFILE' | 'HARASSMENT' | 'SPAM' | 'OTHER'

export interface User {
  id: number
  email: string
  role: UserRole
  is_verified: boolean
  terms_accepted_at: string | null
  created_at: string
}

export interface Review {
  id: number
  author: number
  author_name: string
  retired: number
  connection: number
  rating: number
  comment: string
  created_at: string
}

export interface TimeSlot {
  id: number
  day: number
  day_label: string
  start_time: string
  end_time: string
}

export interface Child {
  id: number
  first_name: string
  age: number
  character: string
  hobbies: string
  allergies: string
}

export interface Home {
  id: number
  type: HomeType
  has_garden: boolean
  has_park: boolean
  has_animals: boolean
  description: string
}

export interface ParentProfile {
  id: number
  first_name: string
  last_name: string
  city: string
  guard_needs: Availability
  guard_location: GuardLocation
  avatar: string | null
  children: Child[]
  home: Home | null
  created_at: string
}

export interface RetiredProfile {
  id: number
  first_name: string
  last_name: string
  age: number
  city: string
  bio: string
  experience: string
  hobbies: string
  activities: string
  availability: Availability
  guard_location: GuardLocation
  is_id_verified: boolean
  avatar: string | null
  home: Home | null
  distance: number | null
  lat: number | null
  lng: number | null
  avg_rating: number | null
  review_count: number
  created_at: string
}

export interface Connection {
  id: number
  parent: number
  retired: number
  status: ConnectionStatus
  initiator: number
  created_at: string
}

export interface Message {
  id: number
  sender: number
  sender_email: string
  content: string
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: number
  connection: number
  last_message: Message | null
  unread_count: number
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

/* ── Labels utilitaires ──────────────────────────────────────────────────── */

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  FULL:    'Plein temps',
  PARTIAL: 'Temps partiel',
  WEEKEND: 'Week-end',
}

export const GUARD_LOCATION_LABELS: Record<GuardLocation, string> = {
  HOME:     'Chez les parents',
  RETIRED:  'Chez le retraité',
  FLEXIBLE: 'Flexible',
}

export const HOME_TYPE_LABELS: Record<HomeType, string> = {
  HOUSE:     'Maison',
  APARTMENT: 'Appartement',
}
