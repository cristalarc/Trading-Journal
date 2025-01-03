import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">65%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">72%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">128</div>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 flex items-center justify-center">
            Chart placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

