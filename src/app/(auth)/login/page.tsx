'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Clemhub</CardTitle>
        <CardDescription>Connecte-toi à ton portail</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await login(formData)
              if (result?.error) setError(result.error)
            })
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Connexion...' : 'Se connecter'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Pas de compte ?{' '}
            <Link href="/register" className="underline">Créer un compte</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}