import { Bricolage_Grotesque, Figtree } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${display.variable} ${body.variable} font-[family-name:var(--font-body)]`}>
            {children}
        </div>
    );
}