import { format } from 'date-fns'
import { Users, FileCheck, Calendar, Clock, BarChart3, Plus, Download } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/lib/auth/auth.context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import CreatePermitForm from './permit/create-permit-form'
import { toast } from 'sonner'
interface DashboardStats {
  totalStudents: number
  activePermits: number
  expiringSoon: number
  totalRevenue: number
}
export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activePermits: 0,
    expiringSoon: 0,
    totalRevenue: 0
  })
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const permissions = usePermissions()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fetchStats = useCallback(async () => {
    try {
      const response = await window.api.dashboard.getStats()
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        toast.error(response.error || 'Failed to fetch dashboard statistics')
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error)
      toast.error('Failed to fetch dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])
  const utilizationRate =
    stats.totalStudents > 0 ? (stats.activePermits / stats.totalStudents) * 100 : 0

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const quickActions = [
    {
      title: 'New Permit',
      description: 'Create a new permit application',
      icon: Plus,
      action: () => setIsPermitDialogOpen(true)
    },
    {
      title: 'View Permits',
      description: 'View all permit applications',
      icon: FileCheck,
      action: () => navigate('/permits')
    },
    {
      title: 'Manage Students',
      description: 'View and manage student records',
      icon: Users,
      action: () => navigate('/students')
    },
    {
      title: 'Download Reports',
      description: 'Generate and download reports',
      icon: Download,
      action: () => navigate('/settings/reports')
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your permit management dashboard</p>
          {user && (
            <div className="mt-1 text-lg font-semibold">
              {getGreeting()}, {user.username}!
            </div>
          )}
        </div>
        <Button onClick={() => fetchStats()} disabled={isLoading} className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="transition-colors cursor-pointer hover:bg-accent/50"
            onClick={action.action}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
              <action.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {permissions.canViewStudents() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered students in the system</p>
            </CardContent>
          </Card>
        )}
        {permissions.canViewPermits() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Permits</CardTitle>
              <FileCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePermits}</div>
              <p className="text-xs text-muted-foreground">Currently active permits</p>
            </CardContent>
          </Card>
        )}
        {permissions.canViewPermits() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <FileCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringSoon}</div>
              <p className="text-xs text-muted-foreground">Permits expiring in 7 days</p>
            </CardContent>
          </Card>
        )}
        {permissions.canViewReports() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <FileCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total revenue from permits</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key metrics and system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Permit Utilization</span>
                <span className="text-sm text-muted-foreground">{utilizationRate.toFixed(1)}%</span>
              </div>
              <Progress value={utilizationRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Revenue per Student</p>
                <p className="text-2xl font-bold">
                  GHS{' '}
                  {stats.totalStudents > 0
                    ? (stats.totalRevenue / stats.totalStudents).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Permit Rate</p>
                <p className="text-2xl font-bold">
                  {stats.totalStudents > 0
                    ? ((stats.activePermits / stats.totalStudents) * 100).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link to="/permits">
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck className="w-6 h-6" />
                    <span>Manage Permits</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link to="/students">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span>View Students</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link to="/settings/reports">
                  <div className="flex flex-col items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>View Reports</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4"
                onClick={() => (window.location.href = '/settings')}
              >
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>Settings</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {permissions.canCreatePermits() && (
        <Dialog open={isPermitDialogOpen} onOpenChange={setIsPermitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permit</DialogTitle>
              <DialogDescription>Create a new permit for a student</DialogDescription>
            </DialogHeader>
            <CreatePermitForm
              onSuccess={() => {
                setIsPermitDialogOpen(false)
              }}
              setIsDialogOpen={setIsPermitDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">{format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-sm font-medium text-green-600">All Systems Operational</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Database Status</p>
              <p className="text-sm font-medium text-green-600">Connected</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
