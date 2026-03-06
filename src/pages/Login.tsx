import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { User, Shield, Building, Home, Briefcase } from 'lucide-react'

export default function Login() {
  const { login, allUsers } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (email: string) => {
    login(email)
    navigate('/')
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'super_admin':
        return <Shield className="h-5 w-5 text-primary shrink-0" />
      case 'owner':
        return <Building className="h-5 w-5 text-blue-500 shrink-0" />
      case 'tenant':
        return <Home className="h-5 w-5 text-green-500 shrink-0" />
      case 'partner':
      case 'service':
        return <Briefcase className="h-5 w-5 text-orange-500 shrink-0" />
      default:
        return <User className="h-5 w-5 text-slate-500 shrink-0" />
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            COREPM
          </CardTitle>
          <CardDescription>Select an account to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          {allUsers && allUsers.length > 0 ? (
            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {allUsers.map((user: any, index: number) => {
                // Ensure unique key by combining id/email with index.
                // This specifically resolves the runtime error:
                // "Encountered two children with the same key, `owner1`"
                const uniqueKey = user.id
                  ? `${user.id}-${index}`
                  : `user-${index}`

                return (
                  <Button
                    key={uniqueKey}
                    variant="outline"
                    className="w-full h-auto py-3 px-4 justify-start items-center hover:bg-slate-100 transition-colors gap-3"
                    onClick={() => handleLogin(user.email)}
                  >
                    {getRoleIcon(user.role)}
                    <div className="flex flex-col items-start text-left overflow-hidden flex-1">
                      <span className="font-medium text-sm truncate w-full">
                        {user.name || user.email}
                      </span>
                      <span className="text-xs text-slate-500 font-normal capitalize">
                        {user.role ? user.role.replace('_', ' ') : 'User'}
                      </span>
                    </div>
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => handleLogin('admin@corepm.com')}
                className="w-full h-11"
              >
                Log In as Admin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
