import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyProfileClient from "./MyProfileClient";

const allowedRoles = new Set(["USER", "ORGANIZER"]);

const MyProfilePage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.has(session.user.role)) {
    redirect("/");
  }

  return <MyProfileClient />;
};

export default MyProfilePage;