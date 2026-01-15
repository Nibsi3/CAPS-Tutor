"use client"

import * as React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AuthForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/overview`,
            },
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Check your email for the magic link!")
        }
        setLoading(false)
    }

    return (
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-serif">Welcome to Emini</CardTitle>
                <CardDescription>
                    Enter your email to receive a magic link to sign in.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            className="bg-background border-border h-12"
                        />
                    </div>
                    <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue with Email
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="h-12 w-full text-base" disabled={loading} onClick={() => {
                    supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=/overview`,
                        }
                    })
                }}>
                    Google
                </Button>
            </CardContent>
        </Card>
    )
}
