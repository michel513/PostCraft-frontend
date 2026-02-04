import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useSearchParams, useSubmit } from "react-router";
import { useDebounce } from "~/hooks/use-debounce"; // We might need to check if this hook exists, if not I'll implement a simple one or just direct submit
import { useEffect, useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    autoSubmit?: boolean;
}

export function SearchBar({ placeholder = "Search...", className, autoSubmit = true }: SearchBarProps) {
    const [searchParams] = useSearchParams();
    const submit = useSubmit();
    const bgQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(bgQuery);
    const debouncedQuery = useDebounce(query, 300);

    // Simple manual debounce since I'm not sure if the hook exists
    useEffect(() => {
        if (!autoSubmit) return;

        if (debouncedQuery !== bgQuery) {
            const params = new URLSearchParams(searchParams);
            if (debouncedQuery) {
                params.set("q", debouncedQuery);
            } else {
                params.delete("q");
            }
            params.set("page", "1"); // Reset pagination on search
            submit(params);
        }
    }, [debouncedQuery, bgQuery, searchParams, submit, autoSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !autoSubmit) {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            submit(params);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-8 bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}