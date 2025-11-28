import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
