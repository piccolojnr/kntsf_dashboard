import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Reports() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Permit Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
