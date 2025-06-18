"use client";

import type React from "react";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { AccessRoles } from "@/lib/role";
import type { User } from "@prisma/client";
import type { RoleWithPermissions, SessionUser } from "@/lib/types/common";
import services from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { UserForm, formSchema } from "./user-form";
import * as z from "zod";

interface UsersClientProps {
  permissions: AccessRoles;
  user: SessionUser;
}

export function UsersClient({ permissions, user: authUser }: UsersClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await services.user.getAll();
      if (!response.success) {
        throw new Error(response.error || "Failed to load users");
      }
      return response.data as User[];
    },
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
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
      username: string;
      email: string;
      password: string;
      roleId: number;
      name?: string;
      position?: string;
      positionDescription?: string;
      category?: string;
    }) => services.user.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        username: string;
        email: string;
        password?: string;
        roleId: number;
        name?: string;
        position?: string;
        positionDescription?: string;
        category?: string;
      };
    }) => services.user.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => services.user.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: ({
      userId,
      published,
    }: {
      userId: number;
      published: boolean;
    }) => services.user.togglePublished({ userId, published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User visibility updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update user visibility"
      );
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ userId, newIndex }: { userId: number; newIndex: number }) =>
      services.user.updateUserOrder({ userId, newIndex }),
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user order"
      );
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    queryClient.setQueryData(["users"], (oldData: User[] | undefined) => {
      if (!oldData) return oldData;

      const items = Array.from(oldData);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, reorderedItem);

      return items;
    });

    const reorderedItem = usersData?.[sourceIndex];
    if (reorderedItem) {
      updateOrderMutation.mutate(
        {
          userId: reorderedItem.id,
          newIndex: destinationIndex,
        },
        {
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.error(
              "Failed to update user order. Changes have been reverted."
            );
          },
        }
      );
    }
  };

  const handleTogglePublished = (userId: number, currentPublished: boolean) => {
    if (!permissions.isAdmin) {
      toast.error("You don't have permission to manage users");
      return;
    }
    togglePublishedMutation.mutate({ userId, published: !currentPublished });
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!permissions.isAdmin) {
      toast.error("You don't have permission to manage users");
      return;
    }

    const userData = {
      ...data,
      roleId: Number.parseInt(data.roleId),
    };

    if (selectedUser) {
      const updateData = data.password
        ? userData
        : { ...userData, password: undefined };
      updateMutation.mutate({ id: selectedUser.id, data: updateData });
    } else {
      if (!userData.password) {
        toast.error("Password is required for creating a new user");
        return;
      }
      createMutation.mutate({
        ...userData,
        password: userData.password!,
        position: userData.position,
      });
    }
  };

  const handleDelete = async (userId: number) => {
    if (!permissions.isAdmin) {
      toast.error("You don't have permission to delete users");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteMutation.mutate(userId);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="w-8 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-32 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-20 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="w-16 h-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        {permissions.isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? "Edit User" : "Create User"}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser
                    ? "Update user details and role"
                    : "Create a new user account"}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                selectedUser={selectedUser}
                rolesData={rolesData || []}
                onSubmit={handleSubmit}
                isSubmitting={
                  createMutation.isPending || updateMutation.isPending
                }
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead></TableHead>
                  <TableHead>#ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="users" direction="vertical">
                {(provided) => (
                  <TableBody
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {usersData?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersData?.map((user, index) => (
                        <Draggable
                          key={user.id}
                          draggableId={user.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="w-10">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                              </TableCell>
                              <TableCell className="w-4">
                                <Avatar className="w-8 h-8 rounded-lg">
                                  <AvatarImage
                                    src={user.image || ""}
                                    alt={user?.username}
                                  />
                                  <AvatarFallback className="rounded-lg">
                                    {getInitials(user?.username || "User")}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="px-2 font-medium">
                                {user.id}
                              </TableCell>
                              <TableCell className="font-medium">
                                {user.username}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {rolesData?.find((r) => r.id === user.roleId)
                                    ?.name || "Unknown Role"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleTogglePublished(
                                      user.id,
                                      user.published
                                    )
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {user.published ? (
                                    <Eye className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                {user.index !== null ? user.index : "Unknown"}
                              </TableCell>
                              <TableCell>
                                {permissions.isAdmin && (
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(user)}
                                    >
                                      Edit
                                    </Button>
                                    {user.id !== authUser.id &&
                                      user.roleId !== 1 && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleDelete(user.id)}
                                          disabled={deleteMutation.isPending}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}
