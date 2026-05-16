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
      property_id: task.propertyId,
      property_name: task.propertyName,
      property_address: task.propertyAddress,
      type: task.type,
      priority: task.priority,
      status: task.status,
      approval_status: task.approvalStatus,
      date: task.date,
      assignee_id: task.assigneeId,
      partner_employee_id: task.partnerEmployeeId,
      assignee: task.assignee,
      pricing_model: task.pricingModel,
      price: task.price,
      labor_cost: task.laborCost,
      team_member_payout: task.teamMemberPayout,
      source: task.source,
      images: task.images || [],
    }
    const { error } = await supabase.from('tasks').insert(dbTask)
    if (!error) await fetchTasks()
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
