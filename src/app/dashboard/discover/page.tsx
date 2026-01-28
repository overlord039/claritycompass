import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DiscoverPage() {
    return (
        <div className="flex flex-col items-center justify-start pt-10 h-full">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>University Discovery</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-10">
                    <p className="text-muted-foreground">This is where the university discovery and shortlisting experience will be.</p>
                    <Button asChild variant="outline" className="mt-6">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
