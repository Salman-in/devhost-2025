"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [phone, setPhone] = useState("");
    const [college, setCollege] = useState("");
    const [year, setYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userId = user?.uid;
            const email = user?.email;
            const displayName = user?.displayName;
            if (!userId || !email || !displayName) throw new Error("Missing user information");

            const body = {
                id: userId,
                email,
                displayName,
                phone,
                college,
                year,
                hasFilled: true,
                teamId: ""
            };

            // Use POST to create user
            const res = await fetch(`/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Failed to create profile");

            router.push("/profile");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Complete Your Profile</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <label className="block text-sm font-medium">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-1 block w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">College</label>
                    <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        required
                        className="mt-1 block w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Year Studying In</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                        className="mt-1 block w-full border rounded-md p-2"
                    >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md font-medium"
                >
                    {loading ? "Saving..." : "Save & Continue"}
                </button>
            </form>
        </div>
    );
}
