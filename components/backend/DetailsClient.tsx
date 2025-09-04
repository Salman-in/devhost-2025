"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DecryptText from "@/components/animated/TextAnimation";
import { ClippedCard } from "@/components/ClippedCard";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  User,
  Phone,
  School,
  BookOpen,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { COLLEGES } from "@/lib/constants";
import { toast } from "sonner";
import { ClippedButton } from "../ClippedButton";

interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number | null;
}

export default function DetailsClient({ profile }: { profile: Profile }) {
  const router = useRouter();

  const [form, setForm] = useState<Profile>({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    college: profile.college || "",
    branch: profile.branch || "",
    year: profile.year || null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [collegeSearch, setCollegeSearch] = useState("");

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  useEffect(() => {
    let fieldsCompleted = 0;
    const totalRequiredFields = 5;

    if (form.name) fieldsCompleted++;
    if (form.phone && isValidPhone(form.phone)) fieldsCompleted++;
    if (form.college) fieldsCompleted++;
    if (form.branch) fieldsCompleted++;
    if (form.year) fieldsCompleted++;

    setCompletionPercentage(
      Math.round((fieldsCompleted / totalRequiredFields) * 100),
    );
  }, [form]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.college ||
      !form.branch ||
      !form.year
    ) {
      toast.error("All fields are required.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/v1/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
        router.replace("/profile");
      } else {
        toast.error("Failed to save profile. Please try again.");
      }
    } catch {
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formFieldClass =
    "w-full rounded-none px-3 py-2 text-gray-300 placeholder-gray-500 ";

  return (
    <div className="font-orbitron relative flex min-h-screen items-center overflow-hidden bg-black py-8 text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
          linear-gradient(to right, #a3ff12 1px, transparent 1px),
          linear-gradient(to bottom, #a3ff12 1px, transparent 1px)
        `,
            backgroundSize: "80px 80px",
            opacity: 0.1,
          }}
        />
      </div>

      <div className="absolute top-2 right-2 left-2 z-10 flex flex-col items-end sm:top-10 sm:right-auto sm:left-10">
        <ClippedButton
          onClick={() => router.push("/")}
          innerBg="bg-primary"
          textColor="text-black"
        >
          Back
        </ClippedButton>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <ClippedCard innerBg="bg-[#101810]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 md:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
                <User className="h-5 w-5 text-[#a3ff12] sm:h-6 sm:w-6" />
                Complete Your Profile
              </h2>
            </div>

            {/* Form */}
            <form
              className="flex flex-col gap-6 text-white"
              onSubmit={handleSubmit}
            >
              {/* Name & Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
                <div className="flex flex-col">
                  <Label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-1 text-sm text-white"
                  >
                    <User size={14} /> Full Name *
                    {form.name && (
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={formFieldClass}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="email" className="mb-2 text-sm text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    disabled
                    className={`${formFieldClass} cursor-not-allowed bg-black/20 disabled:text-gray-400`}
                  />
                </div>
              </div>

              {/* Phone & College */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
                <div className="flex flex-col">
                  <Label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-1 text-sm text-white"
                  >
                    <Phone size={14} /> Phone Number *
                    {form.phone && isValidPhone(form.phone) && (
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    className={formFieldClass}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="college"
                    className="mb-2 flex items-center gap-1 text-sm text-white"
                  >
                    <School size={14} /> College/University *
                    {form.college && (
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Select
                    value={form.college}
                    onValueChange={(value) =>
                      setForm({ ...form, college: value })
                    }
                  >
                    <SelectTrigger className={formFieldClass}>
                      <SelectValue
                        className="font-medium text-gray-300 placeholder-gray-500"
                        placeholder="Select your college"
                      />
                    </SelectTrigger>
                    <SelectContent className="border-primary rounded-none border bg-black font-medium">
                      <div
                        className="border-primary border-b p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Search college..."
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          className={`${formFieldClass} bg-black/40 p-1 text-xs sm:text-sm`}
                          autoFocus
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto sm:max-h-60">
                        {COLLEGES.filter((college) =>
                          college
                            .toLowerCase()
                            .includes(collegeSearch.toLowerCase()),
                        ).map((college, idx) => (
                          <SelectItem
                            key={idx}
                            value={college}
                            className="data-[highlighted]:bg-primary rounded-none font-medium text-gray-300 data-[highlighted]:text-black"
                          >
                            {college}
                          </SelectItem>
                        ))}
                        {COLLEGES.filter((college) =>
                          college
                            .toLowerCase()
                            .includes(collegeSearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="p-3 text-center text-sm text-gray-500">
                            No colleges found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branch & Year */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7">
                <div className="flex flex-col">
                  <Label
                    htmlFor="branch"
                    className="mb-2 flex items-center gap-1 text-sm text-white"
                  >
                    <BookOpen size={14} /> Branch/Major *
                    {form.branch && (
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Input
                    id="branch"
                    type="text"
                    value={form.branch}
                    onChange={(e) =>
                      setForm({ ...form, branch: e.target.value })
                    }
                    placeholder="e.g., Computer Science, Electronics"
                    className={formFieldClass}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="year"
                    className="mb-2 flex items-center gap-1 text-sm text-white"
                  >
                    <Calendar size={14} /> Academic Year *
                    {form.year && (
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Select
                    value={form.year ? String(form.year) : ""}
                    onValueChange={(value) =>
                      setForm({ ...form, year: Number(value) })
                    }
                  >
                    <SelectTrigger className={formFieldClass}>
                      <SelectValue
                        className="font-medium text-gray-300 placeholder-gray-500"
                        placeholder="Select your year"
                      />
                    </SelectTrigger>
                    <SelectContent className="border-primary rounded-none border bg-black font-medium">
                      {[1, 2, 3, 4].map((year) => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                          className="data-[highlighted]:bg-primary rounded-none font-medium text-gray-300 data-[highlighted]:text-black"
                        >
                          {year} {["st", "nd", "rd", "th"][year - 1]} Year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <ClippedButton
                  type="submit"
                  disabled={isSaving || saved || completionPercentage < 100}
                  className="font-orbitron flex w-auto min-w-[180px] items-center justify-center gap-2 text-center text-xs font-bold tracking-wider uppercase sm:min-w-[200px] md:min-w-[220px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving
                      Profile...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Redirecting...
                    </>
                  ) : completionPercentage < 100 ? (
                    <>Complete All Fields</>
                  ) : (
                    <>
                      Complete Profile <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </ClippedButton>
              </div>
            </form>
          </div>
        </ClippedCard>
      </div>
    </div>
  );
}
