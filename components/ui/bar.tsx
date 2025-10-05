import Image from "next/image";

export default function InfiniteLogoBanner() {
  const logos = [
    { src: "/logos/logo_chainsaw_man.png", alt: "Chainsaw Man" },
    { src: "/logos/logo_berserk.png", alt: "Berserk" },
    { src: "/logos/logo_vinland_saga.png", alt: "Vinland Saga" },
    { src: "/logos/logo_omiscient_readers_viewpoint.png", alt: "Omniscient Reader's Viewpoint" },
    { src: "/logos/logo_one_piece.png", alt: "One Piece" },
    { src: "/logos/logo_haikyu.png", alt: "Haikyu!!" },
    { src: "/logos/logo_shonen_jump.png", alt: "Shonen Jump" },
    { src: "/logos/logo_fma.png", alt: "Fullmetal Alchemist" },
    { src: "/logos/logo_naruto.png", alt: "Naruto" },
    { src: "/logos/logo_demon_slayer.png", alt: "Demon Slayer" },
    { src: "/logos/logo_hunter_x_hunter.png", alt: "Hunter x Hunter" },
    { src: "/logos/logo_tower_of_god.png", alt: "Tower of God" },
    { src: "/logos/logo_delicious_in_dungeon.png", alt: "Delicious in Dungeon" },

];

  return (
    <div className="relative w-full overflow-hidden py-10 bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 border-t-4 mt-10">
      {/* Manga-style comic border */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-black pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black pointer-events-none" />

      <div className="flex items-center">
        <div className="animate-scroll flex whitespace-nowrap">
          {logos.concat(logos).map((logo, i) => (
            <div
              key={i}
              className="mx-16 flex items-center justify-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-300"
            >
              <div className="relative w-32 h-16 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_#000] rounded-lg">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={200}
                  height={100}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
