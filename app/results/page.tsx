"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft, RefreshCw, Edit, Sparkles } from "lucide-react"

export default function ResultsPage() {
  const panels = [
    {
      id: 1,
      title: "Panel 1",
      description:
        "Wide establishing shot of a moonlit bamboo forest. Shadows dance between the tall stalks as mist rolls across the ground. The full moon hangs heavy in the sky.",
      image: "/moonlit-bamboo-forest-manga-style.jpg",
      colorTheme: "blue",
    },
    {
      id: 2,
      title: "Panel 2",
      description:
        "Close-up of the young samurai's determined face. Sweat beads on his forehead, his hand grips the katana handle. His eyes reflect the moonlight with fierce resolve.",
      image: "/young-samurai-close-up-manga-style.jpg",
      colorTheme: "peach",
    },
    {
      id: 3,
      title: "Panel 3",
      description:
        "The mythical oni emerges from the shadows, towering and menacing. Its red skin glows in the moonlight, horns piercing the sky. Steam rises from its nostrils.",
      image: "/mythical-oni-demon-manga-style.jpg",
      colorTheme: "pink",
    },
    {
      id: 4,
      title: "Panel 4",
      description:
        "Dynamic action shot as the samurai leaps forward, katana raised high. Motion lines emphasize the speed and power of the attack. Bamboo leaves scatter in the wind.",
      image: "/samurai-action-leap-manga-style.jpg",
      colorTheme: "lavender",
    },
  ]

  const getCardClass = (theme: string) => {
    const themeMap: Record<string, string> = {
      blue: "card-tinted-blue",
      peach: "card-tinted-peach",
      pink: "card-tinted-pink",
      lavender: "card-tinted-lavender",
      mint: "card-tinted-mint",
      yellow: "card-tinted-yellow",
    }
    return themeMap[theme] || ""
  }

  const getWashiColor = (theme: string) => {
    const colorMap: Record<string, string> = {
      blue: "#C6DEF1",
      peach: "#F7D9C4",
      pink: "#F2C6DE",
      lavender: "#DBCDF0",
      mint: "#C9E4DE",
      yellow: "#FAEDCB",
    }
    return colorMap[theme] || "#C9E4DE"
  }

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

      {/* Header */}
      <header className="border-b-2 border-border bg-header/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/create"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Create</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#C9E4DE] to-[#C6DEF1] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Nemu</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8 space-y-4">
          <div className="inline-block">
            <div className="washi-tape washi-tape-lavender text-sm font-medium text-foreground">✨ Generated</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Storyboard Creation</h1>
          <p className="text-muted-foreground">
            Review your generated panels below. You can regenerate individual panels or make them editable.
          </p>
        </div>

        {/* Panels Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {panels.map((panel, index) => (
            <Card
              key={panel.id}
              className={`sketch-border ${getCardClass(panel.colorTheme)} hover:shadow-lg transition-all duration-300 h-100`}
              style={{
                transform: index % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)",
              }}
            >
              <CardHeader>
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full text-foreground flex items-center justify-center text-xs font-bold shadow-md"
                    style={{ background: getWashiColor(panel.colorTheme) }}
                  >
                    {panel.id}
                  </span>
                  {panel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative overflow-hidden rounded-lg border-2 border-border h-40">
                  <img src={panel.image || "/placeholder.svg"} alt={panel.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed text-pretty">{panel.description}</p>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-none border-2 border-border hover:bg-muted text-foreground text-xs px-2 py-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate me
                </Button>
                <Button className="flex-none bg-[#f8f8f8] hover:bg-sakura/90 text-sakura-foreground text-xs px-2 py-1">
                  <Edit className="w-3 h-3 mr-1" />
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
        </div>
      </div>
    </div>
  )
}
