import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Permission, Role } from '@prisma/client'
interface PermissionWithRoles extends Permission {
  id: number
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  roles: {
    role: Role
  }[]
}
export function Permissions() {
  const [permissions, setPermissions] = useState<PermissionWithRoles[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<PermissionWithRoles | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const response = await window.api.permission.getAll()
      if (response.success) {
        setPermissions(response.permission || [])
      } else {
        toast.error(response.error || 'Failed to load permissions')
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = selectedPermission
        ? await window.api.permission.update(selectedPermission.id, formData)
        : await window.api.permission.create(formData)

      if (response.success) {
        toast.success(`Permission ${selectedPermission ? 'updated' : 'created'} successfully`)
        setIsDialogOpen(false)
        loadPermissions()
      } else {
        toast.error(
          response.error || `Failed to ${selectedPermission ? 'update' : 'create'} permission`
        )
      }
    } catch (error) {
      console.error('Error submitting permission form:', error)
      toast.error(`Failed to ${selectedPermission ? 'update' : 'create'} permission`)
    }
  }

  const handleDelete = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) return

    try {
      const response = await window.api.permission.delete(permissionId)
      if (response.success) {
        toast.success('Permission deleted successfully')
        loadPermissions()
      } else {
        toast.error(response.error || 'Failed to delete permission')
      }
    } catch (error) {
      toast.error('Failed to delete permission')
      console.error('Error deleting permission:', error)
    }
  }

  const openEditDialog = (permission: PermissionWithRoles) => {
    setSelectedPermission(permission)
    setFormData({
      name: permission.name,
      description: permission.description || ''
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedPermission(null)
    setFormData({
      name: '',
      description: ''
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Permission Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPermission ? 'Edit Permission' : 'Create Permission'}
              </DialogTitle>
              <DialogDescription>
                {selectedPermission ? 'Update permission details' : 'Create a new permission'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedPermission ? 'Update Permission' : 'Create Permission'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span>Loading permissions...</span>
        </div>
      ) : permissions.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <span>No permissions found</span>
        </div>
      ) : null}
      {isLoading
        ? null
        : permissions.map((permission) => (
            <Card key={permission.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xl font-bold">{permission.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(permission)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(permission.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {permission.description || 'No description provided'}
                </p>
                <div className="space-y-2">
                  <Label>Assigned to Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {permission.roles.map(({ role }) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  )
}
