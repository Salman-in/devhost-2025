"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { ClippedButton } from "@/components/ClippedButton";
import { ClippedCard } from "@/components/ClippedCard";
import ProfileForm from "@/components/backend/ProfileForm";
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
export default function ProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <section className="font-orbitron relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a3ff12_1px,transparent_1px),linear-gradient(to_bottom,#a3ff12_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />
      </div>

      {/* Back + Logout */}
      <div className="absolute top-6 left-3 z-50 sm:top-10 sm:left-10">
        <ClippedButton onClick={() => router.push("/")}>Back</ClippedButton>
      </div>
      <div className="absolute top-6 right-3 z-50 sm:top-10 sm:right-10">
        <ClippedButton
          onClick={handleLogout}
          innerBg="bg-destructive"
          textColor="text-white"
        >
          Logout
        </ClippedButton>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-5 sm:px-15 sm:py-16">
        <div className="relative mt-20 mb-8 text-center sm:mt-0 sm:mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-[#a3ff12] uppercase sm:text-4xl md:text-5xl">
            Profile
          </h1>
        </div>

        {/* Profile Form */}
        <ProfileForm profile={profile} />

        {/* Hackathon + Events */}
        <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8">
          <ClippedCard innerBg="bg-[#101810]" className="w-full">
            <div className="mx-auto flex flex-col items-center p-6 sm:p-12">
              <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">
                Hackathon
              </h3>
              {!profile?.team_id ? (
                <ClippedButton>
                  <Link href="/hackathon">Join Hackathon</Link>
                </ClippedButton>
              ) : (
                <ClippedButton>
                  <Link href="/hackathon/dashboard">Visit</Link>
                </ClippedButton>
              )}
            </div>
          </ClippedCard>

          <ClippedCard innerBg="bg-[#101810]" className="w-full">
            <div className="mx-auto flex flex-col items-center p-6 sm:p-12">
              <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">
                Events
              </h3>
              <ClippedButton>
                <Link href="/events">Visit</Link>
              </ClippedButton>
            </div>
          </ClippedCard>
        </div>
      </div>
    </section>
  );
}
