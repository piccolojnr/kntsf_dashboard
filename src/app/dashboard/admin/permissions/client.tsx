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
import { AccessPermissions } from "@/lib/permissions";
import services from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionWithRoles {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    role: {
      id: number;
      name: string;
    };
  }[];
}

interface PermissionsClientProps {
  permissions: AccessPermissions;
}

export function PermissionsClient({ permissions }: PermissionsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionWithRoles | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await services.permission.getAll();
      if (!response.success) {
        throw new Error(response.error || "Failed to load permissions");
      }
      return response.data as PermissionWithRoles[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      services.permission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create permission"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; description: string };
    }) => services.permission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update permission"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => services.permission.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete permission"
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManagePermissions) {
      toast.error("You don't have permission to manage permissions");
      return;
    }
    if (selectedPermission) {
      updateMutation.mutate({ id: selectedPermission.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (permissionId: number) => {
    if (!permissions.canManagePermissions) {
      toast.error("You don't have permission to delete permissions");
      return;
    }
    if (!confirm("Are you sure you want to delete this permission?")) return;
    deleteMutation.mutate(permissionId);
  };

  const openEditDialog = (permission: PermissionWithRoles) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedPermission(null);
    setFormData({
      name: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="w-48 h-6" />
              <div className="flex space-x-2">
                <Skeleton className="w-16 h-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-4 mb-4" />
              <Skeleton className="w-32 h-4 mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="w-20 h-6" />
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
        <h2 className="text-3xl font-bold tracking-tight">
          Permission Management
        </h2>
        {permissions.canManagePermissions && (
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
                  {selectedPermission ? "Edit Permission" : "Create Permission"}
                </DialogTitle>
                <DialogDescription>
                  {selectedPermission
                    ? "Update permission details"
                    : "Create a new permission"}
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
                    {selectedPermission
                      ? "Update Permission"
                      : "Create Permission"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {permissionsData?.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <span>No permissions found</span>
        </div>
      ) : (
        permissionsData?.map((permission) => (
          <Card key={permission.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold">
                {permission.name}
              </CardTitle>
              {permissions.canManagePermissions && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(permission)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(permission.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {permission.description || "No description provided"}
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
        ))
      )}
    </div>
  );
}
