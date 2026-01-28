import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function JourneyPage() {
    return (
        <div className="flex flex-col items-center justify-start pt-10 h-full">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Your Journey</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-10">
                    <p className="text-muted-foreground">This is where a detailed view of your application journey will be.</p>
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
