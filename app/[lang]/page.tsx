import { JsonLd } from "@/components/seo/JsonLd";
import { staticPageMetadata, staticPages } from "@/lib/page-meta";
import { pageLocale } from "@/lib/site";
import { restaurantLd, webPageLd, websiteLd } from "@/lib/structured-data";
import { Hero } from "@/components/home/Hero";
import { PizzaAssembly } from "@/components/home/PizzaAssembly";
import { SignatureReel } from "@/components/home/Reel";
import { BurgerDrop, CrepeLab } from "@/components/home/Scenes2";
import { BestSellers, BuildYourOwn, ChefSignature, Combos, FlavorSwitch, FreshIngredients } from "@/components/home/Scenes3";
import { Drinks, FaqSection, Favorites, FinalCta, KitchenStory, LocationsSection, Marquee, OffersSection, SectionRail, SweetFinale } from "@/components/home/Scenes4";

export const generateMetadata = staticPageMetadata("/");

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = await pageLocale(params);
  return (
    <>
      <JsonLd data={[restaurantLd(lang), websiteLd(), webPageLd(lang, "/", staticPages["/"][lang].title)]} />
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
