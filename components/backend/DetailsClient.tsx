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
        <ClippedButton
          onClick={() => router.push("/")}
          innerBg="bg-primary"
          textColor="text-black"
        >
          Back
        </ClippedButton>
      </div>

      <div className="mx-auto mt-20 flex w-full max-w-sm items-center justify-center px-4 sm:mt-16 sm:max-w-md sm:px-6 md:mt-24 md:max-w-lg md:px-8 lg:mt-32 lg:max-w-xl lg:px-10 xl:max-w-2xl xl:px-12">
        <ClippedCard innerBg="bg-[#101810]" className="w-full">
          <div className="flex h-full flex-col p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10">
            <div className="mb-6">
              <h1 className="text-primary mb-2 text-3xl font-bold tracking-wider uppercase">
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
                  <p className="text-sm font-bold tracking-wider text-white uppercase">
                    Profile Completion
                  </p>
                  <p className="text-primary font-semibold">
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
                      <CheckCircle2 size={14} className="text-primary ml-1" />
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="hover:border-primary focus:border-primary focus:ring-primary w-full rounded-none px-3 py-2 text-gray-300 placeholder-gray-500 focus:ring-2 focus:outline-none"
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
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className="hover:border-primary focus:border-primary focus:ring-primary/50 rounded-none px-3 py-2 text-gray-300 placeholder-gray-500 transition-all duration-150 focus:ring-2 focus:outline-none"
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
                    className="hover:border-primary focus:border-primary focus:ring-primary/50 rounded-none px-3 py-2 text-gray-300 placeholder-gray-500 transition-all duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="college"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <School size={14} className="inline-block" />{" "}
                    College/University *
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
                    <SelectTrigger className="hover:border-primary focus:border-primary focus:ring-primary/50 active:border-primary w-full rounded-none px-3 py-2 text-gray-300 transition-all duration-150 focus:ring-2 focus:outline-none data-[placeholder]:text-gray-300">
                      <SelectValue
                        className="font-medium text-gray-300 placeholder-gray-500"
                        placeholder="Select your college"
                      />
                    </SelectTrigger>
                    <SelectContent className="border-primary rounded-none border bg-black font-medium">
                      <div
                        className="border-primary border-b p-1 sm:p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Search college..."
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          className="focus:border-primary focus:ring-primary w-full rounded-none bg-black/40 px-2 py-1 text-xs text-gray-300 placeholder-gray-500 focus:ring-1 focus:outline-none sm:text-sm"
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="branch"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <BookOpen size={14} className="inline-block" /> Branch/Major
                    *
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
                    className="hover:border-primary focus:border-primary focus:ring-primary/50 rounded-none px-3 py-2 text-gray-300 placeholder-gray-500 transition-all duration-150 focus:ring-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="year"
                    className="mb-2 flex items-center gap-1 text-gray-300"
                  >
                    <Calendar size={14} className="inline-block" /> Academic
                    Year *
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
                    <SelectTrigger className="hover:border-primary focus:border-primary focus:ring-primary/50 active:border-primary w-full rounded-none px-3 py-2 text-gray-300 transition-all duration-150 focus:ring-2 focus:outline-none data-[placeholder]:text-gray-300">
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
