import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

let globalTasks: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchTasks = async () => {
  const { data } = await supabase.from('tasks').select('*')
  if (data) {
    globalTasks = data.map((t) => ({
      id: t.id,
      title: t.title,
      propertyId: t.property_id,
      propertyName: t.property_name,
      propertyAddress: t.property_address,
      type: t.type,
      priority: t.priority,
      status: t.status,
      approvalStatus: t.approval_status,
      date: t.date,
      assigneeId: t.assignee_id,
      partnerEmployeeId: t.partner_employee_id,
      assignee: t.assignee,
      pricingModel: t.pricing_model,
      price: t.price,
      laborCost: t.labor_cost,
      teamMemberPayout: t.team_member_payout,
      source: t.source,
      images: t.images || [],
    }))
    notify()
  }
}

fetchTasks()

const useTaskStore = () => {
  const [tasks, setTasks] = useState<any[]>(globalTasks)

  useEffect(() => {
    const l = () => setTasks(globalTasks)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addTask = async (task: any) => {
    const dbTask = {
      title: task.title,
      property_id: task.propertyId || null,
      property_name: task.propertyName || null,
      property_address: task.propertyAddress || null,
      type: task.type || null,
      priority: task.priority || null,
      status: task.status || 'pending',
      approval_status: task.approvalStatus || null,
      date: task.date || null,
      assignee_id: task.assigneeId || null,
      partner_employee_id: task.partnerEmployeeId || null,
      assignee: task.assignee || null,
      pricing_model: task.pricingModel || null,
      price: task.price || 0,
      labor_cost: task.laborCost || 0,
      team_member_payout: task.teamMemberPayout || 0,
      source: task.source || 'manual',
      images: task.images || [],
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert(dbTask)
      .select()
      .single()
    if (!error) {
      await fetchTasks()
      return { success: true, data }
    } else {
      console.error('Error adding task:', error)
      return { success: false, error }
    }
  }
  const updateTask = async (task: any) => {
    const dbTask = {
      status: task.status,
      approval_status: task.approvalStatus,
    }
    const { error } = await supabase
      .from('tasks')
      .update(dbTask)
      .eq('id', task.id)
    if (!error) await fetchTasks()
  }
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) await fetchTasks()
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus: updateTask,
    approveTask: updateTask,
    rejectTask: updateTask,
    addTaskImage: () => {},
    addTaskEvidence: () => {},
  }
}

export default useTaskStore
