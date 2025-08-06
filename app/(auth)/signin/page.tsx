'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);
    const [pendingGoogleCheck, setPendingGoogleCheck] = useState(false);

    useEffect(() => {
        if (pendingGoogleCheck && user?.uid) {
            // Now user is set, check existence and redirect
            const checkUserExists = async () => {
                try {
                    const res = await fetch(`/api/users/${user.uid}/exists`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.exists) {
                            router.push('/profile');
                        } else {
                            router.push('/complete-profile');
                        }
                    } else {
                        router.push('/complete-profile');
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setGoogleLoading(false);
                    setPendingGoogleCheck(false);
                }
            };
            checkUserExists();
        }
    }, [pendingGoogleCheck, user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signIn(email, password);
            router.push('/profile'); 
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            setPendingGoogleCheck(true); // Wait for user to update
        } catch (err: any) {
            setError(err.message);
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-black">Login</h2>
                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">{error}</div>
                )}
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-black">Email</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 font-medium text-black">Password</label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                    Login
                </button>
                
                <div className="mt-6 text-center">
                    <div className="text-gray-500 text-sm mb-4 relative">
                        <span className="bg-white px-3">or</span>
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-black py-2.5 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </form>
        </div>
    );
}