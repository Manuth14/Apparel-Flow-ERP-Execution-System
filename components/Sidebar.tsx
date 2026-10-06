'use client';

import { usePathname } from 'next/navigation';

// NAV items with their respective route paths
const NAV = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Cutting orders", href: "#" },
    { label: "Recipes", href: "/recipes" },           // Recipes page ekata (or dashboard)
    { label: "Inventory", href: "/inventory" },        // Inventory page eka
    { label: "Sewing lines", href: "/manager" },       // Sewing / Manager view eka
    { label: "Quality", href: "/quality" },            // Quality check page eka
    { label: "Reports", href: "/reports" },            // Reports page eka
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname(); // Get current URL path to highlight active link

    return (
        <>
            {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-900 p-4 transition-transform lg:static lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="mb-6 flex items-center gap-2.5 px-2 pt-1">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-dashed border-amber-400 text-sm font-bold text-white">A</span>
                    <span className="text-lg font-semibold text-white">ApparelFlow</span>
                </div>
                <nav aria-label="Main">
                    <ul className="space-y-1">
                        {NAV.map((item) => {
                            // Check if current page matches the link href
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`block rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                                            isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
}