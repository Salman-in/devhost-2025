"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClippedButton } from "@/components/ClippedButton";
import { ClippedCard } from "@/components/ClippedCard";
import ProfileForm from "@/components/backend/ProfileForm";
import { useAuth } from "@/context/AuthContext";
// import Image from "next/image";
//import { useState } from "react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  // const [selectedSize, setSelectedSize] = useState<string>(""); // commented out

  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <section className="font-orbitron relative flex min-h-screen items-center justify-center overflow-hidden bg-black py-12 text-white">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-10">
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

      {/* Back + Logout */}
      <div className="font-orbitron absolute top-4 left-4 z-20 flex gap-4 md:top-10 md:left-10">
        <ClippedButton onClick={() => router.push("/")}>Back</ClippedButton>
      </div>
      <div className="font-orbitron absolute top-4 right-4 z-20 flex gap-4 md:top-10 md:right-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <ClippedButton innerBg="bg-red-500" textColor="text-white">
              Logout
            </ClippedButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-primary border-2">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? Any unsaved changes will be
                lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel className="bg-red-500 text-white hover:bg-red-500/80">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-red-500 text-white hover:bg-red-500/80"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8">
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
          <ClippedCard innerBg="bg-[#101810]" innerHeight="h-full">
            <div className="flex h-full flex-col border p-8">
              <div className="text-primary font-amiga mb-3 text-2xl">01</div>
              <h3 className="mb-4 text-2xl font-bold text-white">Hackathon</h3>
              <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-400">
                Team up, build something amazing, and compete for prizes. Join
                the hackathon to showcase your skills and push your limits!
              </p>
              <p className="mb-6 text-sm text-gray-400">
                {/* Registration closes on{" "}
                <span className="font-semibold text-white">
                  September 30, 2025
                </span> */}
                Registration Deadline Extended to{" "}
                <span className="font-bold text-white">
                  October 15, 2025
                </span>{" "}
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
            {/* <div className="bg-opacity-90 pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black">
              <span className="font-orbitron text-primary text-xl font-bold uppercase">
                Coming Soon
              </span>
            </div> */}
            <div className="flex h-full flex-col p-8">
              <div className="text-primary font-amiga mb-3 text-2xl">02</div>
              <h3 className="mb-4 text-2xl font-bold text-white">Events</h3>
              <p className="mb-6 flex-grow text-sm leading-relaxed text-gray-400">
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

          {/* Shirt Card - Coming Soon */}
          {/* <ClippedCard
            innerBg="bg-[#101810]"
            innerHeight="h-full"
            className="relative w-full md:col-span-2"
          >
            <div className="bg-opacity-90 pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black">
              <span className="font-orbitron text-primary text-xl font-bold uppercase">
                Coming Soon
              </span>
            </div>

            <div className="flex flex-col gap-6 px-4 py-6 sm:flex-row sm:px-12">
              <div
                className="relative w-full flex-shrink-0 overflow-hidden sm:w-1/2"
                style={{
                  minHeight: "500px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  src="/event/blazingfingers.webp"
                  alt="DevHost 2025 Tee"
                  fill
                  draggable={false}
                  style={{
                    clipPath:
                      "polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="flex flex-1 flex-col px-6 py-8 sm:px-12">
                <div className="flex flex-1 flex-col space-y-8">
                  <div className="border-b border-gray-700 pb-6">
                    <div className="text-primary font-amiga mb-2 text-2xl">
                      03
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-white">
                      DevHost 2025 Tee
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      Exclusive event shirt for DevHost 2025!{" "}
                      <span className="font-bold text-white">
                        Shortlisted hackathon teams get it for free
                      </span>
                      . Others can purchase their preferred size below and
                      collect it at the venue.
                    </p>
                  </div>

                  <div className="border-b border-gray-700 pb-6">
                    <div className="flex justify-between gap-3">
                      <button className="flex-1 cursor-not-allowed rounded bg-gray-700 px-5 py-3 font-semibold text-gray-300">
                        S
                      </button>
                      <button className="flex-1 cursor-not-allowed rounded bg-gray-700 px-5 py-3 font-semibold text-gray-300">
                        M
                      </button>
                      <button className="flex-1 cursor-not-allowed rounded bg-gray-700 px-5 py-3 font-semibold text-gray-300">
                        L
                      </button>
                      <button className="flex-1 cursor-not-allowed rounded bg-gray-700 px-5 py-3 font-semibold text-gray-300">
                        XL
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">Coming Soon...</p>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-6">
                  <ClippedButton
                    innerBg="bg-gray-500"
                    textColor="text-black"
                    className="w-full cursor-not-allowed rounded py-3 font-semibold opacity-70"
                    disabled
                  >
                    Finalize
                  </ClippedButton>
                </div>
              </div>
            </div>
          </ClippedCard> */}
        </div>
      </div>
    </section>
  );
}
