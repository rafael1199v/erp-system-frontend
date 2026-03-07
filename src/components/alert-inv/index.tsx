import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { AlertTriangleIcon } from "lucide-react"


interface AlertProps {
    title: string,
    description: string
}

export function AlertInv({ title, description } : AlertProps) {
  return (
    <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  )
}
