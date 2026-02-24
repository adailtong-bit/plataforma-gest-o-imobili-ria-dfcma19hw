import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings'

export default function Settings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your system settings and subscription pricing.
        </p>
      </div>
      <SubscriptionSettings />
    </div>
  )
}
