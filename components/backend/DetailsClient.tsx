"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClippedCard } from "@/components/ClippedCard";
import { ClippedButton } from "../ClippedButton";

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
  ArrowRight,
  Loader2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { COLLEGES } from "@/lib/constants";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number | null;
}

const formFieldClass =
  "w-full h-12 px-3 py-2 text-white text-sm leading-5 rounded-md";

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredColleges = COLLEGES.filter((college) =>
    college.toLowerCase().includes(search.toLowerCase()),
  );

  const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone);

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
    if (!isValidPhone(form.phone)) {
      toast.error("Invalid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex min-h-screen items-center justify-center bg-black py-8 text-white">
      <div className="font-orbitron w-full max-w-3xl px-4">
        <ClippedCard innerBg="bg-[#101810]">
          <div className="flex w-full flex-col p-6 text-white sm:p-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <User className="text-primary h-6 w-6" />
                Complete Your Profile
              </h2>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="name">Full Name *</Label>
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    disabled
                    className={`${formFieldClass} cursor-not-allowed bg-black/20`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    className={formFieldClass}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* College - Full Width Row */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="college">College/University *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      role="combobox"
                      variant={"outline"}
                      aria-expanded={open}
                      aria-haspopup="listbox"
                      className="flex h-12 w-full items-center justify-between rounded-md bg-black/30 px-3 text-sm text-gray-400 hover:text-gray-300"
                    >
                      {form.college || "Select your College"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-2xl rounded-md border bg-[#101810] p-0"
                    sideOffset={4}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search college..."
                        value={search}
                        onValueChange={setSearch}
                        className="h-9 rounded-t-md px-3 text-white"
                        autoFocus
                      />
                      <CommandList>
                        {filteredColleges.length === 0 && (
                          <CommandEmpty className="p-3 text-center text-gray-500">
                            No colleges found.
                          </CommandEmpty>
                        )}
                        <CommandGroup>
                          {filteredColleges.map((college, idx) => (
                            <CommandItem
                              key={idx}
                              value={college}
                              onSelect={(currentValue) => {
                                setForm({ ...form, college: currentValue });
                                setOpen(false);
                                setSearch("");
                              }}
                              className="hover:bg-primary cursor-pointer truncate px-3 py-2 text-gray-300 hover:text-black"
                            >
                              {college}
                              {form.college === college && (
                                <Check className="text-primary ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Branch + Year */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="branch">Branch/Major *</Label>
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select
                    value={form.year ? String(form.year) : ""}
                    onValueChange={(value) =>
                      setForm({ ...form, year: Number(value) })
                    }
                  >
                    <SelectTrigger className={formFieldClass}>
                      <SelectValue placeholder="Select your Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                          {["st", "nd", "rd", "th"][year - 1]} Year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-6">
                <ClippedButton
                  type="submit"
                  disabled={isSaving || saved || completionPercentage < 100}
                  className="flex items-center gap-2 font-bold tracking-wider uppercase"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
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
