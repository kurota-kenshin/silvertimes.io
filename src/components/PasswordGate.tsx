import { useState, useEffect, ReactNode } from 'react';
import { accessApi, accessTokenManager } from '../services/api';

interface PasswordGateProps {
  children: ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const token = accessTokenManager.get();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const result = await accessApi.validateToken();
    setIsAuthenticated(result.valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await accessApi.verifyPassword(password);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  // Not authenticated - show password form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
        <div className="max-w-md w-full">
          <div className="bg-background-secondary rounded-2xl p-8 border border-border-primary">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">
                <span className="text-text-primary font-bold">Silver</span>
                <span className="text-accent-primary">Times</span>
              </div>
              <h2 className="text-xl text-text-primary font-semibold mb-2">
                Early Access
              </h2>
              <p className="text-text-secondary text-sm">
                Enter the password to access the prediction game
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-background-primary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Access Game'}
              </button>
            </form>

            <p className="text-text-tertiary text-xs text-center mt-6">
              Contact us if you need access credentials
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show children
  return <>{children}</>;
}
