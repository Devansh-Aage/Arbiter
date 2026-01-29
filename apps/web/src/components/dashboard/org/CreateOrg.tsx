import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { FunctionComponent } from "react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputArbiter from "@/components/ui/InputArbiter";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { sha256 } from 'hash-wasm';
import type { User } from "@arbiter/db/src/types";
import { Identity } from "@semaphore-protocol/identity"


interface CreateOrgProps { }

const CreateOrg: FunctionComponent<CreateOrgProps> = () => {
    const { token } = useAuth();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
    const queryClient = useQueryClient();

    const { data: userData, isLoading: isUserDataLoading } = useQuery({
        queryKey: ["userData"],
        queryFn: async (): Promise<{ user: User }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/user`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })

    const createOrgMutation = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            if (!userData?.user?.id) {
                throw new Error("User data not loaded");
            }

            const seed = userData.user.id + "arbiter";
            const hash = await sha256(seed);
            const identity = new Identity(hash)
            const identityCommitment = identity.commitment

            const res = await axios.post(
                `${import.meta.env.VITE_HTTP_URL}org/create`,
                {
                    name: data.name,
                    description: data.description,
                    identityCommitment: identityCommitment.toString(),
                },
                {
                    headers: {
                        authToken: token,
                    },
                }
            );
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization created successfully!");
            queryClient.invalidateQueries({ queryKey: ["orgs"] });
            setOpen(false);
            setName("");
            setDescription("");
            setErrors({});
        },
        onError: (error: any) => {
            console.error("Create org error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create organization";
            toast.error(errorMessage);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation
        const newErrors: { name?: string; description?: string } = {};

        if (!name || name.length < 3) {
            newErrors.name = "Name must have at least 3 characters";
        } else if (name.length > 50) {
            newErrors.name = "Name too long!";
        }

        if (!description || description.length < 10) {
            newErrors.description = "Description must be at least 10 characters long";
        } else if (description.length > 1500) {
            newErrors.description = "Description too long!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        createOrgMutation.mutate({ name, description });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <InputArbiter
                            htmlFor="name"
                            title="Organization Name"
                            inputType="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                            placeholder="Enter organization name"
                        />
                        <div className="flex flex-col mt-3">
                            <label htmlFor="description" className="text-foreground text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter organization description"
                                className="mt-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-0 focus-visible:ring-primary/50 focus-visible:ring-[3px] min-h-[100px] resize-y"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-700 mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createOrgMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createOrgMutation.isPending || isUserDataLoading || !userData}
                        >
                            {createOrgMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrg;
