import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from 'lucide-react'

export function RetrospectiveAlert() {
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Retrospective Action Required</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <Button size="sm" variant="outline">Complete Retrospective</Button>
      </AlertDescription>
    </Alert>
  )
}

