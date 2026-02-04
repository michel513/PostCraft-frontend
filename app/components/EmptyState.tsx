import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200", className)}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 mb-4">
                <Icon className="h-6 w-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>
            {action && (
                <Button onClick={action.onClick} className="mt-6">
                    {action.label}
                </Button>
            )}
        </div>
    );
}