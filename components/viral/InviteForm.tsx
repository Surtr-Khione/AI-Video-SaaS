'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mail, Plus, X } from 'lucide-react'

export function InviteForm() {
  const [emails, setEmails] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addEmailField = () => {
    setEmails([...emails, ''])
  }

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index))
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const validEmails = emails.filter(email => email.trim() && email.includes('@'))

    if (validEmails.length === 0) {
      setMessage('Please enter at least one valid email')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/referral/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: validEmails }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully sent ${data.invitesSent} invite(s)! You earned ${data.invitesSent * 10} credits.`)
        setEmails([''])
      } else {
        setMessage(data.error || 'Failed to send invites')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invite Friends
        </CardTitle>
        <CardDescription>
          Send email invitations to your friends and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@email.com"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                />
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmailField}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Email
          </Button>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invites'}
          </Button>

          {message && (
            <p className={`text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
