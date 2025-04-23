import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RoadmapCardProps {
    name: string;
    description: string;
    slug: string;
    onClick: () => void;
}

export default function RoadmapCard({ name, description, onClick }: RoadmapCardProps) {
    return (
        <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{description}</p>
            </CardContent>
        </Card>
    );
}