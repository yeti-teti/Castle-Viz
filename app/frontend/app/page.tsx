import CastleVizLogo from "@/components/ui/castle-viz-logo";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { lusitana } from "@/components/ui/fonts";
import Image from "next/image";
import styles from '@/components/ui/home.module.css';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 homepage-bg">
      {/* <div className="mb-8">
        <div className={styles.shape}>
          <CastleVizLogo />
        </div>
      </div> */}

      <div className="w-full max-w-lg mx-auto">
        <div className="flex flex-col justify-center gap-6 rounded-xl bg-white px-8 py-12 shadow-lg border border-gray-100">
              <div className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-blue-600" />
              <div>
                <h1
                  className={`${lusitana.className} text-2xl text-gray-900 md:text-4xl md:leading-normal font-bold`}
                >
                  Castle-Viz
                </h1>
                <p className="mt-4 text-lg text-gray-600 md:text-xl">
                  Visualize your spending.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center gap-3 self-start rounded-lg bg-blue-600 px-8 py-4 text-base font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg md:text-lg"
              >
                <span>Get Started</span> 
                <ArrowRightIcon className="w-5 md:w-6" />
              </Link>
            </div>
          </div>
    </main>
  );
}
