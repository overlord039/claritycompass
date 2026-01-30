'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowRight, BookOpen, Globe, University as UniversityIcon } from 'lucide-react';
import { universities } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { University } from '@/lib/types';


const UniversityCard = ({ uni }: { uni: University }) => (
    <div className="p-2 w-72 flex-shrink-0">
        <div className="bg-background/30 rounded-lg h-full flex flex-col overflow-hidden group transition-all duration-300 hover:border-primary/30 border border-transparent hover:shadow-lg hover:shadow-primary/10">
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
);


export default function Home() {
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

      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 md:px-6">
            <div className="bg-card/40 backdrop-blur-lg rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl shadow-primary/5">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                        Explore a Curated Selection of World-Class Institutions
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        We partner with leading universities to guide you towards the best possible fit for your academic and career goals.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-background/30 p-6 rounded-lg">
                        <UniversityIcon className="h-10 w-10 mx-auto text-primary" />
                        <p className="text-4xl font-bold mt-4">{stats.universities}</p>
                        <p className="text-muted-foreground mt-1">Universities</p>
                    </div>
                    <div className="bg-background/30 p-6 rounded-lg">
                        <Globe className="h-10 w-10 mx-auto text-primary" />
                        <p className="text-4xl font-bold mt-4">{stats.countries}</p>
                        <p className="text-muted-foreground mt-1">Countries</p>
                    </div>
                    <div className="bg-background/30 p-6 rounded-lg">
                        <BookOpen className="h-10 w-10 mx-auto text-primary" />
                        <p className="text-4xl font-bold mt-4">{stats.fields}+</p>
                        <p className="text-muted-foreground mt-1">Fields of Study</p>
                    </div>
                </div>

                <div className="mt-12 w-full overflow-x-hidden relative">
                    <div
                        className="flex animate-marquee hover:[animation-play-state:paused] w-max"
                    >
                        {[...universities, ...universities].map((uni, index) => (
                           <UniversityCard uni={uni} key={`marquee-1-${index}`} />
                        ))}
                    </div>
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>
                
                <div className="mt-12 text-center">
                  <h3 className="text-xl font-bold tracking-tight text-foreground font-headline">Covering a Wide Range of Disciplines</h3>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {allFields.map((field) => (
                      <Badge key={field} variant="secondary" className="text-sm px-3 py-1 bg-background/50">{field}</Badge>
                    ))}
                  </div>
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
