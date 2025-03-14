// src/app/DashboardPage.js

import Link from "next/link";


export default function Home() {
  return (
    <div className="mt-[10rem] flex items-center justify-center">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-center">

          <div className="relative">
            <h1 className="text-xl lg:text-[4rem] drop-shadow-lg font-bold text-center bg-gradient-to-r from-blue-600 to-purple-800 text-transparent bg-clip-text">F4D Power Control</h1>
            <p className="text-neutral-400 italic lg:text-[1.3rem] drop-shadow-md text-center">Gérez vos déploiements et surveillez vos instances.</p>
            <div className="bg-neutral-100 blur-[4rem] h-[20px] w-full max-w-[600px] absolute -z-10 bottom-0 left-0 right-0 mx-auto opacity-80"></div>
          </div>

          <div className="flex justify-center w-full mt-8">
            <Link href="/deploy">
              <button className="px-6 py-3 border-2 border-blue-600 rounded-full shadow-sm bg-[#2C3E50]/40 backdrop-blur-sm hover:bg-blue-700 hover:text-white transition-all duration-300">
                Déployer Strapi
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}