import { useEffect } from 'react'

/**
 * useRealtimeSync — Manually Triggered / Non-polling version
 * 
 * Disabled auto-polling because it was causing UI flickering/re-renders
 * during video playback.
 */
export function useRealtimeSync(table, onUpdate) {
  useEffect(() => {
    // We only run the update ONCE when the component loads
    // Auto-polling is disabled to prevent interrupting the user
    onUpdate();
  }, [table]);

  return null
}

export function useRealtimeMulti(tables, onUpdate) {
  useEffect(() => {
    onUpdate();
  }, [JSON.stringify(tables)]);

  return null
}
