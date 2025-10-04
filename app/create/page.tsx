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
  const [prompt, setPrompt] = useState("woof")
  const [panels, setPanels] = useState("4")
  const [style, setStyle] = useState("shonen")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setUploadedImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    // Navigate to results page
    router.push("/results")
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-border bg-header/75 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
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
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 max-w-7xl mx-auto">
          {/* Left Column - Main Creation Area */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="washi-tape washi-tape-peach text-sm font-medium text-foreground">✏️ New Storyboard</div>
            </div>

            <Card className="card-tinted-blue">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Create Your Storyboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px] resize-none bg-input border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
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
                      onChange={(e) => setPanels(e.target.value)}
                      className="bg-input border-2 border-border focus:border-primary text-foreground"
                    />
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
            <div className="inline-block">
              <div className="washi-tape washi-tape-mint text-sm font-medium text-foreground">📎 References</div>
            </div>

            <Card className="card-tinted-mint">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Add Illustration History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Images Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          onClick={() => removeImage(index)}
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

        {/* Create Button */}
        <div className="max-w-7xl mx-auto mt-8">
          <Button
            onClick={handleCreate}
            size="lg"
            className="w-full text-lg py-6 h-auto bg-sakura hover:bg-sakura/90 text-sakura-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Now
          </Button>
        </div>
      </div>
    </div>
  )
}
