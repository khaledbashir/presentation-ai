"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePresentationState } from "@/states/presentation-state";
import { Wand2, FileText, Upload, Globe, Sparkles, Zap, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEmptyPresentation } from "@/app/_actions/presentation/presentationActions";
import Link from "next/link";
import { ContentCreationOptions } from "@/components/presentation/dashboard/ContentCreationOptions";
import { SmartContentImport } from "@/components/presentation/dashboard/SmartContentImport";

export default function Home() {
  const router = useRouter();
  const { setPresentationInput, setCurrentPresentation, setIsGeneratingOutline, language, theme } = usePresentationState();
  const [prompt, setPrompt] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic for your presentation");
      return;
    }

    setIsGenerating(true);
    setIsGeneratingOutline(true);

    try {
      const result = await createEmptyPresentation(
        prompt.substring(0, 50) || "Untitled Presentation",
        theme,
        language,
      );

      if (result.success && result.presentation) {
        setCurrentPresentation(result.presentation.id, result.presentation.title);
        setPresentationInput(prompt);
        router.push(`/presentation/generate/${result.presentation.id}`);
      } else {
        toast.error(result.message || "Failed to create presentation");
      }
    } catch (error) {
      console.error("Error creating presentation:", error);
      toast.error("Failed to create presentation");
    } finally {
      setIsGenerating(false);
      setIsGeneratingOutline(false);
    }
  };

  const handlePasteText = () => {
    if (!pastedText.trim()) {
      toast.error("Please paste some text");
      return;
    }
    
    setPresentationInput(pastedText);
    router.push("/presentation");
  };

  const examplePrompts = [
    "Create a presentation about sustainable energy solutions",
    "Design a pitch deck for a mobile app startup",
    "Make a tutorial on machine learning basics",
    "Build a company overview presentation",
    "Create a product launch presentation"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Presentation AI</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/presentation" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            How would you like to get started?
          </p>
        </div>

        {/* Content Creation Options */}
        <ContentCreationOptions className="mb-16" />

        {/* Generate Section */}
        <section id="generate-section" className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Generate with AI</CardTitle>
              <CardDescription>
                Describe what you want to create and our AI will build it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label htmlFor="prompt-input" className="text-sm font-medium">
                  What do you want to create?
                </label>
                <Textarea
                  id="prompt-input"
                  placeholder="e.g., Create a presentation about renewable energy sources for a college audience"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Example Prompts */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Example prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((examplePrompt, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setPrompt(examplePrompt)}
                    >
                      {examplePrompt}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Paste Text Section */}
        <section id="paste-text-section" className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Paste Your Content</CardTitle>
              <CardDescription>
                Transform your existing text into a stunning presentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <label htmlFor="paste-input" className="text-sm font-medium">
                  Paste your content here
                </label>
                <Textarea
                  id="paste-input"
                  placeholder="Paste your article, notes, or any text content here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <Button 
                onClick={handlePasteText}
                disabled={!pastedText.trim()}
                className="w-full"
                variant="outline"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Presentation from Text
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Import Section */}
        <section id="smart-import-section" className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Import Files & URLs</CardTitle>
              <CardDescription>
                Upload documents or import content from the web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartContentImport />
            </CardContent>
          </Card>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why choose Presentation AI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of content creation with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI transforms your ideas into professional presentations in seconds
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Go from concept to completion in minutes, not hours
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Collaborative</h3>
                <p className="text-muted-foreground">
                  Work together with your team in real-time
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Presentation AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
