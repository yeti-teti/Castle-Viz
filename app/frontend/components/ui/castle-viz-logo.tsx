import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/components/ui/fonts";

export default function CastleVizLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <BuildingOfficeIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Castle-Viz</p>
    </div>
  );
}
