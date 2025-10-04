import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft, RefreshCw, Edit, Sparkles } from "lucide-react"

export default function ResultsPage() {
  // Mock data for generated panels
  const panels = [
    {
      id: 1,
      title: "Panel 1",
      description:
        "Wide establishing shot of a moonlit bamboo forest. Shadows dance between the tall stalks as mist rolls across the ground. The full moon hangs heavy in the sky.",
      image: "/moonlit-bamboo-forest-manga-style.jpg",
    },
    {
      id: 2,
      title: "Panel 2",
      description:
        "Close-up of the young samurai's determined face. Sweat beads on his forehead, his hand grips the katana handle. His eyes reflect the moonlight with fierce resolve.",
      image: "/young-samurai-close-up-manga-style.jpg",
    },
    {
      id: 3,
      title: "Panel 3",
      description:
        "The mythical oni emerges from the shadows, towering and menacing. Its red skin glows in the moonlight, horns piercing the sky. Steam rises from its nostrils.",
      image: "/mythical-oni-demon-manga-style.jpg",
    },
    {
      id: 4,
      title: "Panel 4",
      description:
        "Dynamic action shot as the samurai leaps forward, katana raised high. Motion lines emphasize the speed and power of the attack. Bamboo leaves scatter in the wind.",
      image: "/samurai-action-leap-manga-style.jpg",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/create"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Create</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MangaBoard</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8 space-y-4">
          <div className="inline-block">
            <div
              className="washi-tape text-sm font-medium text-foreground"
              style={{ background: "var(--washi-lavender)" }}
            >
              ✨ Generated
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Storyboard Creation</h1>
          <p className="text-muted-foreground">
            Review your generated panels below. You can regenerate individual panels or make them editable.
          </p>
        </div>

        {/* Panels Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {panels.map((panel, index) => (
            <Card
              key={panel.id}
              className="sketch-border bg-card hover:shadow-lg transition-all duration-300"
              style={{
                transform: index % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {panel.id}
                  </span>
                  {panel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative overflow-hidden rounded-lg border-2 border-border">
                  <img src={panel.image || "/placeholder.svg"} alt={panel.title} className="w-full h-64 object-cover" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{panel.description}</p>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-border hover:bg-muted text-foreground bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate me
                </Button>
                <Button className="flex-1 bg-sakura hover:bg-sakura/90 text-sakura-foreground">
                  <Edit className="w-4 h-4 mr-2" />
                  Make me editable
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-2 border-border hover:bg-muted text-foreground bg-transparent"
          >
            Export Storyboard
          </Button>
          <Link href="/create" className="flex-1">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Create New Storyboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
