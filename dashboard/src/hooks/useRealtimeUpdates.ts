import { useState, useEffect, useCallback, useRef } from 'react'

interface RealtimeEvent {
  type: 'connected' | 'vault-updated' | 'decision-updated'
  payload?: { file: string }
}

interface RealtimeState {
  connected: boolean
  lastUpdate: Date | null
  lastEvent: RealtimeEvent | null
}

type EventHandler = (event: RealtimeEvent) => void

export function useRealtimeUpdates(onEvent?: EventHandler) {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    lastUpdate: null,
    lastEvent: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('[SSE] Connecting to /api/events...')
    const eventSource = new EventSource('/api/events')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('[SSE] Connected')
      setState(prev => ({ ...prev, connected: true }))
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent
        console.log('[SSE] Event:', data)

        setState(prev => ({
          ...prev,
          lastUpdate: new Date(),
          lastEvent: data,
        }))

        // Call the event handler if provided
        if (onEvent && data.type !== 'connected') {
          onEvent(data)
        }
      } catch (e) {
        console.error('[SSE] Failed to parse event:', e)
      }
    }

    eventSource.onerror = (error) => {
      console.error('[SSE] Error:', error)
      setState(prev => ({ ...prev, connected: false }))
      eventSource.close()

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('[SSE] Reconnecting...')
        connect()
      }, 3000)
    }
  }, [onEvent])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return state
}
