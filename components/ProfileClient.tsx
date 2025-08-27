'use client';
import { BookOpen, Calendar, GraduationCap, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

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
            className="px-6 bg-red-700 hover:bg-red-800 text-white"
          >
            Logout
          </Button>
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
              <div className="p-3 bg-gray-50 rounded-md border">{profile.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {profile.email}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone Number</label>
              <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {profile.phone}
              </div>
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
              <div className="p-3 bg-gray-50 rounded-md border">{profile.college}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Branch/Major</label>
              <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                {profile.branch}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Academic Year</label>
              <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {profile.year === 1
                  ? '1st Year'
                  : profile.year === 2
                  ? '2nd Year'
                  : profile.year === 3
                  ? '3rd Year'
                  : profile.year === 4
                  ? '4th Year'
                  : `${profile.year}th Year`}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {!profile?.team_id ? (
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
