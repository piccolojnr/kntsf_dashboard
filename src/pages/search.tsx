import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileCheck, Users } from 'lucide-react'

interface SearchResult {
  id: number
  type: 'permit' | 'student'
  title: string
  description: string
  date: string
}

export function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return

      setLoading(true)
      try {
        // Search in permits
        const permitsResponse = await window.api.permit.getAll({ search: query })
        const permits =
          permitsResponse.success && permitsResponse.data
            ? permitsResponse.data.data.map((permit: any) => ({
                id: permit.id,
                type: 'permit' as const,
                title: `Permit #${permit.id}`,
                description: `Status: ${permit.status}`,
                date: new Date(permit.createdAt).toLocaleDateString()
              }))
            : []

        // Search in students
        const studentsResponse = await window.api.student.getAll({ search: query })
        const students =
          studentsResponse.success && studentsResponse.data
            ? studentsResponse.data.data.map((student: any) => ({
                id: student.id,
                type: 'student' as const,
                title: student.name,
                description: `ID: ${student.studentId}`,
                date: new Date(student.createdAt).toLocaleDateString()
              }))
            : []

        setResults([...permits, ...students])
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query])

  const permits = results.filter((result) => result.type === 'permit')
  const students = results.filter((result) => result.type === 'student')

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
      <p className="text-muted-foreground">Showing results for &quot;{query}&quot;</p>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({results.length})</TabsTrigger>
          <TabsTrigger value="permits">Permits ({permits.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Card key={`${result.type}-${result.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.type === 'permit' ? (
                      <FileCheck className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {result.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{result.description}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Created: {result.date}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No results found</p>
          )}
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          {loading ? (
            <p>Loading permits...</p>
          ) : permits.length > 0 ? (
            permits.map((permit) => (
              <Card key={`permit-${permit.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    {permit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{permit.description}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Created: {permit.date}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No permits found</p>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {loading ? (
            <p>Loading students...</p>
          ) : students.length > 0 ? (
            students.map((student) => (
              <Card key={`student-${student.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {student.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{student.description}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Created: {student.date}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No students found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
