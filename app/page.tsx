import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Pencil, Paperclip, Star } from "lucide-react"
import MangaFeatureWidget from "../components/ui/bar";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#F2C6DE] via-[#DBCDF0] to-[#C6DEF1] -z-10" />

      <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none">
        {/* Top left panel */}
        <div className="absolute top-20 left-10 w-64 h-48 border-4 border-foreground transform -rotate-6">
          <div className="absolute top-2 right-2 w-16 h-1 bg-foreground transform -rotate-12" />
          <div className="absolute top-4 right-4 w-12 h-1 bg-foreground transform -rotate-12" />
        </div>

        {/* Top right panel */}
        <div className="absolute top-32 right-20 w-72 h-56 border-4 border-foreground transform rotate-3">
          <div className="absolute bottom-4 left-4 w-20 h-1 bg-foreground transform rotate-45" />
          <div className="absolute bottom-6 left-6 w-16 h-1 bg-foreground transform rotate-45" />
          <div className="absolute top-8 right-12 w-8 h-8 rounded-full border-2 border-foreground" />
        </div>

        {/* Bottom left panel */}
        <div className="absolute bottom-40 left-32 w-56 h-40 border-4 border-foreground transform rotate-2">
          <div className="absolute top-3 left-3 w-24 h-1 bg-foreground transform -rotate-6" />
        </div>

        {/* Bottom right panel */}
        <div className="absolute bottom-20 right-10 w-48 h-52 border-4 border-foreground transform -rotate-3">
          <div className="absolute top-6 right-6 w-16 h-1 bg-foreground transform rotate-12" />
          <div className="absolute top-8 right-8 w-12 h-1 bg-foreground transform rotate-12" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 pt-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-tight text-balance tracking-tight">
            Bring Your Manga
            <br />
            Stories to Life
          </h1>

          <Link href="/create">
            <Button
              size="lg"
              className="text-xl md:text-2xl px-12 md:px-16 py-6 md:py-8 h-auto bg-white hover:bg-gray-50 text-foreground border-4 border-foreground rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-bold"
            >
              Start Storyboarding
            </Button>
          </Link>

          <p className="pt-15 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto text-pretty font-medium">
            Transform your creative vision into professional manga storyboards with AI. Sketch, describe, and generate
            stunning panels in minutes.
          </p>
        </div>
      </section>

      <MangaFeatureWidget />
      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <CardContent className="p-8 space-y-4 relative">
              {/* Speed lines decoration */}
              <div className="absolute top-4 right-4 opacity-20">
                <div className="w-16 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-12 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-14 h-0.5 bg-foreground transform -rotate-12" />
              </div>

              {/* Speech bubble icon */}
              <div className="w-16 h-16 rounded-full bg-white border-4 border-foreground flex items-center justify-center shadow-md relative">
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-l-4 border-b-4 border-foreground transform rotate-45" />
                <Pencil className="w-7 h-7 text-foreground" strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-foreground">Describe Your Vision</h3>
              <p className="text-foreground/70 text-pretty leading-relaxed">
                Simply write out your scene descriptions, character actions, and dialogue. Our AI understands your
                creative intent.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <CardContent className="p-8 space-y-4 relative">
              {/* Speed lines decoration */}
              <div className="absolute top-4 right-4 opacity-20">
                <div className="w-16 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-12 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-14 h-0.5 bg-foreground transform -rotate-12" />
              </div>

              {/* Speech bubble icon */}
              <div className="w-16 h-16 rounded-full bg-white border-4 border-foreground flex items-center justify-center shadow-md relative">
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-l-4 border-b-4 border-foreground transform rotate-45" />
                <Paperclip className="w-7 h-7 text-foreground" strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-foreground">Upload References</h3>
              <p className="text-foreground/70 text-pretty leading-relaxed">
                Add reference images, character designs, or mood boards to guide the visual style and maintain
                consistency.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <CardContent className="p-8 space-y-4 relative">
              {/* Speed lines decoration */}
              <div className="absolute top-4 right-4 opacity-20">
                <div className="w-16 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-12 h-0.5 bg-foreground transform -rotate-12 mb-1" />
                <div className="w-14 h-0.5 bg-foreground transform -rotate-12" />
              </div>

              {/* Speech bubble icon */}
              <div className="w-16 h-16 rounded-full bg-white border-4 border-foreground flex items-center justify-center shadow-md relative">
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-l-4 border-b-4 border-foreground transform rotate-45" />
                <Star className="w-7 h-7 text-foreground" strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-foreground">Generate Panels Instantly</h3>
              <p className="text-foreground/70 text-pretty leading-relaxed">
                Watch as AI creates professional storyboard panels with dynamic compositions, perfect for pitching your
                manga.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-foreground mt-16 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/70 font-medium">© 2025 Nemu. Crafted with love.</p>
            <div className="flex gap-6">
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
