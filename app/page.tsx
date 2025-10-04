import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Pencil, Upload, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Nemu</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Washi tape label */}
          <div className="inline-block">
            <div className="washi-tape text-sm font-medium text-foreground">✨ AI-Powered Storyboarding</div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            Bring Your Manga
            <br />
            <span className="text-primary">Stories to Life</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Transform your creative vision into professional manga storyboards with AI. Sketch, describe, and generate
            stunning panels in minutes.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <Card className="sketch-border bg-card hover:shadow-lg transition-shadow duration-300 transform hover:-rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-washi-mint flex items-center justify-center">
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
          <Card className="sketch-border bg-card hover:shadow-lg transition-shadow duration-300 transform hover:rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-washi-peach flex items-center justify-center">
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
          <Card className="sketch-border bg-card hover:shadow-lg transition-shadow duration-300 transform hover:-rotate-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-washi-lavender flex items-center justify-center">
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            The Future of Storyboarding is Here
          </h2>

          <Link href="/create">
            <Button
              size="lg"
              className="text-lg px-12 py-6 h-auto bg-sakura hover:bg-sakura/90 text-sakura-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Simplify your storyboarding
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground">No credit card required • Start creating in seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 MangaBoard. Crafted with creativity.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
