import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import useAuthStore from '@/stores/useAuthStore'
import Landing from '@/pages/Landing'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import useLanguageStore from '@/stores/useLanguageStore'

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()
  const { properties } = usePropertyStore()
  const context = useContext(AppContext)
  const { t } = useLanguageStore()

  // Use optional chaining just in case
  const selectedPropertyId = context?.selectedPropertyId || 'all'
  const setSelectedPropertyId = context?.setSelectedPropertyId

  if (!isAuthenticated) {
    return <Landing />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-h-screen transition-all duration-300">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm z-10 sticky top-0">
          <SidebarTrigger />
          <div className="flex-1 flex justify-between items-center">
            {/* Property Selector for Global Filtering */}
            <div className="flex items-center gap-2 max-w-md w-full">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedPropertyId}
                onValueChange={(val) =>
                  setSelectedPropertyId && setSelectedPropertyId(val)
                }
              >
                <SelectTrigger className="w-[240px] border-none shadow-none focus:ring-0 bg-transparent hover:bg-muted/50 transition-colors">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Additional header items could go here */}
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-muted/10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
