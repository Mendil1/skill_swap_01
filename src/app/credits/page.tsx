import { Metadata } from "next";
import CreditsPage from "./components/credits-page";

export const metadata: Metadata = {
  title: "Credits - SkillSwap",
  description: "View your credit balance and transaction history",
};

export default function Page() {
  return <CreditsPage />;
}
