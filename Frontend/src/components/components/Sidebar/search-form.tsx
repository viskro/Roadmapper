import { Search } from "lucide-react"
import * as React from "react"
import { Label } from "@/components/ui/label"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
} from "@/components/ui/sidebar"

// Supprimons l'héritage de React.ComponentProps<"form">
export function SearchForm({
    onChange
}: {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                    <Label htmlFor="search" className="sr-only">
                        Search
                    </Label>
                    <SidebarInput
                        id="search"
                        placeholder="Rechercher..."
                        className="pl-8"
                        onChange={onChange}
                    />
                    <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
                </SidebarGroupContent>
            </SidebarGroup>
        </form>
    );
}
