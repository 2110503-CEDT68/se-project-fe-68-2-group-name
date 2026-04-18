'use client'

import Link from "next/link";
import { useState } from "react";
import userRegister from "@/libs/userRegister";

export default function RegisterPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit() {
    try {
      setErrorText("");

      if (!name || !email || !tel || !password || !confirmPassword) {
        setErrorText("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        setErrorText("Passwords do not match");
        return;
      }

      if (!acceptTerms) {
        setErrorText("Please accept the terms and conditions");
        return;
      }

      await userRegister(name, email, tel, password);

      window.location.href = "/login";
    } catch (error) {
      setErrorText("Registration failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-500">
          👤
        </div>

        <h1 className="mt-6 text-4xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Join CoWorkHub and start booking your ideal workspace
        </p>

        <div className="mt-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500">
              I agree to the <span className="text-blue-500">Terms of Service</span>
              <br />
              and <span className="text-blue-500">Privacy Policy</span>
            </p>
          </div>

          {errorText && (
            <p className="mt-4 text-sm text-red-500">{errorText}</p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-6 w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-blue-600"
          >
            Create Account
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Already have an account?</p>
            <Link
              href="/login"
              className="mt-2 inline-block text-sm font-medium text-blue-500 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By creating an account, you agree to our terms and conditions
        </p>
      </div>
    </main>
  );
}