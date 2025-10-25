import { AppLogo } from './app-logo';

export function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FF9933] via-white to-[#138808]">
      <div className="animate-pulse">
        <AppLogo className="h-auto w-64" />
      </div>
    </div>
  );
}
