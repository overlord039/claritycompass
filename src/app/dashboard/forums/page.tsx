import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Notebook } from "lucide-react";

export default function ForumsPage() {
    return (
        <div className="flex flex-col items-center justify-start pt-10 h-full">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                    <Notebook className="h-12 w-12 text-primary mb-4"/>
                    <CardTitle>Notes & Sessions</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-10">
                    <p className="text-muted-foreground">This is where you can manage your notes and scheduled sessions. This feature is coming soon!</p>
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
