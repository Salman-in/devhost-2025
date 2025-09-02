"use client";

import { BookOpen, Calendar, Phone, User, Edit, Save, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { COLLEGES } from "@/lib/constants";
import { toast } from "sonner";
import { ClippedCard } from "@/components/ClippedCard";

interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number;
  team_id?: string;
}

export default function ProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [profileState, setProfileState] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isValidPhone = (phone: string) =>
    /^[0-9]{10}$/.test(phone.replace(/\s/g, ""));

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleSave = async () => {
    if (
      !editedProfile.name ||
      !editedProfile.phone ||
      !editedProfile.college ||
      !editedProfile.branch ||
      !editedProfile.year
    ) {
      setError("All fields are required.");
      return;
    }

    if (!isValidPhone(editedProfile.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/v1/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      if (res.ok) {
        setProfileState(editedProfile);
        setIsEditing(false);
        toast("Profile updated successfully!");
      } else {
        setError("Failed to save profile. Please try again.");
        toast.error("Failed to save profile. Please try again.");
      }
    } catch {
      setError("An error occurred while saving. Please try again.");
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profileState);
    setIsEditing(false);
  };

  const hasChanges =
    JSON.stringify(editedProfile) !== JSON.stringify(profileState);

  return (
    <section className="font-orbitron relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a3ff12_1px,transparent_1px),linear-gradient(to_bottom,#a3ff12_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-3 z-50 sm:top-10 sm:left-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-primary font-orbitron flex cursor-pointer items-center justify-center gap-2 px-3 py-2 text-xs font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50 sm:px-4 sm:text-sm"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid var(--color-primary)",
          }}
        >
          Back
        </button>
      </div>

      {/* Logout Button */}
      <div className="absolute top-6 right-3 z-50 sm:top-10 sm:right-10">
        <Button
          onClick={handleLogout}
          className="font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none bg-[red] hover:bg-red-600 px-4 py-2 text-xs font-bold tracking-widest text-white uppercase sm:px-5 sm:text-sm"
          style={{
            clipPath:
              "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
          }}
        >
          Logout
        </Button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-5 sm:px-15 sm:py-16">
        {/* Header */}
        <div className="relative mt-20 mb-8 text-center sm:mt-0 sm:mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-[#a3ff12] uppercase sm:text-4xl md:text-5xl">
            Profile
          </h1>
        </div>
        {/* Profile Card */}
        <ClippedCard innerBg="bg-[#101810]" className="mx-auto mb-10">
          <div className="flex flex-col border p-6 sm:p-8 md:p-8">
            {/* Title + Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
                <User className="h-5 w-5 text-[#a3ff12] sm:h-6 sm:w-6" />{" "}
                Personal Information
              </h2>

              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none bg-[#a3ff12] px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                      style={{
                        clipPath:
                          "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                      }}
                    >
                      <Save className="h-4 w-4" />{" "}
                      {isSaving ? "Saving..." : "Save"}
                    </Button>

                    <Button
                      onClick={handleCancel}
                      className="font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none bg-[#a3ff12] px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                      style={{
                        clipPath:
                          "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                      }}
                    >
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none bg-[#a3ff12] px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                    style={{
                      clipPath:
                        "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                    }}
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="w-full text-sm text-white">Full Name</label>
                {isEditing ? (
                  <Input
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 h-11 w-full rounded-none text-gray-400 sm:h-12"
                  />
                ) : (
                  <div className="mt-1 flex h-11 items-center border border-gray-700 bg-black/40 px-3 text-gray-400 sm:h-12">
                    {profileState.name}
                  </div>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:gap-7 sm:py-3">
                <div>
                  <label className="text-sm text-white">Email Address</label>
                  <div className="mt-1 flex h-11 items-center gap-2 border border-gray-700 bg-black/40 px-3 font-sans text-gray-400 sm:h-12">
                    <span className="truncate">{profileState.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white">Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 h-11 w-full rounded-none text-gray-400 sm:h-12"
                      maxLength={10}
                    />
                  ) : (
                    <div className="mt-1 flex h-11 items-center gap-2 border border-gray-700 bg-black/40 px-3 text-gray-400 sm:h-12">
                      <Phone className="h-4 w-4 text-[#a3ff12]" />
                      {profileState.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* College */}
              <div>
                <label className="text-sm text-white">College/University</label>
                {isEditing ? (
                  <Select
                    value={editedProfile.college}
                    onValueChange={(value) =>
                      setEditedProfile({ ...editedProfile, college: value })
                    }
                  >
                    <SelectTrigger className="mt-1 w-full rounded-none text-gray-400">
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
                  <div className="mt-1 border border-gray-700 bg-black/40 p-3 text-gray-400">
                    {profileState.college}
                  </div>
                )}
              </div>

              {/* Branch + Year */}
              <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:gap-7 sm:py-3">
                <div>
                  <label className="text-sm text-white">Branch/Major</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.branch}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          branch: e.target.value,
                        })
                      }
                      className="mt-1 h-11 rounded-none text-gray-400 sm:h-12"
                    />
                  ) : (
                    <div className="mt-1 flex h-11 items-center gap-2 border border-gray-700 bg-black/40 px-3 text-gray-400 sm:h-12">
                      <BookOpen className="h-4 w-4 text-[#a3ff12]" />
                      {profileState.branch}
                    </div>
                  )}
                </div>
                <div>
                  <label className="w-full text-sm text-white">
                    Academic Year
                  </label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.year.toString()}
                      onValueChange={(value) =>
                        setEditedProfile({
                          ...editedProfile,
                          year: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 h-11 rounded-none text-gray-400 sm:h-12">
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
                    <div className="mt-1 flex h-11 items-center gap-2 border border-gray-700 bg-black/40 px-3 text-gray-400 sm:h-12">
                      <Calendar className="h-4 w-4 text-[#a3ff12]" />
                      {profileState.year} Year
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ClippedCard>

        {/* Hackathon + Events */}
        <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8">
          {/* Hackathon */}
          <ClippedCard innerBg="bg-[#101810]" className="w-full">
            <div className="mx-auto flex flex-col items-center p-6 sm:p-12">
              <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">
                Hackathon
              </h3>
              {!profileState?.team_id ? (
                <Button
                  className="bg-primary font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                  style={{
                    clipPath:
                      "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                  }}
                  asChild
                >
                  <Link href="/hackathon">Join Hackathon</Link>
                </Button>
              ) : (
                <Button
                  className="bg-primary font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                  style={{
                    clipPath:
                      "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                  }}
                  asChild
                >
                  <Link href="/hackathon/dashboard">Hackathon Dashboard</Link>
                </Button>
              )}
            </div>
          </ClippedCard>

          {/* Events */}
          <ClippedCard innerBg="bg-[#101810]" className="w-full">
            <div className="mx-auto flex flex-col items-center p-6 sm:p-12">
              <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">
                Events
              </h3>
              <Button
                className="bg-primary font-orbitron relative flex cursor-pointer items-center gap-2 rounded-none px-4 py-2 text-xs font-bold tracking-widest text-black uppercase sm:px-5 sm:text-sm"
                style={{
                  clipPath:
                    "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                }}
                asChild
              >
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          </ClippedCard>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-md border border-red-700 bg-red-500/30 p-4 text-center font-bold text-red-100">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
