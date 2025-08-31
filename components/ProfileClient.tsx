'use client';
import { BookOpen, Calendar, GraduationCap, Mail, Phone, User, Edit, Save, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { COLLEGES } from "@/lib/constants";
import { toast } from "sonner";

interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number;
  team_id?: string;
}
export default function ProfileClient({ profile } : { profile: Profile}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [profileState, setProfileState] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleSave = async () => {
    if (!editedProfile.name || !editedProfile.phone || !editedProfile.college || !editedProfile.branch || !editedProfile.year) {
      setError('All fields are required.');
      return;
    }

    if (!isValidPhone(editedProfile.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/v1/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (res.ok) {
        setProfileState(editedProfile);
        setIsEditing(false);
        toast("Profile updated successfully!");
      } else {
        setError('Failed to save profile. Please try again.');
        toast.error('Failed to save profile. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while saving. Please try again.');
      toast.error('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profileState);
    setIsEditing(false);
  };

  const hasChanges = JSON.stringify(editedProfile) !== JSON.stringify(profileState);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">{isEditing ? 'Edit your account information' : 'View your account information'}</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="px-4 bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="px-4 text-black">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="px-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            <Button
              onClick={handleLogout}
              className="px-6 bg-red-700 hover:bg-red-800 text-white"
            >
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              {isEditing ? (
                <Input
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">{profileState.name}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              {isEditing ? (
                <Input
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                  className="mt-1"
                  disabled
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {profileState.email}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone Number</label>
              {isEditing ? (
                <Input
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  className="mt-1"
                  maxLength={10}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {profileState.phone}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">College/University</label>
              {isEditing ? (
                <Select value={editedProfile.college} onValueChange={(value) => setEditedProfile({...editedProfile, college: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGES.map((college, idx) => (
                      <SelectItem key={idx} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">{profileState.college}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Branch/Major</label>
              {isEditing ? (
                <Input
                  value={editedProfile.branch}
                  onChange={(e) => setEditedProfile({...editedProfile, branch: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  {profileState.branch}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Academic Year</label>
              {isEditing ? (
                <Select value={editedProfile.year.toString()} onValueChange={(value) => setEditedProfile({...editedProfile, year: parseInt(value)})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {profileState.year === 1
                    ? '1st Year'
                    : profileState.year === 2
                    ? '2nd Year'
                    : profileState.year === 3
                    ? '3rd Year'
                    : profileState.year === 4
                    ? '4th Year'
                    : `${profileState.year}th Year`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-3">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {!profileState?.team_id ? (
            <Link href="/hackathon">
              <Button size="lg" className="bg-black hover:bg-neutral-950 text-white px-8">
                Join Hackathon
              </Button>
            </Link>
          ) : (
            <Link href="/hackathon/dashboard">
              <Button size="lg" className="bg-black hover:bg-neutral-950 text-white px-8">
                Hackathon Dashboard
              </Button>
            </Link>
          )}
          
          <Link href="/">
            <Button variant="outline" size="lg" className="bg-white hover:bg-gray-100 text-black shadow-md px-8">
              Back to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
   
}