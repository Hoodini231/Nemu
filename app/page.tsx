import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Pencil, Upload, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-border bg-header/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C9E4DE] to-[#C6DEF1] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Nemu</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-2 md:py-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            Bring Your Manga
            <br />
            <span className="bg-black bg-clip-text text-transparent">
              Stories to Life
            </span>
          </h2>

          <Link href="/create">
            <Button
              size="lg"
              className="text-lg px-10 py-3 h-auto bg-header hover:bg-sakura text-sakura-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Try now!
            </Button>
          </Link>

          <p className="text-lg md:text-xl pt-8 text-muted-foreground max-w-2xl mx-auto text-pretty ">
            Transform your creative vision into professional manga storyboards with AI. Sketch, describe, and generate
            stunning panels in minutes.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="container mx-auto px-4 py-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <Card className="sketch-border card-tinted-mint hover:shadow-lg transition-shadow duration-300 transform hover:-rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C9E4DE] flex items-center justify-center shadow-md">
                <Pencil className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Describe Your Vision</h3>
              <p className="text-muted-foreground text-pretty">
                Simply write out your scene descriptions, character actions, and dialogue. Our AI understands your
                creative intent.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="sketch-border card-tinted-pink hover:shadow-lg transition-shadow duration-300 transform hover:rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F2C6DE] flex items-center justify-center shadow-md">
                <Upload className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Upload References</h3>
              <p className="text-muted-foreground text-pretty">
                Add reference images, character designs, or mood boards to guide the visual style and maintain
                consistency.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="sketch-border card-tinted-lavender hover:shadow-lg transition-shadow duration-300 transform hover:-rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#DBCDF0] flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Generate Panels Instantly</h3>
              <p className="text-muted-foreground text-pretty">
                Watch as AI creates professional storyboard panels with dynamic compositions, perfect for pitching your
                manga.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Nemu @HackHarvard. Crafted with creativity.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
