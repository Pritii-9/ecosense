import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ImpactData, ActivityFeedItem } from '../types'

export interface OrgLogData {
  total_org_points: number
  total_org_kg_recycled: number
  department?: string
  user_name?: string
}

interface UseSocketOptions {
  onNewActivity?: (activity: ActivityFeedItem) => void
  onImpactUpdate?: (impact: ImpactData) => void
  onLeaderboardUpdate?: () => void
  onNewOrgLog?: (data: OrgLogData) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [impactData, setImpactData] = useState<ImpactData | null>(null)
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])

  // Store callbacks in refs to avoid re-creating the socket on callback changes
  const onNewActivityRef = useRef(options.onNewActivity)
  const onImpactUpdateRef = useRef(options.onImpactUpdate)
  const onLeaderboardUpdateRef = useRef(options.onLeaderboardUpdate)
  const onNewOrgLogRef = useRef(options.onNewOrgLog)

  // Update refs when callbacks change
  useEffect(() => {
    onNewActivityRef.current = options.onNewActivity
    onImpactUpdateRef.current = options.onImpactUpdate
    onLeaderboardUpdateRef.current = options.onLeaderboardUpdate
    onNewOrgLogRef.current = options.onNewOrgLog
  }, [options.onNewActivity, options.onImpactUpdate, options.onLeaderboardUpdate, options.onNewOrgLog])

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
    const socket = io(apiBase, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected to server')
      setIsConnected(true)
      socket.emit('join_impact_room')
      socket.emit('request_impact_update')
      socket.emit('request_activity_feed')
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })

    socket.on('impact_update', (data: ImpactData) => {
      setImpactData(data)
      onImpactUpdateRef.current?.(data)
    })

    socket.on('activity_feed', (data: { feed: ActivityFeedItem[] }) => {
      setActivityFeed(data.feed)
    })

    socket.on('new_activity', (activity: ActivityFeedItem) => {
      setActivityFeed(prev => [activity, ...prev.slice(0, 19)])
      onNewActivityRef.current?.(activity)
    })

    socket.on('leaderboard_updated', () => {
      onLeaderboardUpdateRef.current?.()
    })

    // Real-time org sync - new org log event
    socket.on('new_org_log', (data: OrgLogData) => {
      onNewOrgLogRef.current?.(data)
    })

    return () => {
      socket.disconnect()
    }
  }, []) // Empty dependency array - socket is created once and never recreated

  const refetchImpact = useCallback(() => {
    socketRef.current?.emit('request_impact_update')
  }, [])

  const refetchFeed = useCallback(() => {
    socketRef.current?.emit('request_activity_feed')
  }, [])

  return {
    isConnected,
    impactData,
    activityFeed,
    refetchImpact,
    refetchFeed,
  }
}