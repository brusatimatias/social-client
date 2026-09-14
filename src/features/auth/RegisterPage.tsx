import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { extractApiErrors } from '@/lib/errors'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { ErrorBanner } from '@/components/ErrorState'
import { Card } from '@/components/Card'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      await register(form)
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
        <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Join and start sharing.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {errors.length > 0 && <ErrorBanner messages={errors} />}
          <div className="grid grid-cols-2 gap-3">
            <Input id="name" label="Name" required value={form.name} onChange={update('name')} />
            <Input id="lastname" label="Last name" required value={form.lastname} onChange={update('lastname')} />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update('email')}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update('password')}
          />
          <Input
            id="password_confirmation"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
          />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}
