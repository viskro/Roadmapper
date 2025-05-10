import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RoadmapCardProps {
    name: string;
    description: string;
    slug: string;
    onClick: () => void;
}

export default function RoadmapCard({ name, description, onClick }: RoadmapCardProps) {
    return (
        <Card
            onClick={onClick}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 ease-in-out" // Enhanced hover effect
        >
            <CardHeader>
                <CardTitle className="text-xl font-semibold">{name}</CardTitle> {/* Use font-semibold */}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p> {/* Use smaller text and muted-foreground */}
            </CardContent>
        </Card>
    );
}
