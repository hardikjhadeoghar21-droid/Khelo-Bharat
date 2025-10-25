'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { BarChart3, Trophy, User as UserIcon, Shield, Settings, Users, ListVideo } from 'lucide-react';
import { HomeIcon } from '@/components/icons/home-icon';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/use-auth';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user || !profile) {
    return null; // Or a loading spinner, but auth provider handles this
  }

  const athleteNavItems = [
    { href: '/dashboard', icon: HomeIcon, label: 'Home' },
    { href: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { href: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const officialNavItems = [
      { href: '/dashboard', icon: HomeIcon, label: 'Home' },
      { href: '/submissions', icon: ListVideo, label: 'Submissions'},
      { href: '/leaderboard', icon: Users, label: 'Athletes' },
      { href: '/profile', icon: Settings, label: 'Profile' },
  ]

  const navItems = profile.role === 'athlete' ? athleteNavItems : officialNavItems;
  const desktopNavItems = profile.role === 'athlete' ? athleteNavItems : officialNavItems;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:h-16 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <AppLogo className="h-auto w-full" />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {desktopNavItems.map((item) => (
                 <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b bg-muted/40 px-4 lg:h-16 lg:px-6">
           <div className="md:hidden">
              <AppLogo className="w-32" />
           </div>
           <div className="flex-1 md:hidden" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
           {children}
        </main>
        
        {profile.role === 'athlete' && (
          <nav className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm md:hidden">
            <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center justify-around">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary',
                    pathname === item.href && 'text-primary'
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
