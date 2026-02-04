import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
    text?: string;
}

export function LoadingSpinner({ size = 24, text, className, ...props }: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2", className)} {...props}>
            <Loader2 className="animate-spin text-sky-600" size={size} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );
}