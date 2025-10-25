'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Palette, Shield, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme, isMounted]);

  const handleThemeChange = (isDarkMode: boolean) => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }

  if (!isMounted) {
    return null; // or a skeleton loader
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable a darker color scheme for the app.
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose how you want to be notified (UI only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts on your device.
              </p>
            </div>
            <Switch id="push-notifications" defaultChecked />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get occasional updates and summaries via email.
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Manage your account settings and personal data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
             <div>
                <h3 className="font-semibold">Edit Profile</h3>
                <p className="text-sm text-muted-foreground">Update your name, age, and other personal details.</p>
             </div>
             <Button asChild variant="outline">
                <Link href="/profile/edit">
                    <User className="mr-2 h-4 w-4" /> Edit
                </Link>
             </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
             <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
             </div>
             <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
