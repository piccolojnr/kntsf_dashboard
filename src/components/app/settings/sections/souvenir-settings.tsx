'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import services from "@/lib/services";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { Souvenir } from "@prisma/client";

export function SouvenirSettings() {
    const queryClient = useQueryClient();
    const [newRoundName, setNewRoundName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { data: souvenirs, isLoading } = useQuery({
        queryKey: ["souvenirs"],
        queryFn: async () => {
            const response = await services.souvenir.getAllSouvenirs();
            if (!response.success) {
                throw new Error(response.error || "Failed to load souvenirs");
            }
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            const resp = await services.souvenir.createSouvenir(name);
            if (!resp.success) throw new Error(resp.error || "Failed");
            return resp.data;
        },
        onSuccess: () => {
            setNewRoundName("");
            toast.success("Souvenir round created successfully");
            queryClient.invalidateQueries({ queryKey: ["souvenirs"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create souvenir round");
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
            const resp = await services.souvenir.toggleSouvenirStatus(id, isActive);
            if (!resp.success) throw new Error(resp.error || "Failed");
            return resp.data;
        },
        onSuccess: () => {
            toast.success("Souvenir round status updated");
            queryClient.invalidateQueries({ queryKey: ["souvenirs"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update souvenir round");
        }
    });

    const handleCreate = async () => {
        if (!newRoundName.trim()) {
            toast.error("Please enter a name for the souvenir round");
            return;
        }
        setIsCreating(true);
        await createMutation.mutateAsync(newRoundName);
        setIsCreating(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex items-end gap-4">
                <div className="space-y-2 flex-grow">
                    <Label htmlFor="new-round">New Souvenir Round Name</Label>
                    <Input
                        id="new-round"
                        placeholder="e.g. End of Year Mugs 2026"
                        value={newRoundName}
                        onChange={(e) => setNewRoundName(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} disabled={isCreating || !newRoundName.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Round
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Existing Souvenir Rounds</h3>

                {souvenirs?.length === 0 ? (
                    <p className="text-gray-500 italic">No souvenir rounds created yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {souvenirs?.map((souvenir: Souvenir) => (
                            <Card key={souvenir.id} className={`overflow-hidden transition-all ${souvenir.isActive ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {souvenir.isActive ? (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-300" />
                                            )}
                                            <h4 className="font-semibold text-lg">{souvenir.name}</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Created on {format(new Date(souvenir.createdAt), "PPP")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                            {souvenir.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <Switch
                                            checked={souvenir.isActive}
                                            onCheckedChange={(checked) => toggleMutation.mutate({ id: souvenir.id, isActive: checked })}
                                            disabled={toggleMutation.isPending}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
