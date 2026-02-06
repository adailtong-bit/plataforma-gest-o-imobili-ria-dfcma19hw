import { TutorialModule } from './types'

export const tutorialModules: TutorialModule[] = [
  {
    key: 'dashboard-overview',
    title: 'Dashboard Overview & Metrics',
    description:
      'Learn how to navigate the dashboard, interpret key performance indicators (KPIs), and monitor your portfolio health.',
    category: 'System',
    videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ',
  },
  {
    key: 'properties-management',
    title: 'Property Management',
    description:
      'Comprehensive guide to listing properties, managing units, setting up amenities, and tracking inventory.',
    category: 'Operational',
    videoUrl: 'https://www.youtube.com/embed/EngW7tLk6R8',
  },
  {
    key: 'leads-crm',
    title: 'Leads & CRM Strategy',
    description:
      'Master customer relationship management, track leads from different sources, and manage conversion pipelines.',
    category: 'CRM',
    videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
  },
  {
    key: 'financial-invoices',
    title: 'Financials & Invoicing',
    description:
      'How to generate invoices, track payments, manage owners statements, and handle expense reconciliation.',
    category: 'Financial',
    videoUrl: 'https://www.youtube.com/embed/YE7VzlLtp-4',
  },
  {
    key: 'system-settings',
    title: 'System Configuration',
    description:
      'Setting up user roles, permissions, automation rules, and global platform preferences.',
    category: 'Settings',
    videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
  },
  {
    key: 'maintenance-workflows',
    title: 'Maintenance Workflows',
    description:
      'Automating maintenance requests, assigning tasks to partners, and tracking completion evidence.',
    category: 'Operational',
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
  },
]
