"use client";

import { FormEvent, useState } from "react";
import {redirect, useRouter} from "next/navigation";

type Role = "cutting_supervisor" | "cutting_verifier" | "sewing_supervisor";

const ROLE_HOME: Record<Role, string> = {
  cutting_supervisor: "/supervisor",
  cutting_verifier: "/verifier",
  sewing_supervisor: "/sewing",
};

// Demo accounts: must match the users you create in prisma/seed.ts
const DEMO_ACCOUNTS = [
  {
    role: "cutting_supervisor" as Role,
    label: "Cutting Supervisor",
    desc: "Creates cutting orders and logs fabric",
    email: "supervisor@demo.com",
    password: "Demo@1234",
  },
  {
    role: "cutting_verifier" as Role,
    label: "Cutting Verifier",
    desc: "Counts pieces, approves or rejects batches",
    email: "verifier@demo.com",
    password: "Demo@1234",
  },
  {
    role: "sewing_supervisor" as Role,
    label: "Sewing Supervisor",
    desc: "Receives verified batches, starts sewing",
    email: "sewing@demo.com",
    password: "Demo@1234",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function signIn(e: string, p: string) {
    const next: typeof errors = {};
    if (!e.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(e)) next.email = "Enter a valid email address.";
    if (!p) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e.trim(), password: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: data?.error ?? "Sign in failed. Check your email and password." });
        return;
      }
      router.push(ROLE_HOME[data.role as Role] ?? "/");
      router.refresh();
    } catch {
      setErrors({ form: "Cannot reach the server. Try again." });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    signIn(email, password);
  }

  function useDemo(acc: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrors({});
    signIn(acc.email, acc.password);
  }

  const inputBase =
      "mt-1 block w-full rounded-md border bg-white px-3 py-2.5 text-base text-gray-900 " +
      "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700";

      redirect("/login");
}