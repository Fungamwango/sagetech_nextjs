import { getCurrentUser } from "@/lib/auth";
import CyberClient from "./CyberClient";

export const metadata = {
  title: "SageCyber | Ethical hacking, SQL Injection Lab, Phishing Simulator",
  description:
    "Learn ethical hacking, scan for vulnerabilities, and explore cybersecurity tools including SQL injection lab, phishing simulator, and more.",
};

export default async function CyberPage() {
  const user = await getCurrentUser();

  return (
    <CyberClient
      currentUser={user ? { id: user.id, username: user.username } : null}
    />
  );
}
