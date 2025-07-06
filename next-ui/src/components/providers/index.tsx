"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "../ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
