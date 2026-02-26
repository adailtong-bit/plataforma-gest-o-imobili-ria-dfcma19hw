import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = () => {
    login('admin@corepm.com')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">Sign in to your account.</p>
          <Button onClick={handleLogin}>Log In as Admin</Button>
        </CardContent>
      </Card>
    </div>
  )
}
