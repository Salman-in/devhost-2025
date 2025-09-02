"use client";

import { useState } from "react";
import { User, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClippedCard } from "@/components/ClippedCard";
import { ClippedButton } from "@/components/ClippedButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { COLLEGES } from "@/lib/constants";
import { toast } from "sonner";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number;
  team_id?: string;
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [profileState, setProfileState] = useState(profile);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    JSON.stringify(editedProfile) !== JSON.stringify(profileState);

  const isValidPhone = (phone: string) =>
    /^[0-9]{10}$/.test(phone.replace(/\s/g, ""));

  const handleSave = async () => {
    if (
      !editedProfile.name ||
      !editedProfile.phone ||
      !editedProfile.college ||
      !editedProfile.branch ||
      !editedProfile.year
    ) {
      toast.error("All fields are required.");
      return;
    }
    if (!isValidPhone(editedProfile.phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    toast.error("");
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
        toast.error("Failed to save profile. Please try again.");
      }
    } catch {
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profileState);
    setIsEditing(false);
  };

  return (
    <ClippedCard innerBg="bg-[#101810]">
      <div className="flex w-full flex-col border p-6 sm:p-8 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
            <User className="h-5 w-5 text-[#a3ff12] sm:h-6 sm:w-6" />
            Personal Information
          </h2>

          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <ClippedButton
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </ClippedButton>
                <ClippedButton onClick={handleCancel}>
                  <X className="h-4 w-4" /> Cancel
                </ClippedButton>
              </>
            ) : (
              <ClippedButton onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" /> Edit
              </ClippedButton>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="text-sm text-white">Full Name</label>
            <Input
              value={editedProfile.name}
              disabled={!isEditing}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, name: e.target.value })
              }
              className="mt-1 h-11 w-full text-gray-400 sm:h-12"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:gap-7 sm:py-3">
            <div>
              <label className="text-sm text-white">Email Address</label>
              <Input
                value={profileState.email}
                disabled
                className="mt-1 h-11 w-full text-gray-400 sm:h-12"
              />
            </div>
            <div>
              <label className="text-sm text-white">Phone Number</label>
              <Input
                value={editedProfile.phone}
                disabled={!isEditing}
                maxLength={10}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, phone: e.target.value })
                }
                className="mt-1 h-11 w-full text-gray-400 sm:h-12"
              />
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
                <SelectTrigger className="mt-1 h-11 w-full text-gray-400 sm:h-12" />
                <SelectContent>
                  {COLLEGES.map((college, idx) => (
                    <SelectItem key={idx} value={college}>
                      {college}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={profileState.college}
                disabled
                className="mt-1 h-11 w-full text-gray-400 sm:h-12"
              />
            )}
          </div>

          {/* Branch + Year */}
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 sm:gap-7 sm:py-3">
            <div>
              <label className="text-sm text-white">Branch/Major</label>
              <Input
                value={editedProfile.branch}
                disabled={!isEditing}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, branch: e.target.value })
                }
                className="mt-1 h-11 w-full text-gray-400 sm:h-12"
              />
            </div>
            <div>
              <label className="text-sm text-white">Academic Year</label>
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
                  <SelectTrigger className="mt-1 h-11 w-full text-gray-400 sm:h-12" />
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={`${profileState.year} Year`}
                  disabled
                  className="mt-1 h-11 w-full text-gray-400 sm:h-12"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ClippedCard>
  );
}
