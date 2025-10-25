'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useEffect, 
  useCallback 
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFirebase, useUser, useFirestore, useAuthContext } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase';
import { SplashScreen } from '@/components/splash-screen';

export type UserRole = 'athlete' | 'official';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'Male' | 'Female';
};

interface AuthContextType {
  user: FirebaseUser | null; // Firebase user object
  profile: UserProfile | null; // Firestore user profile
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuthContext();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/register'];

  useEffect(() => {
    const handleAuthChange = async () => {
      if (user) {
        // User is logged in, fetch their profile
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Profile doesn't exist, maybe logout or handle case
          console.log("No such user profile!");
          setProfile(null);
        }
        if (publicRoutes.includes(pathname)) {
          router.replace('/dashboard');
        }
      } else {
        // User is not logged in
        setProfile(null);
        if (!publicRoutes.includes(pathname)) {
          router.replace('/login');
        }
      }
      setLoading(false);
    };

    if (!isUserLoading) {
      handleAuthChange();
    }
  }, [user, isUserLoading, router, pathname, firestore]);


  const login = useCallback(async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password).then(() => {
      // onAuthStateChanged will handle the rest
    });
  }, [auth]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    const isOfficial = email.endsWith('@gov.in');
    const userRole: UserRole = isOfficial ? 'official' : 'athlete';

    const userProfile: UserProfile = {
      id: newUser.uid,
      name,
      email,
      role: userRole,
      avatar: `https://picsum.photos/seed/${newUser.uid}/200/200`,
      ...(userRole === 'athlete' && {
        age: 18,
        height: 170,
        weight: 70,
        gender: 'Male',
      })
    };
    
    const userDocRef = doc(firestore, 'users', newUser.uid);
    setDocumentNonBlocking(userDocRef, userProfile, { merge: false });
    // onAuthStateChanged will handle the rest
  }, [auth, firestore]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    router.replace('/login');
  }, [auth, router]);

  const value = { user, profile, loading, login, register, logout, setProfile };

  if (loading || isUserLoading) {
    return <SplashScreen />;
  }

  // Prevent rendering children on public pages if user is not yet determined
  if (!user && !publicRoutes.includes(pathname)) {
     return <SplashScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
