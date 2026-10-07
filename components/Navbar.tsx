"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

const ROLE_LABEL: Record<string, string> = {
    cutting_supervisor: "Cutting Supervisor",
    cutting_verifier: "Cutting Verifier",
    sewing_supervisor: "Sewing Supervisor",
};

export default function Navbar({fullName, role}: { fullName: string; role: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function logout() {
        setBusy(true);
        try {
            await fetch("/api/auth/logout", {method: "POST"});
        } finally {
            router.push("/");
            router.refresh();
        }
    }

    return (
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="my-2 flex items-center gap-2.5 px-2 pt-1">
                    <span
                        className="grid h-8 w-8 place-items-center rounded-lg border-2 border-dashed border-amber-400 text-lg font-bold text-slate-900">A</span>
                    <span className="text-xl font-semibold text-slate-900">ApparelFlow</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">{fullName}</p>
                        <p className="text-xs font-medium text-blue-700">{ROLE_LABEL[role] ?? role}</p>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        disabled={busy}
                        className="w-24 h-10 rounded-lg border border-gray-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {busy ? "Signing out..." : "Log out"}
                    </button>
                </div>
            </div>
        </header>
    );
}