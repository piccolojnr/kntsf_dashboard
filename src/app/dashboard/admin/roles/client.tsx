"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AccessRoles } from "@/lib/role";
import services from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleWithPermissions {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    permission: {
      id: number;
      name: string;
    };
  }[];
}

interface RolesClientProps {
  permissions: AccessRoles;
}

export function RolesClient({ permissions }: RolesClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  });

  const queryClient = useQueryClient();

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await services.role.getAll();
      if (!response.success) {
        throw new Error(response.error || "Failed to load roles");
      }
      return response.data as RoleWithPermissions[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      permissionIds: number[];
    }) => services.role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create role"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; description: string; permissionIds: number[] };
    }) => services.role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => services.role.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.isAdmin) {
      toast.error("You don't have permission to manage roles");
      return;
    }
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!permissions.isAdmin) {
      toast.error("You don't have permission to delete roles");
      return;
    }
    if (!confirm("Are you sure you want to delete this role?")) return;
    deleteMutation.mutate(roleId);
  };

  const openEditDialog = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.permission.id),
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissionIds: [],
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-6 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-6 w-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
        {permissions.isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedRole ? "Edit Role" : "Create Role"}
                </DialogTitle>
                <DialogDescription>
                  {selectedRole
                    ? "Update role details and permissions"
                    : "Create a new role"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {selectedRole ? "Update Role" : "Create Role"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {rolesData?.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <span>No roles found</span>
        </div>
      ) : (
        rolesData?.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
              {permissions.isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(role)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {role.description || "No description provided"}
              </p>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(({ permission }) => (
                    <span
                      key={permission.id}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {permission.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
