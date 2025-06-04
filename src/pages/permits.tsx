import { Permit } from '@prisma/client'
import { format } from 'date-fns'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { sendRevokedPermitEmail } from '../lib/email/permit-email-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import CreatePermitForm from './permit/create-permit-form'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'
import { MyPagination } from '@/components/common/my-pagination'

type SafePermit = Permit & {
  student: {
    name: string
    studentId: string
  }
  issuedBy?: {
    username: string
  }
}

export function Permits() {
  const permissions = usePermissions()
  const [permits, setPermits] = useState<SafePermit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadPermits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter])

  const loadPermits = async () => {
    try {
      const response = await window.api.permit.getAll({
        page: currentPage,
        pageSize,
        search: searchQuery,
        status: statusFilter
      })
      if (response.success && response.data) {
        setPermits(response.data.data)
        setTotalPages(response.data.totalPages)
      } else {
        console.error('Failed to load permits:', response.error)
        toast.error(response.error || 'Failed to load permits')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load permits')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (permitId: number) => {
    if (!permissions.canRevokePermits()) {
      toast.error("You don't have permission to revoke permits")
      return
    }

    if (!confirm('Are you sure you want to revoke this permit?')) return

    try {
      const response = await window.api.permit.revoke(permitId)
      if (response.success && response.data) {
        // Send revocation email
        await sendRevokedPermitEmail(
          {
            email: response.data.student.email,
            name: response.data.student.name,
            studentId: response.data.student.studentId,
            course: response.data.student.course,
            level: response.data.student.level
          },
          {
            id: response.data.id + '',
            amountPaid: response.data.amountPaid,
            expiryDate: new Date(response.data.expiryDate)
          },
          response.data.originalCode
        )

        toast.success('Permit revoked successfully')
        loadPermits()
      } else {
        toast.error(response.error || 'Failed to revoke permit')
      }
    } catch (error) {
      console.error('Error revoking permit:', error)
      toast.error('Failed to revoke permit')
    }
  }

  const isExpired = (expiryDate: Date): boolean => {
    const now = new Date()
    const isExpired = now > expiryDate

    if (isExpired) {
      return true
    }
    return false
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Permits</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permits..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          {permissions.canCreatePermits() && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Permit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Permit</DialogTitle>
                  <DialogDescription>Create a new permit for a student</DialogDescription>
                </DialogHeader>
                <CreatePermitForm onSuccess={loadPermits} setIsDialogOpen={setIsDialogOpen} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permit Code</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Issued By</TableHead>
                {permissions.canRevokePermits() && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : permits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No permits found
                  </TableCell>
                </TableRow>
              ) : null}
              {isLoading
                ? null
                : permits.map((permit) => {
                    const isPermitExpired = isExpired(permit.expiryDate)
                    const status = isPermitExpired ? 'expired' : permit.status
                    return (
                      <TableRow key={permit.id}>
                        <TableCell className="font-medium">{permit.originalCode}</TableCell>
                        <TableCell>
                          <Link
                            to={`/students/${permit.student.studentId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {permit.student.name} ({permit.student.studentId})
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              permit.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : permit.status === 'revoked'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{format(new Date(permit.startDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(permit.expiryDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>GHS {permit.amountPaid.toFixed(2)}</TableCell>
                        <TableCell>{permit.issuedBy?.username || 'Unknown'}</TableCell>
                        {permissions.canRevokePermits() && (
                          <TableCell>
                            {permit.status === 'active' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevoke(permit.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
