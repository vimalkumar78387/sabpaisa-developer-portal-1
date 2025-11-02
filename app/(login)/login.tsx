'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

const highlights = [
  {
    title: 'Production parity sandbox',
    description: 'Test every payment method against live-like endpoints and payloads.',
    icon: ShieldCheck,
  },
  {
    title: 'Guided onboarding',
    description: 'Step-by-step integration playbooks and SDK scaffolds for each stack.',
    icon: Sparkles,
  },
  {
    title: 'Operational visibility',
    description: 'Monitor mandates, payouts, and webhooks with developer-grade dashboards.',
    icon: Zap,
  },
];

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-slate-900 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-14">
          <div className="space-y-8">
            <Badge variant="outline" className="border-white/30 bg-white/10 text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </Badge>
            <div className="space-y-4">
              <h2 className="max-w-xl text-4xl font-semibold leading-tight">
                Build secure payment experiences in days, not weeks.
              </h2>
              <p className="max-w-md text-sm text-white/75">
                Access sandbox credentials, documentation, and dashboards from a single, developer-first workspace.
              </p>
            </div>
            <div className="space-y-5">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-semibold text-white">{item.title}</span>
                      <span className="block text-xs text-white/70">{item.description}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-white/70">
            Need help getting started?{' '}
            <Link href="/docs/getting-started" className="font-semibold text-white underline-offset-4 hover:underline">
              Read the onboarding guide
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-8">
        <Card className="w-full max-w-md border border-border/60 shadow-xl">
          <CardHeader className="space-y-6 text-center">
            <Badge variant="outline" className="mx-auto w-fit rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              SabPaisa Developers
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold">
                {mode === 'signin' ? 'Sign in to continue' : 'Create your developer account'}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {mode === 'signin'
                  ? 'Access your sandbox, API keys, and project dashboards.'
                  : 'Provision sandbox credentials and invite your team in minutes.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              <input type="hidden" name="priceId" value={priceId || ''} />
              <input type="hidden" name="inviteId" value={inviteId || ''} />

              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="h-11 rounded-xl border border-border/60 bg-background/80 px-4"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  defaultValue={state.password}
                  required
                  minLength={8}
                  maxLength={100}
                  className="h-11 rounded-xl border border-border/60 bg-background/80 px-4"
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Create a strong password'}
                />
              </div>

              {state?.error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-xl py-3 text-base"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing you in…' : 'Creating account…'}
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-center text-sm text-muted-foreground">
              <p>
                {mode === 'signin' ? 'New to SabPaisa?' : 'Already registered?'}{' '}
                <Link
                  href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                    redirect ? `?redirect=${redirect}` : ''
                  }${priceId ? `${redirect ? '&' : '?'}priceId=${priceId}` : ''}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {mode === 'signin' ? 'Create a developer account' : 'Sign in instead'}
                </Link>
              </p>
              <p>
                <Link href="/docs/security" className="hover:text-foreground">
                  Learn how we secure accounts
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
