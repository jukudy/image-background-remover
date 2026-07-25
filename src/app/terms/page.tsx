import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using the Clearcut background remover.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <LegalPage eyebrow="Service terms" title="Terms of Use" updated="July 15, 2026">
    <section><h2>Acceptance</h2><p>By using Clearcut, you agree to these terms and to applicable laws. If you do not agree, do not upload an image or use the service.</p></section>
    <section><h2>Your content</h2><p>You must have the necessary rights and permissions to upload and process an image. You remain responsible for the source image and your use of the output.</p></section>
    <section><h2>Acceptable use</h2><ul><li>Do not upload illegal, abusive, exploitative, or privacy-invasive material.</li><li>Do not bypass verification, rate limits, or other abuse controls.</li><li>Do not use automated requests or resell access to this service.</li></ul></section>
    <section><h2>Third-party processing</h2><p>Background removal is provided by Remove.bg. Availability, processing quality, commercial rights, and provider-side data handling are subject to its current terms and policies.</p></section>
    <section><h2>Availability and warranties</h2><p>The service is provided on an “as is” and “as available” basis. Processing may fail or be unavailable, and we do not guarantee uninterrupted access or a particular result.</p></section>
    <section><h2>Changes</h2><p>We may update these terms as the service changes. Continued use after an update means you accept the revised terms.</p></section>
  </LegalPage>;
}
