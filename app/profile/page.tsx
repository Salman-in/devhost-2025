"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut, profile, profileLoading } = useAuth();
  const {
    user,
    loading,
    signOut,
    profile,
    profileLoading,
    setProfile,
    team,
    teamLoading,
    setTeam,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    year: 1,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
      return;
    }

    // If profile doesn't exist or is incomplete, redirect to details page
    if (!loading && !profileLoading && profile && (!profile.name || !profile.phone || !profile.college || !profile.branch)) {
      router.replace('/details');
      return;
    }
  }, [user, loading, profile, profileLoading, router]);
      router.replace("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      // Set form loading state
      setIsFormLoading(true);

      // Add delay before populating form
      const timer = setTimeout(() => {
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          college: profile.college || "",
          year: profile.year || 1,
          branch: profile.branch || "",
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
      router.replace("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || profileLoading) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.college ||
      !form.branch ||
      !form.year
    ) {
      setError("All fields are required.");
      return;
    }
    setError("");

    setIsSaving(true);
    setSaved(false);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/v1/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();

        // If API indicates we should refresh token, force refresh to get updated claims
        if (data.refreshToken) {
          await user.getIdToken(true);
        }

        setProfile(data.user);
        setSaved(true);
        setIsDirty(false);
      }
    } catch (error) {
      setError("Failed to save profile. Please try again later.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaved(false), 2000);
      window.location.reload(); // Reload to ensure profile is updated
    }
  };

  if (loading || profileLoading || isFormLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Profile not found. Redirecting...</p>
          <p className="mt-4 text-gray-600">
            {loading || profileLoading ? "Loading..." : "Preparing form..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">View your account information</p>
          </div>
          <Button
            onClick={handleLogout}
            className="px-6 bg-red-700 hover:bg-red-800 cursor-pointer text-white"
          >
            Logout
          </Button>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {

            }
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <span className="text-gray-900">{profile.name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{profile.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{profile.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">College/University</label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <span className="text-gray-900">{profile.college}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Branch/Major</label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{profile.branch}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="year" className="mb-2 block">
                  Year
                </Label>
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Academic Year</label>
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {profile.year === 1 ? '1st Year' : 
                     profile.year === 2 ? '2nd Year' : 
                     profile.year === 3 ? '3rd Year' : 
                     profile.year === 4 ? '4th Year' : `${profile.year}th Year`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            size="lg"
            className="bg-black hover:bg-neutral-950 text-white px-8"
          >
            {!profile?.team_id ? (
              <Link href="/hackathon">Join Hackathon</Link>
            ) : (
              <Link href="/hackathon/dashboard">Hackathon Dashboard</Link>
            )}
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="bg-white hover:bg-neutral-950 text-black shadow-md hover:text-black px-8"
          >
            <Link href="/">Back to Home</Link>
          </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="bg-black hover:bg-black/70 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              disabled={isSaving || saved || !isDirty}
            >
              {isSaving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </form>
        </div>
      </div>
      <Button asChild>
        {profile?.team_id === "" ? (
          <Link href="/hackathon">Hackathon</Link>
        ) : (
          <Link href="/hackathon/dashboard">Hackathon</Link>
        )}
      </Button>
      <Events />
    </div>
  );
}