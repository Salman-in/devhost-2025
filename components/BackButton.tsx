"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/events")}
      className="fixed top-4 left-0 ml-2 rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-400"
      type="button"
    >
      ← Back{" "}
    </button>
  );
}
