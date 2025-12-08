import { locales } from "@i18n/config";
import { redirect } from "next/navigation";

// This page only renders when the user visits the root URL
// It redirects to the default locale
export default function RootPage() {
  redirect(`/${locales[0]}`);
}
