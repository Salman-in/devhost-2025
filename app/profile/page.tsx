'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut, profile, profileLoading, setProfile } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    year: 1,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      // Set form loading state
      setIsFormLoading(true);

      // Add delay before populating form
      const timer = setTimeout(() => {
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          college: profile.college || '',
          year: profile.year || 1,
          branch: profile.branch || ''
        });
        setIsFormLoading(false);
      }, 1);

      // Cleanup timer on component unmount or profile change
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (!form.name || !form.email || !form.phone || !form.college || !form.branch || !form.year) {
      setError('All fields are required.');
      return;
    }
    setError('');

    setIsSaving(true);
    setSaved(false);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/v1/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setSaved(true);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading || profileLoading || isFormLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading || profileLoading ? 'Loading...' : 'Preparing form...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md cursor-pointer"
            >
              Logout
            </Button>
          </div>

          <form className="space-y-6 text-gray-900" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="mb-2 block">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
  setForm({ ...form, name: e.target.value });
  setIsDirty(true);
}}

                  placeholder="Enter your name"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="Enter your email"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="mb-2 block">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="Phone number"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="college" className="mb-2 block">College</Label>
                <Input
                  id="college"
                  type="text"
                  value={form.college}
                  onChange={(e) => {
                    setForm({ ...form, college: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="Your college name"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch" className="mb-2 block">Branch</Label>
                <Input
                  id="branch"
                  type="text"
                  value={form.branch}
                  onChange={(e) => {
                    setForm({ ...form, branch: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="Branch"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year" className="mb-2 block">Year</Label>
                <Select
                  value={String(form.year)}
                  onValueChange={(value) => {
                    setForm({ ...form, year: Number(value) });
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              disabled={isSaving || saved || !isDirty}
            >
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </Button>
          </form>
        </div>
      </div>
      <Button>Hackathon</Button>
    </div>
  );
}