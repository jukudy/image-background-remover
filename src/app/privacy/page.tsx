import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Clearcut handles images, processing, logs, and analytics.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your data" title="Privacy Policy" updated="July 15, 2026">
    <section><h2>What this service does</h2><p>Clearcut lets you upload an image and sends it to Remove.bg for automated background removal. The processed PNG is returned directly to your browser.</p></section>
    <section><h2>Image handling</h2><p>We do not intentionally persist your original image or processed result in a database, object store, or file system. Images exist temporarily during network transfer, within the request lifecycle, and in your browser memory. Remove.bg processes images under its own current privacy policy and terms.</p></section>
    <section><h2>Security and abuse prevention</h2><p>We use Cloudflare Turnstile and basic rate limiting to protect the service. These systems may process technical information such as IP address, browser details, and request timing. We do not log image bodies, filenames, API keys, or secrets.</p></section>
    <section><h2>Analytics</h2><p>We may collect anonymous, aggregated product events such as whether an upload was selected, rejected, processed, or downloaded. Analytics must not include images, filenames, or information that can reconstruct an image.</p></section>
    <section><h2>Retention</h2><p>We do not provide image history. Closing or resetting the page releases browser preview URLs, and you should download your result before leaving.</p></section>
    <section><h2>Contact</h2><p>Questions about privacy can be sent to <a className="font-medium text-emerald-900 underline" href="mailto:hello@clearcut.app">hello@clearcut.app</a>.</p></section>
  </LegalPage>;
}
