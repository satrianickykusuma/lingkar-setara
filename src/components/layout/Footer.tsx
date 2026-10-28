import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { closingCta, contact, footerContact, footerUtility, site, social, whatsappHref } from "@/data/content";

/**
 * Site footer: a sage-to-cream gradient band with cream line-art ornaments, blue
 * pill headings, the address, social accounts, contact details and a map.
 *
 * The map is a local SVG (no API key) and is labelled as an illustration, not a
 * navigable map.
 */
export function Footer() {
  return (
    <footer
      id="kontak"
      className="band-gradient relative isolate overflow-hidden border-t border-line-strong/40 pt-10 pb-16"
    >
      <Ornaments />

      <div className="container-page relative z-10 flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="flex max-w-sm flex-col gap-4">
          <FooterHeading>Lingkar Setara</FooterHeading>
          <Image
            src={site.logo}
            alt={`Logo ${site.name}`}
            width={490}
            height={490}
            className="size-28 rounded-pill bg-card/50 p-1 shadow-card backdrop-blur-sm"
          />
          <p className="text-sm font-medium leading-relaxed text-ink">
            {closingCta.address}
          </p>
        </div>

        <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
          <div className="flex flex-col gap-3">
            <FooterHeading>Media Sosial</FooterHeading>
            <ul className="flex flex-col gap-2.5">
              {social.map((account) => (
                <li key={account.id}>
                  <a
                    href={account.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm font-bold text-ink underline-offset-4 hover:underline"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-card/70 text-ocean">
                      <Icon name={account.icon} className="size-4" />
                    </span>
                    {account.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <FooterHeading>Hubungi Kami</FooterHeading>
            <ul className="flex flex-col gap-2 text-sm font-bold text-ink">
              <li className="flex items-center gap-2">
                <Icon name="whatsapp" className="size-4 shrink-0 text-ocean" />
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  WhatsApp / SMS: {contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="mail" className="size-4 shrink-0 text-ocean" />
                <a
                  href={`mailto:${closingCta.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  pos-el: {closingCta.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-ink-muted">
                <Icon name="clock" className="size-4 shrink-0 text-ocean" />
                {closingCta.hours}
              </li>
            </ul>

            <div className="mt-2 flex flex-col gap-2">
              {footerContact.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm font-bold text-ink underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-80">
            <FooterHeading>Lokasi Kami</FooterHeading>
            <div className="relative h-52 overflow-hidden rounded-card border border-line-strong/60 bg-card shadow-card">
              <Image
                src="/images/peta-gorontalo.svg"
                alt="Peta lokasi Lingkar Setara di Jalan Tondano, Kota Gorontalo"
                fill
                sizes="320px"
                className="object-cover"
              />
              <a
                href={footerContact[0]?.mapsHref ?? "#kontak"}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-btn bg-card px-3 py-2 text-xs font-bold text-ocean shadow-card transition-transform active:scale-95"
              >
                Buka di Maps
                <Icon name="externalLink" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page relative z-10 mt-10">
        <div className="flex flex-col gap-4 border-t border-line-strong/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold tracking-wide text-ink">{footerUtility[0]}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Real target, unlike the placeholder labels beside it: photo credits
                are a licence obligation, so the link must actually work. */}
            <li>
              <Link
                href="/kredit"
                className="text-sm font-bold text-ocean underline-offset-4 hover:underline"
              >
                Kredit foto
              </Link>
            </li>
            {footerUtility.slice(1).map((label) => (
              <li key={label}>
                <Link
                  href="#kontak"
                  className="text-sm font-bold text-ink underline-offset-4 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="w-fit rounded-btn bg-ocean px-4 py-1.5 font-display text-base font-bold leading-tight tracking-tight text-on-brand shadow-sm">
      {children}
    </h2>
  );
}

/**
 * Cream line-art filling the gradient band's empty corners: rings top-left,
 * a branch bottom-right, waves beside the brand column, sparkles in the middle
 * gutter and an orbit ring in the bottom-right whitespace.
 */
function Ornaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <LineArt motif="orbit" tone="cream" opacity="opacity-60" className="-top-12 -left-12 size-64" />
      <LineArt motif="botanical" tone="cream" opacity="opacity-60" className="top-14 left-56 hidden size-40 xl:block" />
      <LineArt motif="wave" tone="cream" opacity="opacity-55" className="-bottom-16 right-8 size-72" />
      <LineArt motif="sparkle" tone="cream" opacity="opacity-45" className="bottom-32 left-1/3 size-48" />
      <LineArt motif="ripples" tone="cream" opacity="opacity-35" className="right-1/4 -bottom-20 hidden size-56 lg:block" />
      <LineArt motif="orbit" tone="sage" opacity="opacity-25" className="top-1/3 right-1/2 hidden size-40 xl:block" />

      {/* A market basket between the columns. Kept clear of the copy and of the
          legal row: an ornament must never sit underneath text. */}
      <Ingredient
        shape="herb"
        tone="sage"
        opacity="opacity-25"
        className="top-1/2 left-[45%] hidden size-20 2xl:block"
      />
      <Ingredient3D
        shape="lime"
        volume="citrus"
        className="right-[22%] bottom-28 hidden size-20 -rotate-12 xl:block"
      />
    </div>
  );
}
