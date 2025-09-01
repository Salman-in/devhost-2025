"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

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
  PartyPopper,
  Star,
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
  const [showSuccess, setShowSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Calculate profile completion percentage
  useEffect(() => {
    let fieldsCompleted = 0;
    const totalRequiredFields = 5; // name, phone, college, branch, year (email is pre-filled)

    if (form.name) fieldsCompleted++;
    if (form.phone && isValidPhone(form.phone)) fieldsCompleted++;
    if (form.college) fieldsCompleted++;
    if (form.branch) fieldsCompleted++;
    if (form.year) fieldsCompleted++;

    setCompletionPercentage(
      Math.round((fieldsCompleted / totalRequiredFields) * 100),
    );
  }, [form]);
  useEffect(() => {
    if (
      !cardRef.current ||
      !headerRef.current ||
      !progressRef.current ||
      !buttonRef.current
    )
      return;

    const tl = gsap.timeline();

    tl.from(headerRef.current, { opacity: 0, y: -20, duration: 0.6 })
      .from(cardRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
      .from(progressRef.current, {
        scaleX: 0,
        transformOrigin: "left",
        duration: 0.5,
      })
      .from(buttonRef.current, { opacity: 0, y: 10, duration: 0.5 });
  }, []);

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
      // Session cookie sent automatically with request; no Authorization header needed
      const res = await fetch("/api/v1/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaved(true);
        setShowSuccess(true);
        // Delay redirect to show the full animation of success message
        setTimeout(() => {
          router.replace("/profile");
        }, 2500);
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
    <div className="font-orbitron relative flex min-h-screen items-center overflow-hidden bg-black py-8 text-white">
      {/* Fixed grid background */}
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
      {/* Back button to home page */}
      <div className="absolute top-6 left-4 z-10 sm:top-10 sm:left-10">
        <button
          onClick={() => router.push("/")}
          className="flex cursor-pointer items-center justify-center gap-2 bg-[#b4ff39] px-3 py-2 text-xs font-bold tracking-wider text-black uppercase transition-all hover:brightness-90 disabled:opacity-50 sm:px-4 sm:text-sm"
          style={{
            clipPath:
              "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            border: "2px solid #b4ff39",
          }}
        >
          Back
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4">
        {/* Main clipped card */}
        <div
          style={{
            clipPath:
              "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
            backgroundColor: "#b4ff39", // neon border color
            padding: "1px", // border thickness
          }}
        >
          {/* Inner content */}
          <div
            ref={cardRef}
            className="relative z-10 m-[2px] flex h-full flex-col p-6"
            style={{
              clipPath:
                "polygon(20px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
          >
            <div className="mb-6">
              <h1
                className="font-orbitron mb-2 text-3xl font-bold tracking-wider uppercase"
                style={{ color: "var(--primary)" }}
              >
                Complete Your Profile
              </h1>
              <p className="text-foreground/80">
                Please fill in all the required information to continue.
              </p>

              {/* Profile Completion Progress */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <p
                    className="text-sm font-bold tracking-wider uppercase"
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    Profile Completion
                  </p>
                  <p
                    className="font-semibold"
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    {completionPercentage}%
                  </p>
                </div>
                <div
                  ref={progressRef}
                  className="h-2 w-full overflow-hidden rounded-full border bg-black"
                  style={{
                    borderColor: "var(--foreground)",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${completionPercentage}%`,
                      background: "#fff",
                      boxShadow: "0 0 10px #fff",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="relative mb-6 overflow-hidden">
                <div
                  className="animate-in slide-in-from-top-10 zoom-in-95 transform rounded-lg border-2 border-[#9dff2c] bg-black/80 p-6 shadow-lg transition-all duration-500 ease-out"
                  style={{
                    animation: "success-pulse 2s infinite alternate",
                    boxShadow: "0 0 20px rgba(157, 255, 44, 0.3)",
                  }}
                >
                  {/* Background stars/decoration */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="absolute text-[#9dff2c] opacity-70"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `star-float ${2 + Math.random() * 3}s infinite alternate ease-in-out`,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-[#9dff2c] shadow-md"
                        style={{
                          boxShadow: "0 0 15px rgba(157, 255, 44, 0.5)",
                        }}
                      >
                        <CheckCircle2 className="h-6 w-6 text-black" />
                      </div>
                      <div className="relative">
                        <h3 className="animate-in slide-in-from-left mb-1 text-xl font-bold tracking-wider text-[#9dff2c] uppercase duration-500">
                          Profile Saved Successfully!
                        </h3>
                        <p className="animate-in slide-in-from-left text-[#9dff2c]/90 delay-150 duration-500">
                          Your profile has been created and you're all set for
                          DevHost 2025!
                        </p>
                        <p className="animate-in slide-in-from-left mt-2 text-sm text-[#9dff2c]/80 delay-300 duration-500">
                          Redirecting to your profile page in a moment...
                        </p>
                      </div>
                    </div>
                    <PartyPopper className="hidden h-8 w-8 animate-ping text-[#9dff2c] md:block" />
                  </div>

                  {/* Progress bar for redirect countdown */}
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full border border-[#9dff2c]/30 bg-black">
                    <div
                      className="h-full rounded-full bg-[#9dff2c]"
                      style={{
                        width: "100%",
                        animation: "countdown 2s linear forwards",
                        boxShadow: "0 0 10px rgba(157, 255, 44, 0.5)",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/*            
            <div className="border-destructive mb-6 flex items-start gap-3 rounded-lg border bg-black/60 p-4">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="text-destructive mb-1 font-semibold tracking-wider uppercase">
                  Important Notice
                </h3>
                <p className="text-destructive text-sm">
                  Once you submit this form, your details cannot be edited
                  later. Please ensure all information is accurate before
                  submitting.
                </p>
              </div>
            </div> */}

            <form className="space-y-6 text-white" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-1 text-white"
                  >
                    <User size={14} className="inline-block" /> Full Name *
                    {form.name && (
                      <CheckCircle2 size={14} className="ml-1 text-[#9dff2c]" />
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full rounded-md bg-white/10 px-3 py-2 text-[#9dff2c] placeholder:text-[#9dff2c] hover:border-[#9dff2c]/90 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="cyberpunk-label mb-2 block">
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
                    className="form-field rounded-md px-3 py-2 text-[#9dff2c] transition-all duration-150 placeholder:text-[#9dff2c] hover:border-[#9dff2c]/70 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="phone"
                    className="cyberpunk-label mb-2 flex items-center gap-1"
                  >
                    <Phone size={14} className="inline-block" /> Phone Number *
                    {form.phone && isValidPhone(form.phone) && (
                      <CheckCircle2 size={14} className="ml-1 text-[#9dff2c]" />
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
                    className="form-field rounded-md px-3 py-2 transition-all duration-150 placeholder:text-[#9dff2c] hover:border-[#9dff2c]/70 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="college"
                    className="cyberpunk-label mb-2 flex items-center gap-1"
                  >
                    <School size={14} className="inline-block" />{" "}
                    College/University *
                    {form.college && (
                      <CheckCircle2 size={14} className="ml-1 text-[#9dff2c]" />
                    )}
                  </Label>
                  <Select
                    value={form.college}
                    onValueChange={(value) =>
                      setForm({ ...form, college: value })
                    }
                  >
                    <SelectTrigger className="form-field w-full rounded-md px-3 py-2 text-[#9dff2c] transition-all duration-150 hover:border-[#9dff2c]/70 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none active:border-[#9dff2c] data-[placeholder]:text-[#9dff2c]/70">
                      <SelectValue
                        className="font-medium text-[#9dff2c] placeholder:text-[#9dff2c]/70"
                        placeholder="Select your college"
                      />
                    </SelectTrigger>
                    <SelectContent className="border border-[#9dff2c] bg-black font-medium text-[#9dff2c]">
                      {COLLEGES.map((college, idx) => (
                        <SelectItem
                          key={idx}
                          value={college}
                          className="font-medium text-[#9dff2c] data-[highlighted]:bg-[#9dff2c]/10"
                        >
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="branch"
                    className="cyberpunk-label mb-2 flex items-center gap-1"
                  >
                    <BookOpen size={14} className="inline-block" /> Branch/Major
                    *
                    {form.branch && (
                      <CheckCircle2 size={14} className="ml-1 text-[#9dff2c]" />
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
                    className="form-field rounded-md px-3 py-2 text-[#9dff2c] transition-all duration-150 placeholder:text-[#9dff2c] hover:border-[#9dff2c]/70 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="year"
                    className="cyberpunk-label mb-2 flex items-center gap-1"
                  >
                    <Calendar size={14} className="inline-block" /> Academic
                    Year *
                    {form.year && (
                      <CheckCircle2 size={14} className="ml-1 text-[#9dff2c]" />
                    )}
                  </Label>
                  <Select
                    value={form.year ? String(form.year) : ""}
                    onValueChange={(value) =>
                      setForm({ ...form, year: Number(value) })
                    }
                  >
                    <SelectTrigger className="form-field w-full rounded-md px-3 py-2 text-[#9dff2c] transition-all duration-150 hover:border-[#9dff2c]/70 focus:border-[#9dff2c] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none active:border-[#9dff2c] data-[placeholder]:text-[#9dff2c]/70">
                      <SelectValue
                        className="font-medium text-[#9dff2c]"
                        placeholder="Select your year"
                      />
                    </SelectTrigger>
                    <SelectContent className="border border-[#9dff2c] bg-black font-medium text-[#9dff2c]">
                      <SelectItem
                        value="1"
                        className="font-medium text-[#9dff2c] data-[highlighted]:bg-[#9dff2c]/10"
                      >
                        1st Year
                      </SelectItem>
                      <SelectItem
                        value="2"
                        className="font-medium text-[#9dff2c] data-[highlighted]:bg-[#9dff2c]/10"
                      >
                        2nd Year
                      </SelectItem>
                      <SelectItem
                        value="3"
                        className="font-medium text-[#9dff2c] data-[highlighted]:bg-[#9dff2c]/10"
                      >
                        3rd Year
                      </SelectItem>
                      <SelectItem
                        value="4"
                        className="font-medium text-[#9dff2c] data-[highlighted]:bg-[#9dff2c]/10"
                      >
                        4th Year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div
                  className="animate-pulse rounded-lg border bg-black/60 p-4"
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
                      <p
                        className="text-sm"
                        style={{ color: "var(--chart-5)" }}
                      >
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="cyberpunk-btn font-orbitron flex w-auto cursor-pointer items-center justify-center gap-2 px-6 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:ring-[#9dff2c]/50 focus:outline-none active:scale-[1.02] active:bg-[#9dff2c]/90 disabled:bg-gray-700 disabled:text-gray-400 disabled:opacity-50 disabled:shadow-none"
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
        </div>
      </div>
    </div>
  );
}
