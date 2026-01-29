'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowRight, BookOpen, Globe, University as UniversityIcon } from 'lucide-react';
import { universities } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  const stats = {
    universities: universities.length,
    countries: [...new Set(universities.map(u => u.country))].length,
    fields: [...new Set(universities.flatMap(u => u.fields))].length
  };

  const allFields = [...new Set(universities.flatMap(u => u.fields))];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6">
        <Logo />
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="relative flex flex-col items-center justify-center text-center p-4">
          <div className="absolute inset-0.5 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl font-headline">
            Plan your study-abroad journey with a guided AI counsellor.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            From confusion to clarity. Clarity Compass is a stage-based decision system that guides you intentionally through every step of your university application process.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="font-semibold text-base">
              <Link href="/signup">
                Get Started
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="font-semibold text-base">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <section className="py-16 sm:py-24 bg-background/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                  Explore a Curated Selection of World-Class Institutions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                  We partner with leading universities to guide you towards the best possible fit for your academic and career goals.
              </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg">
                  <UniversityIcon className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-4xl font-bold mt-4">{stats.universities}</p>
                  <p className="text-muted-foreground mt-1">Universities</p>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg">
                  <Globe className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-4xl font-bold mt-4">{stats.countries}</p>
                  <p className="text-muted-foreground mt-1">Countries</p>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg">
                  <BookOpen className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-4xl font-bold mt-4">{stats.fields}+</p>
                  <p className="text-muted-foreground mt-1">Fields of Study</p>
              </div>
          </div>

          <div className="mt-16">
              <Carousel
                  plugins={[plugin.current]}
                  opts={{
                      align: "start",
                      loop: true,
                  }}
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                  className="w-full"
              >
                  <CarouselContent>
                      {universities.map((uni, index) => (
                          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                              <div className="p-1">
                                  <div className="bg-card/30 backdrop-blur-sm rounded-lg h-full flex flex-col overflow-hidden group">
                                      <div className="relative w-full h-40">
                                          <Image
                                              src={uni.imageUrl}
                                              alt={uni.name}
                                              fill
                                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                                              data-ai-hint={uni.imageHint}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                      </div>
                                      <div className="p-4 text-center">
                                          <h3 className="font-semibold text-base">{uni.name}</h3>
                                          <p className="text-muted-foreground text-xs">{uni.country}</p>
                                      </div>
                                  </div>
                              </div>
                          </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
              </Carousel>
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Covering a Wide Range of Disciplines</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {allFields.map((field) => (
                <Badge key={field} variant="secondary" className="text-sm px-4 py-1">{field}</Badge>
              ))}
            </div>
          </div>

        </div>
      </section>

      <footer className="p-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Clarity Compass. A hackathon prototype.
      </footer>
    </div>
  );
}
