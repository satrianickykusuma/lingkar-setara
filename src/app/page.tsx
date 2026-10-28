import { ClosingCta } from "@/components/sections/ClosingCta";
import { Hero } from "@/components/sections/Hero";
import { Impact } from "@/components/sections/Impact";
import { Menus } from "@/components/sections/Menus";
import { Story } from "@/components/sections/Story";

export default function Home() {
  return (
    <main id="main" className="pt-20">
      <Hero />
      <Story />
      <Menus />
      <Impact />
      <ClosingCta />
    </main>
  );
}
