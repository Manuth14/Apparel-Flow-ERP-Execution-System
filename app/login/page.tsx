"use client";

import { useState, SubmitEvent } from "react";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

/*
 * Palette
 * denim   #1B2F4E  left panel, primary button
 * chalk   #F6F5F1  page background
 * thread  #E4B23C  topstitch accent (stitch lines, focus ring, one highlight)
 * ink     #14202F  text
 * slate   #5B6676  secondary text
 */

const twill = {
    backgroundColor: "#1B2F4E",
    backgroundImage:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 7px)",
};

const stitch = {
    backgroundImage:
        "repeating-linear-gradient(90deg, #E4B23C 0 6px, transparent 6px 11px)",
};

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e: SubmitEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // TODO: replace with your auth call (NextAuth signIn / fetch to API)
            await new Promise((r) => setTimeout(r, 900));
            if (!email.includes("@")) throw new Error("Enter a valid work email.");
            if (password.length < 8) throw new Error("Password must be at least 8 characters.");
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
        } finally {
            setLoading(false);
        }
    }

    const input =
        "mt-1.5 w-full rounded-lg border border-[#D9D8D2] bg-white px-3.5 py-3 text-[15px] text-[#14202F] placeholder:text-[#9AA1AC] outline-none transition focus:border-[#1B2F4E] focus:ring-4 focus:ring-[#E4B23C]/40";

    return (
        <main
            className={`${display.variable} ${body.variable} grid min-h-screen bg-[#F6F5F1] font-[family-name:var(--font-body)] text-[#14202F] lg:grid-cols-[1.05fr_1fr]`}
        >
            {/* Brand panel */}
            <section className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex" style={twill}>
                <div className="flex items-center gap-3">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                        <rect x="1" y="1" width="30" height="30" rx="8" stroke="#E4B23C" strokeWidth="2" strokeDasharray="4 3" />
                        <path d="M10 21V11l6 6 6-6v10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">ApparelFlow</span>
                </div>

                <div className="max-w-md">
                    <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight">
                        From fabric order to finished shipment.
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-white/70">
                        Purchasing, cutting, sewing, QC and export in one place, so every style stays on schedule.
                    </p>

                    {/* Hang-tag status card: the one memorable element */}
                    <div className="mt-12 w-72 -rotate-2 rounded-xl bg-[#F6F5F1] p-5 text-[#14202F] shadow-2xl shadow-black/30">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Style ST-2418</span>
                            <span className="h-3 w-3 rounded-full border-2 border-[#1B2F4E]/30" />
                        </div>
                        <div className="mt-3 h-[2px] w-full" style={stitch} />
                        <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-[#5B6676]">Stage</dt><dd className="font-medium">Sewing, line 4</dd></div>
                            <div className="flex justify-between"><dt className="text-[#5B6676]">Completed</dt><dd className="font-medium">3,840 / 5,000 pcs</dd></div>
                            <div className="flex justify-between"><dt className="text-[#5B6676]">Ship date</dt><dd className="font-medium">24 Oct</dd></div>
                        </dl>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1B2F4E]/10">
                            <div className="h-full w-[77%] rounded-full bg-[#E4B23C]" />
                        </div>
                    </div>
                </div>

                <p className="text-sm text-white/50">© {new Date().getFullYear()} ApparelFlow. All rights reserved.</p>
            </section>

            {/* Form panel */}
            <section className="flex items-center justify-center px-6 py-12 sm:px-12">
                <div className="w-full max-w-[400px]">
                    <div className="mb-10 flex items-center gap-2.5 lg:hidden">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
                            <rect x="1" y="1" width="30" height="30" rx="8" stroke="#E4B23C" strokeWidth="2" strokeDasharray="4 3" />
                            <path d="M10 21V11l6 6 6-6v10" stroke="#1B2F4E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-[family-name:var(--font-display)] text-lg font-semibold">ApparelFlow</span>
                    </div>

                    <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Sign in</h2>
                    <p className="mt-2 text-[15px] text-[#5B6676]">Use your work account to open your production floor.</p>

                    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
                        {error && (
                            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="text-sm font-medium">Work email</label>
                            <input id="email" type="email" autoComplete="username" required value={email}
                                   onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className={input} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                <a href="/forgot-password" className="text-sm font-medium text-[#1B2F4E] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4B23C] rounded">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required
                                       value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                                       className={`${input} pr-16`} />
                                <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}
                                        className="absolute right-2 top-[calc(50%+3px)] -translate-y-1/2 rounded px-2 py-1 text-sm font-medium text-[#5B6676] hover:text-[#14202F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E4B23C]">
                                    {show ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2.5 text-sm text-[#14202F]">
                            <input type="checkbox" className="h-4 w-4 rounded border-[#D9D8D2] accent-[#1B2F4E]" />
                            Keep me signed in on this device
                        </label>

                        <button type="submit" disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B2F4E] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#14243d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60 disabled:cursor-not-allowed disabled:opacity-70">
                            {loading && (
                                <svg className="h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
                                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            )}
                            {loading ? "Signing in" : "Sign in"}
                        </button>
                    </form>

                    <div className="my-7 h-[2px] w-full opacity-70" style={stitch} aria-hidden />

                    <button type="button"
                            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#D9D8D2] bg-white px-4 py-3 text-[15px] font-medium transition hover:bg-[#FAFAF8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/40">
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                            <rect x="1" y="1" width="7.5" height="7.5" fill="#F25022"/>
                            <rect x="9.5" y="1" width="7.5" height="7.5" fill="#7FBA00"/>
                            <rect x="1" y="9.5" width="7.5" height="7.5" fill="#00A4EF"/>
                            <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#FFB900"/>
                        </svg>
                        Sign in with Microsoft
                    </button>

                    <p className="mt-8 text-center text-sm text-[#5B6676]">
                        No account? Ask your administrator for an invite.
                    </p>
                </div>
            </section>
        </main>
    );
}