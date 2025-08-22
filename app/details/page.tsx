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
import { AlertCircle } from 'lucide-react';

export default function DetailsPage() {
  const router = useRouter();
  const { user, loading, profile, profileLoading, setProfile } = useAuth();

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
      return;
    }

    // If profile exists and has required fields filled, redirect to profile
    if (profile && profile.name && profile.phone && profile.college && profile.branch) {
      router.replace('/profile');
      return;
    }

    // Pre-fill form with existing profile data (like email and name from Google)
    if (profile) {
      setForm(prevForm => ({
        ...prevForm,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        college: profile.college || '',
        branch: profile.branch || '',
        year: profile.year || 1,
      }));
    }
  }, [user, loading, profile, router]);

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

        // If API indicates we should refresh token, force refresh to get updated claims
        if (data.refreshToken) {
          await user.getIdToken(true);
        }

        setProfile({ ...form });
        setSaved(true);
        
        // Redirect to profile page after successful save
        setTimeout(() => {
          router.replace('/profile');
        }, 1500);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || profileLoading) {
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
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Please fill in all the required information to continue.</p>
          </div>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Important Notice</h3>
              <p className="text-sm text-red-600">
                Once you submit this form, your details cannot be edited later. Please ensure all information is accurate before submitting.
              </p>
            </div>
          </div>

          <form className="space-y-6 text-gray-900" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="mb-2 block">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone" className="mb-2 block">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="college" className="mb-2 block">College/University *</Label>
                <Input
                  id="college"
                  type="text"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="Enter your college name"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="branch" className="mb-2 block">Branch/Major *</Label>
                <Input
                  id="branch"
                  type="text"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  placeholder="e.g., Computer Science, Electronics"
                  className="text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="year" className="mb-2 block">Academic Year *</Label>
                <Select
                  value={String(form.year)}
                  onValueChange={(value) => setForm({ ...form, year: Number(value) })}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select your year" />
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

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-800 cursor-pointer text-white px-6 py-3 rounded-md transition-colors disabled:opacity-50 font-medium"
                disabled={isSaving || saved}
              >
                {isSaving ? 'Saving Profile...' : saved ? 'Profile Saved! Redirecting...' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}