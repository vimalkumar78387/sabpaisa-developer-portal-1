'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CommandMenu } from '@/components/command-menu';
import ThemeControls from './theme-controls';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import useSWR, { mutate } from 'swr';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  LogOut,
  Menu,
  PlugZap,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  Layers,
  User as UserIcon,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type NavLink = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

type NavigationItem = {
  label: string;
  columns?: { title: string; items: NavLink[] }[];
  href?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: 'Solutions',
    columns: [
      {
        title: 'Payment flows',
        items: [
          {
            title: 'Payment Gateway',
            href: '/docs/payment-gateway',
            description: 'Unified checkout orchestrating UPI, cards, and mandates.',
            icon: CreditCard,
          },
          {
            title: 'E-NACH Mandates',
            href: '/docs/e-nach',
            description: 'Automate recurring mandate creation and lifecycle events.',
            icon: Workflow,
          },
          {
            title: 'Payment Links',
            href: '/docs/payment-link',
            description: 'Spin up branded payment links on-demand for instant collection.',
            icon: PlugZap,
          },
        ],
      },
      {
        title: 'Operations & trust',
        items: [
          {
            title: 'B2B E-Collect',
            href: '/docs/b2b-e-collect',
            description: 'Streamline enterprise reconciliations and settlements.',
            icon: Layers,
          },
          {
            title: 'Security & Compliance',
            href: '/docs/security',
            description: 'Ship PCI DSS, token vaulting, and risk controls by default.',
            icon: Shield,
          },
          {
            title: 'Webhooks & IPN',
            href: '/docs/webhooks',
            description: 'Subscribe to granular payment and risk events in real-time.',
            icon: Activity,
          },
        ],
      },
    ],
  },
  {
    label: 'Docs',
    href: '/docs',
    description: 'Guides, API reference, and SDK playbooks.',
    icon: BookOpen,
  },
  {
    label: 'Playground',
    href: '/playground',
    description: 'Craft test requests and share them with your team.',
    icon: Terminal,
    badge: 'Live',
  },
  {
    label: 'Community',
    href: '/community',
    description: 'Forums, support tickets, and best practice exchanges.',
    icon: Users,
  },
  {
    label: 'Changelog',
    href: '/changelog',
    description: 'See what shipped in the latest platform drops.',
    icon: Sparkles,
  },
];

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="rounded-full border border-border/60 px-4">
          <Link href="https://partner.sabpaisa.in/" target="_blank" rel="noreferrer">
            Sign in
          </Link>
        </Button>
        <Button asChild className="rounded-full px-4 shadow-primary/20">
          <Link href="https://sabpaisa.in/pricing/" target="_blank" rel="noreferrer">
            Create account
          </Link>
        </Button>
      </div>
    );
  }

  const initials = (user.name || user.email || 'SP')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full border border-border/60 bg-background/80 p-0 shadow-sm transition hover:border-primary/40"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/60 p-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{user.name || user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-md px-3 py-2">
          <Link href="/profile" className="flex w-full items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Profile settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="w-full">
            <DropdownMenuItem className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-1">
        {navigationItems.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.columns ? (
              <>
                <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent className="overflow-hidden rounded-2xl border-border/60 bg-background/95 shadow-xl">
                  <div className="grid gap-6 p-6 md:w-[520px] lg:w-[640px] lg:grid-cols-2">
                    {item.columns.map((column) => (
                      <div key={column.title} className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {column.title}
                        </p>
                        <div className="space-y-2">
                          {column.items.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.startsWith(link.href);
                            return (
                              <Link
                                key={link.title}
                                href={link.href}
                                className="group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-primary/20 hover:bg-primary/5"
                              >
                                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-primary shadow-sm group-hover:border-primary/30 group-hover:bg-primary/10">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="flex-1">
                                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                                    {link.title}
                                    {isActive && (
                                      <ArrowUpRight className="h-3 w-3 text-primary" />
                                    )}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {link.description}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link href={item.href!} className={cn(pathname.startsWith(item.href!) && 'border-primary/50 text-primary')}>
                  <span className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {item.badge && (
                      <Badge variant="outline" className="ml-1 border-primary/40 bg-primary/10 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuIndicator className="mt-1" />
    </NavigationMenu>
  );
}

function MobileNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {navigationItems.map((item) => (
        <div key={item.label} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            {item.badge && (
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] uppercase tracking-wide text-primary">
                {item.badge}
              </Badge>
            )}
          </div>
          {item.columns ? (
            <div className="grid gap-2">
              {item.columns.flatMap((column) =>
                column.items.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      onClick={onNavigate}
                      className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/40 px-3 py-3 transition hover:border-primary/30 hover:bg-primary/10"
                    >
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="text-sm font-semibold text-foreground">{link.title}</span>
                        <span className="block text-sm text-muted-foreground">{link.description}</span>
                      </span>
                    </Link>
                  );
                }),
              )}
            </div>
          ) : (
            <Link
              href={item.href!}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-full border border-border/50 bg-background/80 px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/10"
            >
              {item.icon && <item.icon className="h-4 w-4 text-primary" />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-md',
        isScrolled
          ? 'border-border/30 bg-background/50 supports-[backdrop-filter]:bg-background/30'
          : 'border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 -ml-2">
            <Link href="/" className="flex items-center gap-2 text-left">
              <img
                src="https://settlepaisa.sabpaisa.in/img/logo/logo-dark-full.png"
                alt="SabPaisa Logo"
                className="h-7 w-auto"
              />
              <span className="glow-badge inline-flex h-7 items-center rounded-md px-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-900 dark:text-slate-100">
                Developers
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CommandMenu />
            <div className="hidden sm:block">
              <ThemeControls />
            </div>
            <Suspense fallback={<div className="h-9 w-9" />}>
              <UserMenu />
            </Suspense>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] border-r border-border/60 bg-background/95">
                <div className="mt-6 space-y-6">
                  <MobileNavigation onNavigate={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="hidden items-center justify-between md:flex">
          <DesktopNavigation pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
