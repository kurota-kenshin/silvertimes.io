import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import ProfileContent from "./ProfileContent";

export default function Profile() {
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) login();
  }, [ready, authenticated, login]);

  if (!ready) {
    return (
      <section className="relative bg-background-primary py-32 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-silver-300">Loading...</p>
        </div>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="relative bg-background-primary py-32 px-4 min-h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-silver-300 mb-8">Connect your wallet or sign in to view your profile.</p>
          <button
            onClick={login}
            className="px-8 py-3 bg-gradient-to-r from-brand-blue to-brand-teal text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-blue/25"
          >
            Connect Wallet
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden min-h-screen">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <ProfileContent />
      </div>
    </section>
  );
}
