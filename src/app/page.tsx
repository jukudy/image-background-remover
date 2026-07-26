import Link from "next/link";
import { BackgroundRemover } from "@/components/background-remover";
import { SiteHeader } from "@/components/site-header";

const steps = [
  { number: "01", title: "Upload", text: "Choose a JPG, PNG, or WebP image up to 20MB." },
  { number: "02", title: "Remove", text: "Our processing provider detects the subject and removes the background." },
  { number: "03", title: "Download", text: "Preview the result and save a full-resolution transparent PNG." },
];

const benefits = [
  ["No signup", "Start immediately without creating an account."],
  ["No watermark", "Your downloaded PNG is clean and ready to use."],
  ["High-quality result", "Keep fine edges and the original image resolution."],
  ["Privacy-aware", "This website does not persistently store your images."],
];

const useCases = ["Product photos", "Portraits", "Pets", "Cars", "Logos"];

export const faqs = [
  ["How do I remove the background from an image?", "Upload a supported image, complete the verification when shown, and select Remove Background. You can compare the original and result before downloading a transparent PNG."],
  ["Is this background remover free?", "The current MVP can be used without payment while processing capacity is available. Usage limits may change as the service evolves."],
  ["Do I need to create an account?", "No. You can upload, process, and download an image without signing up."],
  ["Which image formats are supported?", "JPG, JPEG, PNG, and WebP images are supported, with a maximum file size of 20MB."],
  ["Are my images stored?", "This website does not persistently store your original or processed image. Images are sent securely to Remove.bg for processing and remain subject to its current privacy policy."],
  ["Why did background removal fail?", "The subject may be difficult to detect, the file may be invalid, or the processing provider may be temporarily unavailable. Try a clearer image or try again later."],
  ["Can I use the result commercially?", "Your use of the result depends on your rights to the source image and the processing provider's current terms. Review those terms before commercial use."],
];

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clearcut",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    description: "Remove image backgrounds online and download transparent PNG files.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Clearcut",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    email: "hello@clearcut.app",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-5 pb-18 pt-16 lg:px-8 lg:pb-24 lg:pt-22">
          <div className="hero-glow" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900 shadow-sm">
                <span className="size-1.5 rounded-full bg-[#74b840]" />
                Fast, simple, transparent
              </div>
              <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-[4.4rem]">
                Remove Image Background <span className="text-[#3e725f]">Online for Free</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
                Automatically remove backgrounds from photos in seconds. No signup. No watermark. Transparent PNG.
              </p>
            </div>
            <div id="tool" className="scroll-mt-28 pt-10">
              <BackgroundRemover />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-slate-600">
              {["No signup required", "No website watermark", "Images are not stored"].map((item) => (
                <span key={item} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-800">✓</span>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="examples-heading" className="border-t border-slate-200 bg-white px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">See the difference</p>
              <h2 id="examples-heading" className="section-title mx-auto">Clean subjects, ready for whatever comes next.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Preview the original and transparent result side by side before downloading.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {[
                { title: "Portraits", kind: "portrait" },
                { title: "Product photos", kind: "product" },
              ].map((example) => (
                <article key={example.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-[#f8faf7] p-3 shadow-sm">
                  <div className="grid min-h-72 grid-cols-2 overflow-hidden rounded-[1.15rem]" aria-label={`${example.title} before and after illustration`}>
                    <div className="demo-before relative grid place-items-center overflow-hidden"><span className={`demo-subject demo-${example.kind}`} aria-hidden="true" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">Before</span></div>
                    <div className="checkerboard relative grid place-items-center overflow-hidden"><span className={`demo-subject demo-${example.kind}`} aria-hidden="true" /><span className="absolute left-3 top-3 rounded-full bg-[#143c32] px-3 py-1 text-xs font-semibold text-white">After</span></div>
                  </div>
                  <h3 className="px-3 pb-2 pt-5 text-lg font-semibold text-slate-950">{example.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="eyebrow">Simple by design</p>
              <h2 className="section-title">From photo to transparent PNG in three steps.</h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="group rounded-3xl border border-slate-200 bg-[#fbfcfa] p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5">
                  <div className="mb-12 font-mono text-sm text-[#4d806b]">{step.number}</div>
                  <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow">Made for real work</p>
              <h2 className="section-title">A clean cut for every kind of subject.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Create ready-to-use assets for stores, social posts, presentations, and design tools—without installing software.</p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {useCases.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">{item}</span>)}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map(([title, text], index) => (
                <article key={title} className={`rounded-3xl p-6 ${index === 0 ? "bg-[#143c32] text-white" : "border border-slate-200 bg-white"}`}>
                  <div className={`mb-8 grid size-10 place-items-center rounded-xl text-lg ${index === 0 ? "bg-white/10 text-[#b8f36b]" : "bg-emerald-50 text-emerald-800"}`}>✓</div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className={`mt-2 leading-6 ${index === 0 ? "text-emerald-50/75" : "text-slate-600"}`}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[#eaf1e9] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="eyebrow">Questions, answered</p>
              <h2 className="section-title">Everything you need to know.</h2>
              <p className="mt-5 text-slate-600">Still have a question? Reach us at <a className="font-medium text-emerald-900 underline underline-offset-4" href="mailto:hello@clearcut.app">hello@clearcut.app</a>.</p>
            </div>
            <div className="divide-y divide-slate-300/70 border-y border-slate-300/70">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700">
                    {question}<span className="text-xl font-light text-emerald-900 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pt-3 leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#102f28] px-5 py-10 text-sm text-emerald-50/70 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><span className="font-semibold text-white">clearcut</span><span className="ml-3">© {new Date().getFullYear()} Clearcut.</span></div>
          <nav className="flex gap-6"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><a href="mailto:hello@clearcut.app" className="hover:text-white">Contact</a></nav>
        </div>
      </footer>
    </>
  );
}
