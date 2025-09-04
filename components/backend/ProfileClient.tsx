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
    <section className="font-orbitron relative flex min-h-screen items-center justify-center overflow-hidden bg-black py-12 text-white">
      {/* Background grid */}
      <div className="pointer-events-none absolute fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(#a3ff12 2px, transparent 1px),
              linear-gradient(90deg, #a3ff12 2px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
      <div className="absolute top-5 left-5 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute top-5 right-5 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
      <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" />

      {/* Back + Logout */}
      <div className="font-orbitron absolute top-10 left-10 z-20 flex gap-4">
        <ClippedButton onClick={() => router.push("/")}>Back</ClippedButton>
      </div>
      <div className="font-orbitron absolute top-10 right-10 z-20 flex gap-4">
        <ClippedButton
          onClick={handleLogout}
          innerBg="bg-red-500"
          textColor="text-white"
        >
          Logout
        </ClippedButton>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-8 py-12 sm:px-16">
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-primary text-3xl font-bold tracking-wide uppercase sm:text-4xl md:text-5xl">
            Profile
          </h1>
          <p className="mt-2 text-base text-gray-400">
            &gt; Discover hackathons and events to grow your skills and network.
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm profile={profile} />

        <div className="mt-16 mb-4 text-center">
          <h2 className="text-primary text-2xl font-bold tracking-wide uppercase">
            Explore Opportunities
          </h2>
        </div>

        {/* Cards Section */}
        <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {/* Hackathon Card */}
          <ClippedCard innerBg="bg-[#101810]">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-3 text-2xl">01</div>
              <h3 className="mb-4 text-2xl font-bold text-white">Hackathon</h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Team up, build something amazing, and compete for prizes. Join
                the hackathon to showcase your skills and push your limits!
              </p>
              <ClippedButton
                innerBg="bg-primary"
                textColor="text-black"
                asChild
              >
                <Link
                  href={
                    profile?.team_id ? "/hackathon/dashboard" : "/hackathon"
                  }
                  className="inline-flex w-full items-center justify-center py-2"
                >
                  {profile?.team_id ? "Visit Dashboard" : "Join Hackathon"}
                </Link>
              </ClippedButton>
            </div>
          </ClippedCard>

          {/* Events Card */}
          <ClippedCard innerBg="bg-[#101810]" innerHeight="h-full">
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
              <span className="font-orbitron text-primary text-xl font-bold uppercase">
                Opening Soon
              </span>
            </div>
            <div className="flex h-full flex-col p-8">
              <div className="text-primary font-amiga mb-3 text-2xl">02</div>
              <h3 className="mb-4 text-2xl font-bold text-white">Events</h3>
              <p className="mb-6 flex-grow text-sm text-gray-400">
                Explore a variety of exciting events lined up just for you. From
                workshops to talks and fun activities, there is something for
                everyone.
              </p>
              <ClippedButton
                innerBg="bg-primary"
                textColor="text-black"
                asChild
              >
                <Link
                  href="/events"
                  className="inline-flex w-full items-center justify-center py-2"
                >
                  Visit Events
                </Link>
              </ClippedButton>
            </div>
          </ClippedCard>
        </div>
      </div>
    </section>
  );
}
