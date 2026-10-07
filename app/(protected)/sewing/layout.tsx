import { requirePageRole } from "@/lib/guard";

export default async function SewingLayout({ children }: { children: React.ReactNode }) {
    await requirePageRole("sewing_supervisor");
    return <>{children}</>;
}