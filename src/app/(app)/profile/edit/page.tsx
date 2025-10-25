'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(10, 'You must be at least 10 years old.').max(100),
  height: z.coerce.number().min(100, 'Height must be at least 100cm.').max(300),
  weight: z.coerce.number().min(30, 'Weight must be at least 30kg.').max(300),
  gender: z.enum(['Male', 'Female']),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits.'),
  aadhar: z.string().regex(/^\d{12}$/, 'Aadhar number must be 12 digits.'),
  otp: z.string().optional(),
  avatar: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { user, profile, setProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || '',
      age: profile?.age || 18,
      height: profile?.height || 170,
      weight: profile?.weight || 70,
      gender: profile?.gender || 'Male',
      phone: '',
      aadhar: '',
      otp: '',
      avatar: profile?.avatar || '',
    },
  });

  const handleSendOtp = async () => {
    const phone = form.getValues('phone');
    const aadhar = form.getValues('aadhar');
    if (!/^\d{10}$/.test(phone) || !/^\d{12}$/.test(aadhar)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid 10-digit phone number and 12-digit Aadhar number.',
      });
      return;
    }

    setVerifying(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setVerifying(false);
    setOtpSent(true);
    toast({
      title: 'OTP Sent',
      description: `An OTP has been sent to ${phone}.`,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        form.setValue('avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !profile || !firestore) return;
    setLoading(true);

    if (!otpSent) {
      toast({
        variant: 'destructive',
        title: 'Aadhar Not Verified',
        description: 'Please verify your Aadhar number before saving.',
      });
      setLoading(false);
      return;
    }

    const updatedProfileData = {
        ...profile,
        name: data.name,
        age: data.age,
        height: data.height,
        weight: data.weight,
        gender: data.gender,
        avatar: data.avatar || profile.avatar,
    };

    const userDocRef = doc(firestore, 'users', user.uid);
    
    updateDocumentNonBlocking(userDocRef, updatedProfileData);

    setProfile(updatedProfileData);
    
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });

    setLoading(false);
    router.push('/profile');
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Edit Profile</h1>
        <p className="text-muted-foreground">Keep your personal information up to date.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button asChild variant="outline">
                    <label htmlFor="avatar-upload">
                        <Upload className="mr-2 h-4 w-4" /> Change Picture
                    </label>
                </Button>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>This information will be displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Your age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Your height" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Your weight" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aadhar Verification</CardTitle>
              <CardDescription>Verify your identity to participate in challenges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aadhar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 12-digit Aadhar" {...field} disabled={otpSent} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 10-digit mobile number" {...field} disabled={otpSent} />
                    </FormControl>
                     <FormDescription>
                       An OTP will be sent to this number for verification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {otpSent && (
                 <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <Input placeholder="6-digit OTP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {!otpSent && (
                <Button type="button" onClick={handleSendOtp} disabled={verifying}>
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
