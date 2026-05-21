import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

let globalVisits: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchVisits = async () => {
  const { data, error } = await supabase
    .from('visits')
    .select('*, properties(name)')
    .order('visit_date', { ascending: false })

  if (data && !error) {
    globalVisits = data.map((v) => ({
      id: v.id,
      propertyId: v.property_id,
      propertyName: v.properties?.name || 'Unknown',
      visitorName: v.visitor_name,
      visitorDocument: v.visitor_document,
      date: v.visit_date,
      purpose: v.purpose,
      status: v.status,
      notes: v.notes,
      taskId: v.task_id,
    }))
    notify()
  }
}

fetchVisits()

const useVisitStore = () => {
  const [visits, setVisits] = useState<any[]>(globalVisits)

  useEffect(() => {
    const l = () => setVisits(globalVisits)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addVisit = async (visit: any) => {
    try {
      let taskId = null

      // Auto-create associated task
      const taskPayload = {
        title: `Visit: ${visit.purpose} - ${visit.visitorName}`,
        type: 'visit',
        property_id: visit.propertyId || null,
        date: visit.date,
        status:
          visit.status === 'scheduled'
            ? 'pending'
            : visit.status === 'cancelled'
              ? 'cancelled'
              : 'completed',
        source: 'system',
      }

      const { data: taskData } = await supabase
        .from('tasks')
        .insert(taskPayload)
        .select()
        .single()

      if (taskData) taskId = taskData.id

      const { error } = await supabase.from('visits').insert({
        property_id: visit.propertyId || null,
        visitor_name: visit.visitorName,
        visitor_document: visit.visitorDocument || null,
        visit_date: visit.date,
        purpose: visit.purpose,
        status: visit.status,
        notes: visit.notes || null,
        task_id: taskId,
      })

      if (!error) {
        await fetchVisits()
        return { success: true }
      }
      throw error
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to create visit')
      return { success: false, error: err }
    }
  }

  const updateVisit = async (visit: any) => {
    try {
      const { data: oldVisit } = await supabase
        .from('visits')
        .select('task_id')
        .eq('id', visit.id)
        .single()

      const { error } = await supabase
        .from('visits')
        .update({
          property_id: visit.propertyId || null,
          visitor_name: visit.visitorName,
          visitor_document: visit.visitorDocument || null,
          visit_date: visit.date,
          purpose: visit.purpose,
          status: visit.status,
          notes: visit.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', visit.id)

      if (!error) {
        // Sync status to task if exists
        if (oldVisit?.task_id) {
          await supabase
            .from('tasks')
            .update({
              status:
                visit.status === 'scheduled'
                  ? 'pending'
                  : visit.status === 'cancelled'
                    ? 'cancelled'
                    : 'completed',
              date: visit.date,
            })
            .eq('id', oldVisit.task_id)
        }
        await fetchVisits()
        return { success: true }
      }
      throw error
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to update visit')
      return { success: false, error: err }
    }
  }

  const deleteVisit = async (id: string) => {
    try {
      const { data: visit } = await supabase
        .from('visits')
        .select('task_id')
        .eq('id', id)
        .single()

      if (visit?.task_id) {
        await supabase.from('tasks').delete().eq('id', visit.task_id)
      }

      const { error } = await supabase.from('visits').delete().eq('id', id)
      if (!error) {
        await fetchVisits()
        return { success: true }
      }
      throw error
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to delete visit')
      return { success: false, error: err }
    }
  }

  return {
    visits,
    addVisit,
    updateVisit,
    deleteVisit,
  }
}

export default useVisitStore
