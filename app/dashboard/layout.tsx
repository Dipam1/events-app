import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboardLayoutClient";

const DashboardLayout = async ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const isOrganizer = session.user.role === "ORGANIZER" || session.user.role === "ADMIN";

    return (
        <DashboardLayoutClient isOrganizer={isOrganizer}>
            {children}
        </DashboardLayoutClient>
    );
};

export default DashboardLayout;