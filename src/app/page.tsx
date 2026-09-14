import { DropsHome } from "@/components/drops-home";
import { getAllOffers } from "@/lib/offers-repository";

export default async function Home() {
  const offers = await getAllOffers();
  return <DropsHome offers={offers} />;
}
