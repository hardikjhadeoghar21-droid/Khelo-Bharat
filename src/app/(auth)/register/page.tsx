import { AppLogo } from '@/components/app-logo';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      <AppLogo className="h-auto w-48" />
      <p className="text-xl font-semibold text-muted-foreground">Unleashing the Champion in You</p>
      
      <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Create an Account</CardTitle>
          <CardDescription>to start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
         <CardFooter className="flex justify-center text-sm">
          <p>Already have an account?&nbsp;</p>
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
