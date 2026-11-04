import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { brand } from "@/lib/brand";
import { pageMeta } from "@/lib/site";
import { restaurantLd, websiteLd } from "@/lib/structured-data";
import { Hero } from "@/components/home/Hero";
import { PizzaAssembly } from "@/components/home/PizzaAssembly";
import { SignatureReel } from "@/components/home/Reel";
import { BurgerDrop, CrepeLab } from "@/components/home/Scenes2";
import { BestSellers, BuildYourOwn, ChefSignature, Combos, FlavorSwitch, FreshIngredients } from "@/components/home/Scenes3";
import { Drinks, FaqSection, Favorites, FinalCta, KitchenStory, LocationsSection, Marquee, OffersSection, SectionRail, SweetFinale } from "@/components/home/Scenes4";

export const metadata: Metadata = pageMeta({ title: `${brand.name} – Pizza, Crepes & Burgers`, path: "/" });

export default function Home() {
  return (
    <>
      <JsonLd data={[restaurantLd(), websiteLd()]} />
      <SectionRail />
      <div id="hero"><Hero /></div>
      <Marquee />
      <PizzaAssembly />
      <SignatureReel />
      <CrepeLab />
      <BurgerDrop />
      <FlavorSwitch />
      <ChefSignature />
      <FreshIngredients />
      <BuildYourOwn />
      <BestSellers />
      <Combos />
      <SweetFinale />
      <Drinks />
      <KitchenStory />
      <Favorites />
      <LocationsSection />
      <OffersSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
