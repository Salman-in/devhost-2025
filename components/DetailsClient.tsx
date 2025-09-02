
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  AlertCircle,
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
  const [error, setError] = useState("");
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
      Math.round((fieldsCompleted / totalRequiredFields) * 100)
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
      setError("All fields are required.");
      return;
    }

    setError("");
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
        setError("Failed to save profile. Please try again.");
      }
    } catch {
      setError("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-black py-8 text-white font-orbitron">
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

      <div className="text-primary absolute top-10 right-10 z-20 text-xs tracking-wider sm:text-sm">
        <DecryptText
          text="> PROFILE FORM"
          startDelayMs={200}
          trailSize={6}
          flickerIntervalMs={40}
          revealDelayMs={80}
        />
        <DecryptText
          text="> ENTER YOUR DETAILS TO CONTINUE"
          startDelayMs={800}
          trailSize={6}
          flickerIntervalMs={50}
          revealDelayMs={90}
        />
        <DecryptText
          text="> ALL FIELDS ARE REQUIRED"
          startDelayMs={1600}
          trailSize={6}
          flickerIntervalMs={60}
          revealDelayMs={100}
        />
        <DecryptText
          text="> CLICK SUBMIT WHEN DONE"
          startDelayMs={2400}
          trailSize={6}
          flickerIntervalMs={60}
          revealDelayMs={100}
        />
      </div>

      <div className="absolute top-2 right-2 left-2 z-10 flex flex-col items-end sm:top-10 sm:right-auto sm:left-10">
        <button
          onClick={() => router.push("/")}
          className="bg-primary flex cursor-pointer items-center justify-center gap-2 px-3 py-2 text-xs font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50 sm:px-4 sm:text-sm rounded-none"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid var(--color-primary)",
          }}
        >
          Back
        </button>
      </div>

      <div className="mx-auto mt-20 w-full max-w-sm px-4 sm:mt-16 sm:max-w-md sm:px-6 md:mt-24 md:max-w-lg md:px-8 lg:mt-32 lg:max-w-xl lg:px-10 xl:max-w-2xl xl:px-12 flex justify-center items-center">
        <ClippedCard innerBg="bg-[#101810]" className="w-full">
          <div className="flex h-full flex-col p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10">
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold tracking-wider uppercase text-[#a3ff12]">
                Complete Your Profile
              </h1>
              <DecryptText
                text="> Please fill in all the required information to continue."
                startDelayMs={400}
                trailSize={6}
                flickerIntervalMs={50}
                revealDelayMs={90}
                className="text-primary"
              />

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-bold tracking-wider uppercase text-white">
                    Profile Completion
                  </p>
                  <p className="font-semibold text-primary">
                    {completionPercentage}%
                  </p>
                </div>
                <div
                  className="h-2 w-full overflow-hidden border bg-black"
                  style={{ borderColor: "#a3ff12" }}
                >
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${completionPercentage}%`,
                      background: "#fff",
                      boxShadow: "0 0 10px #fff",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <form className="space-y-6 text-white" onSubmit={handleSubmit}>
              {/* Name & Email */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <User size={14} className="inline-block" /> Full Name *
                    {form.name && (
                      <CheckCircle2 size={14} className="text-[#a3ff12] ml-1" />
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="rounded-none text-gray-300 placeholder-gray-500 hover:border-primary focus:border-primary focus:ring-primary w-full px-3 py-2 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    className="rounded-none text-gray-300 placeholder-gray-500 hover:border-primary focus:border-primary focus:ring-primary/50 px-3 py-2 transition-all duration-150 focus:ring-2 focus:outline-none"
                    disabled
                  />
                </div>
              </div>

              {/* Phone & College */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <Phone size={14} className="inline-block" /> Phone Number *
                    {form.phone && isValidPhone(form.phone) && (
                      <CheckCircle2 size={14} className="text-[#a3ff12] ml-1" />
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="rounded-none text-gray-300 placeholder-gray-500 hover:border-primary focus:border-primary focus:ring-primary/50 px-3 py-2 transition-all duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="college"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <School size={14} className="inline-block" /> College/University *
                    {form.college && (
                      <CheckCircle2 size={14} className="text-[#a3ff12] ml-1" />
                    )}
                  </Label>
                  <Select
                    value={form.college}
                    onValueChange={(value) => setForm({ ...form, college: value })}
                  >
                    <SelectTrigger className="rounded-none w-full px-3 py-2 text-gray-300 hover:border-primary focus:border-primary focus:ring-primary/50 active:border-primary transition-all duration-150 focus:ring-2 focus:outline-none data-[placeholder]:text-gray-300">
                      <SelectValue
                        className="text-gray-300 placeholder-gray-500 font-medium"
                        placeholder="Select your college"
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-primary border bg-black font-medium">
                      <div
                        className="border-primary border-b p-1 sm:p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Search college..."
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          className="rounded-none text-gray-300 placeholder-gray-500 focus:border-primary focus:ring-primary w-full px-2 py-1 text-xs focus:ring-1 focus:outline-none sm:text-sm bg-black/40"
                          autoFocus
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto sm:max-h-60">
                        {COLLEGES.filter((college) =>
                          college.toLowerCase().includes(collegeSearch.toLowerCase())
                        ).map((college, idx) => (
                          <SelectItem
                            key={idx}
                            value={college}
                            className="rounded-none text-gray-300 data-[highlighted]:bg-[#a3ff12] data-[highlighted]:text-black font-medium"
                          >
                            {college}
                          </SelectItem>
                        ))}
                        {COLLEGES.filter((college) =>
                          college.toLowerCase().includes(collegeSearch.toLowerCase())
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="branch"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <BookOpen size={14} className="inline-block" /> Branch/Major *
                    {form.branch && (
                      <CheckCircle2 size={14} className="text-[#a3ff12] ml-1" />
                    )}
                  </Label>
                  <Input
                    id="branch"
                    type="text"
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    placeholder="e.g., Computer Science, Electronics"
                    className="rounded-none text-gray-300 placeholder-gray-500 hover:border-primary focus:border-primary focus:ring-primary/50 px-3 py-2 transition-all duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="year"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <Calendar size={14} className="inline-block" /> Academic Year *
                    {form.year && (
                      <CheckCircle2 size={14} className="text-[#a3ff12] ml-1" />
                    )}
                  </Label>
                  <Select
                    value={form.year ? String(form.year) : ""}
                    onValueChange={(value) =>
                      setForm({ ...form, year: Number(value) })
                    }
                  >
                    <SelectTrigger className="rounded-none w-full px-3 py-2 text-gray-300 hover:border-primary focus:border-primary focus:ring-primary/50 active:border-primary transition-all duration-150 focus:ring-2 focus:outline-none data-[placeholder]:text-gray-300">
                      <SelectValue
                        className="text-gray-300 placeholder-gray-500 font-medium"
                        placeholder="Select your year"
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-primary border bg-black font-medium">
                      {[1, 2, 3, 4].map((year) => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                          className="rounded-none text-gray-300 data-[highlighted]:bg-[#a3ff12] data-[highlighted]:text-black font-medium"
                        >
                          {year} {["st", "nd", "rd", "th"][year - 1]} Year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="animate-pulse border bg-black/60 p-4 rounded-none"
                  style={{ borderColor: "var(--chart-5)" }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      style={{ color: "var(--chart-5)" }}
                    />
                    <div>
                      <h3
                        className="mb-1 font-semibold tracking-wider uppercase"
                        style={{ color: "var(--chart-5)" }}
                      >
                        Error
                      </h3>
                      <p className="text-sm" style={{ color: "var(--chart-5)" }}>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="rounded-none font-orbitron flex w-auto min-w-[180px] sm:min-w-[200px] md:min-w-[220px] cursor-pointer items-center justify-center gap-2 px-8 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:outline-none active:scale-[1.02] disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-50 disabled:shadow-none"
                  style={{
                    clipPath:
                      "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
                  }}
                  disabled={isSaving || saved || completionPercentage < 100}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Redirecting...
                    </>
                  ) : completionPercentage < 100 ? (
                    <>Complete All Fields</>
                  ) : (
                    <>
                      Complete Profile
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </ClippedCard>
      </div>
    </div>
  );
}
