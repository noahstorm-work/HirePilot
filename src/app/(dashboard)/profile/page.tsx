import type { Metadata } from "next"
import { ProfileClient } from "./client"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your career profile, CV, links, and account settings.",
}

export default function ProfilePage() {
  return <ProfileClient />
}