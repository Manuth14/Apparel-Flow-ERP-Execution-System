import { requirePageRole } from "@/lib/guard";

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
    await requirePageRole("cutting_supervisor");
    return <>{children}</>;
}