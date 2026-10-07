import { requirePageRole } from "@/lib/guard";

export default async function VerifierLayout({ children }: { children: React.ReactNode }) {
    await requirePageRole("cutting_verifier");
    return <>{children}</>;
}