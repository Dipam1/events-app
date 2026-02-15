import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyMessagesClient from "./MyMessagesClient";
const allowedRoles = new Set(["USER", "ORGANIZER"]);

export default async function MyProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!allowedRoles.has(session.user.role)) {
        redirect("/");
    }

    return (<>
        <MyMessagesClient />
    </>)

}
