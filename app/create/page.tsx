"use client"

import type React from "react"


import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { ArrowLeft, Upload, X, Sparkles } from "lucide-react"

export default function CreatePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [panels, setPanels] = useState("4")
  const [style, setStyle] = useState("shonen")
  const [illustrationImages, setIllustrationImages] = useState<string[]>([])
  const [characterImages, setCharacterImages] = useState<string[]>([])
  const [characterNames, setCharacterNames] = useState<string[]>([])
  const [errors, setErrors] = useState({
    prompt: "",
    panels: "",
    images: "",
    backend: ""  // Add backend error state
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleIllustrationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setIllustrationImages((prev) => [...prev, ...newImages])
    }
  }

  const handleCharacterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setCharacterImages((prev) => [...prev, ...newImages])
      setCharacterNames((prev) => [...prev, ...Array(files.length).fill("")])
    }
  }

  const removeIllustrationImage = (index: number) => {
    setIllustrationImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeCharacterImage = (index: number) => {
    setCharacterImages((prev) => prev.filter((_, i) => i !== index))
    setCharacterNames((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCharacterNameChange = (index: number, name: string) => {
    setCharacterNames((prev) => {
      const updated = [...prev]
      updated[index] = name
      return updated
    })
  }

  const handleCreate = async () => {
    // Validate form
    const newErrors = {
      prompt: "",
      panels: "",
      images: "",
      backend: "",
    }

    if (!prompt.trim()) {
      newErrors.prompt = "Story prompt is required"
    }

    if (!panels || Number(panels) < 1 || Number(panels) > 12) {
      newErrors.panels = "Please enter a valid number of panels (1-12)"
    }

    setErrors(newErrors)

    // Check if there are any errors
    if (newErrors.prompt || newErrors.panels || newErrors.images) {
      return
    }

    setIsLoading(true)

    try {
      // Convert illustration images to File objects
      const illustrationFiles = await Promise.all(
        illustrationImages.map(async (imageUrl, index) => {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          return new File([blob], `illustration-${index}.png`, { type: blob.type })
        })
      )

      // Convert character images to File objects
      const characterFiles = await Promise.all(
        characterImages.map(async (imageUrl, index) => {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          return new File([blob], `character-${index}.png`, { type: blob.type })
        })
      )

      // Create FormData
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("panels", panels)
      formData.append("style", style)

      // Append illustration images
      illustrationFiles.forEach((file) => {
        formData.append("illustration_images", file)
      })

      // Append character images
      characterFiles.forEach((file) => {
        formData.append("character_images", file)
      })

      // Append character names (ensure at least one entry for FastAPI validation)
      if (characterNames.length > 0) {
        characterNames.forEach((name) => {
          formData.append("character_names", name)
        })
      }

      // Send to backend
      const response = await fetch("http://127.0.0.1:8000/api/get-story-board", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        if (data.status === "success") {
          // Store panel data in sessionStorage to pass to results page
          const panelData = {
            panels: data.panels,  // Base64 encoded panel images
            coordinates: data.coordinates,  // Panel positions [x, y]
            total_size: data.total_size,  // Original image dimensions [width, height]
            panel_count: data.panel_count,
            n8n_data: data.n8n_data,
            original_prompt: prompt,
            style: style,
            panels_requested: panels
          }

          sessionStorage.setItem('storyboardData', JSON.stringify(panelData))

          // Navigate to results page with panel data
          router.push("/results")
        } else {
          console.error("Backend returned error:", data.error || data.message)
          setErrors(prev => ({ ...prev, backend: data.error || data.message || "Unknown error occurred" }))
          setIsLoading(false)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to generate storyboard:", errorData.message || response.statusText)
        setErrors(prev => ({ ...prev, backend: errorData.message || response.statusText || "Failed to connect to server" }))
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error creating storyboard:", error)
      setIsLoading(false)
    }
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
      <header className="border-b-2 border-transparent bg-transparent backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 max-w-7xl mx-auto">
          {/* Left Column - Main Creation Area */}
          <div className="space-y-6">

            <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <CardHeader className="relative">
                <div className="absolute inset-y-0 right-238 items-center justify-center w-70 h-10 -rotate-5">
                  <img
                    src="/highlight_yellow.png"
                    alt="Background"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                <CardTitle className="text-2xl font-black text-foreground relative">Create Your Storyboard</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4 relative">
                {/* Story Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-base font-medium text-foreground">
                    Story Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    name="prompt"
                    placeholder="e.g., A young samurai facing a mythical oni under a full moon in a bamboo forest..."
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      setErrors((prev) => ({ ...prev, prompt: "", backend: "" }))
                    }}
                    className="min-h-[200px] resize-none bg-input border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  {errors.prompt && <p className="text-sm text-red-500">{errors.prompt}</p>}
                  <p className="text-sm text-muted-foreground">
                    Describe your scene, characters, actions, and mood in detail.
                  </p>
                </div>

                {/* Settings */}
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="panels" className="text-base font-medium text-foreground">
                      Number of Panels
                    </Label>
                    <Input
                      id="panels"
                      name="panels"
                      type="number"
                      min="1"
                      max="12"
                      value={panels}
                      onChange={(e) => {
                        setPanels(e.target.value)
                        setErrors((prev) => ({ ...prev, panels: "", backend: "" }))
                      }}
                      className="bg-input border-2 border-border focus:border-primary text-foreground"
                    />
                    {errors.panels && <p className="text-sm text-red-500">{errors.panels}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-base font-medium text-foreground">
                      Art Style
                    </Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-input border-2 border-border focus:border-primary text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shonen">Shonen</SelectItem>
                        <SelectItem value="shojo">Shojo</SelectItem>
                        <SelectItem value="chibi">Chibi</SelectItem>
                        <SelectItem value="ink-wash">Ink Wash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reference Area */}
          <div className="space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <CardHeader className="relative">
                  <div className="absolute top-0 right-87 flex items-center justify-center w-60 h-12 -rotate-3">
                    <img
                      src="/highlight_green.png"
                      alt="Background"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground relative">Contextualise your art!</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4 relative">
                  {/* Upload Box */}
                  <label htmlFor="file-upload" className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground mb-1">Upload reference images</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleIllustrationUpload}
                      className="hidden"
                    />
                  </label>

                  {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}

                  {/* Uploaded Images Grid */}
                  {illustrationImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {illustrationImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-border"
                          />
                          <button
                            onClick={() => removeIllustrationImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>



              <Card className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <CardHeader className="relative">
                  <div className="absolute top-0 right-89 flex items-center justify-center w-60 h-12 -rotate-3">
                    <img
                      src="/highlight_pink.png"
                      alt="Background"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground relative">Add your Characters!</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4 relative">
                  {/* Upload Box */}
                  <label htmlFor="character-upload" className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground mb-1">Upload character images</p>
                      <p className="text-xs text-muted-foreground">PNG or JPG</p>
                    </div>
                    <input
                      id="character-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleCharacterUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded Character Images with Name Inputs */}
                  {characterImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {characterImages.map((image, index) => (
                        <div key={index} className="relative group space-y-2">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Character ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-border"
                          />
                          <Input
                            type="text"
                            placeholder={`Character ${index + 1} Name`}
                            value={characterNames[index] || ""}
                            onChange={(e) => handleCharacterNameChange(index, e.target.value)}
                            className="bg-input border-2 border-border focus:border-primary text-foreground"
                          />
                          <button
                            onClick={() => removeCharacterImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.backend && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-red-600 font-medium">Error:</div>
                <div className="text-red-700 ml-2">{errors.backend}</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="max-w-7xl mx-auto mt-8">
          <Button
            onClick={handleCreate}
            disabled={isLoading}
            size="lg"
            className="w-full text-lg py-6 h-auto bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-sakura-foreground border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
