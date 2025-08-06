'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-black">Profile</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="text-black">{user?.displayName || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-black">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}