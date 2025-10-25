'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  const profileDetails = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email Address', value: user.email },
    { label: 'Role', value: profile.role, isBadge: true },
    ...(profile.role === 'athlete' ? [
        { label: 'Age', value: `${profile.age} years` },
        { label: 'Height', value: `${profile.height} cm` },
        { label: 'Weight', value: `${profile.weight} kg` },
        { label: 'Gender', value: profile.gender },
    ] : [])
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile/edit">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Profile</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileDetails.map(detail => detail.value && (
              <div key={detail.label}>
                <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
                 {detail.isBadge ? (
                  <Badge variant={profile.role === 'official' ? 'destructive' : 'secondary'} className="capitalize mt-1">
                    {detail.value}
                  </Badge>
                ) : (
                  <p className="text-lg font-semibold">{detail.value}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
