import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Navbar from "@/components/Navbar";

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) redirect("/");

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ colorScheme: "light" }}>
            <Navbar fullName={session.fullName} role={session.role} />
            <main className="mx-auto w-full">{children}</main>
        </div>
    );
}