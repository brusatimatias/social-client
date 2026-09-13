import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { extractApiErrors } from '@/lib/errors'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { ErrorBanner } from '@/components/ErrorState'
import { Card } from '@/components/Card'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      await login(email, password)
      navigate('/feed', { replace: true })
    } catch (error) {
      setErrors(extractApiErrors(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Log in to see your feed.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {errors.length > 0 && <ErrorBanner messages={errors} />}
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
