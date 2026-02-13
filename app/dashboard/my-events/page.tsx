import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyEventsClient from "./MyEventsClient";

export default async function MyEventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ORGANIZER") {
    redirect("/dashboard/my-profile");
  }

  return <MyEventsClient />;
}