"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Wand2, Upload, Globe, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContentCreationOptionsProps {
  className?: string;
  showDescriptions?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ContentCreationOptions({ 
  className = "", 
  showDescriptions = true,
  size = "md"
}: ContentCreationOptionsProps) {
  const router = useRouter();
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const options = [
    {
      id: "paste-text",
      icon: FileText,
      title: "Paste in text",
      description: "Convert your existing content into a beautiful presentation",
      action: () => {
        setActiveOption("paste-text");
        // Scroll to paste text section or navigate
        document.getElementById('paste-text-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      variant: "outline" as const,
    },
    {
      id: "generate",
      icon: Wand2,
      title: "Generate",
      description: "Create presentations from scratch with AI",
      action: () => {
        setActiveOption("generate");
        document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      variant: "default" as const,
    },
    {
      id: "import",
      icon: Upload,
      title: "Import file or URL",
      description: "Upload documents or import from web content",
      action: () => {
        setActiveOption("import");
        document.getElementById('smart-import-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      variant: "outline" as const,
    },
    {
      id: "templates",
      icon: Globe,
      title: "Remix a template",
      description: "Start with professionally designed templates",
      action: () => {
        setActiveOption("templates");
        document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      variant: "outline" as const,
    },
  ];

  const sizeClasses = {
    sm: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    md: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    lg: "grid-cols-1 md:grid-cols-2",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`grid ${sizeClasses[size]} gap-4 ${className}`}>
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Card 
            key={option.id}
            className={`hover:shadow-lg transition-all cursor-pointer group ${
              activeOption === option.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={option.action}
          >
            <CardHeader className="text-center">
              <Icon 
                className={`${iconSizes[size]} mx-auto mb-2 text-primary group-hover:scale-110 transition-transform`} 
              />
              <CardTitle className={`${titleSizes[size]}`}>
                {option.title}
              </CardTitle>
              {showDescriptions && (
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Button 
                variant={option.variant}
                className="w-full"
                size={size === "sm" ? "sm" : "default"}
              >
                {option.id === "generate" ? "Start Creating" : 
                 option.id === "paste-text" ? "Start Pasting" :
                 option.id === "import" ? "Start Importing" : "Browse Templates"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
