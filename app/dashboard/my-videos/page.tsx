import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyVideosClient from "./MyVideosClient";
const allowedRoles = new Set(["USER", "ORGANIZER"]);

const Page = async () => {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!allowedRoles.has(session.user.role)) {
        redirect("/");
    }

    return <MyVideosClient />;
}

export default Page