import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
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
      <footer className="p-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Clarity Compass. A hackathon prototype.
      </footer>
    </div>
  );
}
