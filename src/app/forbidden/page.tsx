'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, LayoutDashboard, Lightbulb, Lock } from 'lucide-react';

export default function ForbiddenPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let height = canvas.height = window.innerHeight;
    let width = canvas.width = window.innerWidth;

    function random(min: number, max: number) {
      return Math.random() * (max - min + 1) + min;
    }

    function range_map(value: number, in_min: number, in_max: number, out_min: number, out_max: number) {
      return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    const word_arr: Array<{ x: number; y: number; text: string; size: number }> = [];
    const txt_min_size = 5;
    const txt_max_size = 25;
    let keypress = false;
    const acclerate = 2;

    for (let i = 0; i < 25; i++) {
      word_arr.push({
        x: random(0, width),
        y: random(0, height),
        text: '403',
        size: random(txt_min_size, txt_max_size)
      });

      word_arr.push({
        x: random(0, width),
        y: random(0, height),
        text: 'forbidden',
        size: random(txt_min_size, txt_max_size)
      });

      word_arr.push({
        x: random(0, width),
        y: random(0, height),
        text: 'access denied',
        size: random(txt_min_size, txt_max_size)
      });

      word_arr.push({
        x: random(0, width),
        y: random(0, height),
        text: '403',
        size: Math.floor(random(txt_min_size, txt_max_size))
      });
    }

    let animationId: number;

    function render() {
      if (!ctx) return;

      // Use CSS variable for background color (will adapt to theme)
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim() || '0 0% 100%';
      const bgRGB = hslToRgb(bgColor);
      
      ctx.fillStyle = `rgb(${bgRGB.r}, ${bgRGB.g}, ${bgRGB.b})`;
      ctx.fillRect(0, 0, width, height);

      // Use CSS variable for text color with different opacity
      const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim() || '224 71% 4%';
      const textRGB = hslToRgb(textColor);
      
      ctx.fillStyle = `rgba(${textRGB.r}, ${textRGB.g}, ${textRGB.b}, 0.25)`;
      for (let i = 0; i < word_arr.length; i++) {
        ctx.font = word_arr[i].size + "px sans-serif";
        const w = ctx.measureText(word_arr[i].text);
        ctx.fillText(word_arr[i].text, word_arr[i].x, word_arr[i].y);

        if (keypress) {
          word_arr[i].x += range_map(word_arr[i].size, txt_min_size, txt_max_size, 2, 4) * acclerate;
        } else {
          word_arr[i].x += range_map(word_arr[i].size, txt_min_size, txt_max_size, 2, 3);
        }

        if (word_arr[i].x >= width) {
          word_arr[i].x = -w.width * 2;
          word_arr[i].y = random(0, height);
          word_arr[i].size = Math.floor(random(txt_min_size, txt_max_size));
        }
      }

      ctx.fill();
      animationId = requestAnimationFrame(render);
    }

    // Helper to convert HSL to RGB
    function hslToRgb(hsl: string): { r: number; g: number; b: number } {
      const parts = hsl.split(' ').map(p => parseFloat(p));
      const h = parts[0] / 360;
      const s = parts[1] / 100;
      const l = parts[2] / 100;

      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    }

    render();

    const handleKeyDown = () => {
      keypress = true;
    };

    const handleKeyUp = () => {
      keypress = false;
    };

    const handleResize = () => {
      height = canvas.height = window.innerHeight;
      width = canvas.width = window.innerWidth;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 block m-0 p-0"
      />
      
      {/* Overlay content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-6">
        <Card className="border border-border/50 bg-card/40 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center mb-2">
              <Lock className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-7xl font-bold font-headline text-destructive">
              403
            </h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Access Forbidden
            </h2>
            <p className="text-muted-foreground">
              You don't have permission to access this resource.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              <span className="italic">Press any key to speed up the animation</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

