'use client'

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");

    async function handleSubmit() {
        setErrorText("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/",
        });

        if (result?.error) {
            setErrorText("Invalid email or password");
            return;
        }

        window.location.href = "/";
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-16">
            <div className="mx-auto flex max-w-6xl flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-2xl text-white shadow-md">
                    🏢
                </div>

                <h1 className="mt-6 text-4xl font-bold text-gray-900">
                    Welcome Back
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                    Sign in to access your workspace reservations
                </p>

                <div className="mt-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    {errorText && (
                        <p className="mt-4 text-sm text-red-500">{errorText}</p>
                    )}

                    <button onClick={handleSubmit} className="mt-6 w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-blue-600">
                        Sign In →
                    </button>

                    <div className="my-8 h-px w-full bg-gray-200"></div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">Don&apos;t have an account?</p>
                        <Link
                            href="/register"
                            className="mt-2 inline-block text-sm font-medium text-blue-500 hover:underline"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                    Your information is secure and encrypted
                </p>
            </div>
        </main>
    );
}