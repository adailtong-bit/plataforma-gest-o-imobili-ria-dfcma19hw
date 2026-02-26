import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-slate-900">404</h1>
      <p className="text-muted-foreground mb-8">Page not found.</p>
      <Button asChild className="bg-trust-blue text-white">
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
