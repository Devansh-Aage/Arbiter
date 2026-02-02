import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { FunctionComponent } from "react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputArbiter from "@/components/ui/InputArbiter";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { sha256 } from 'hash-wasm';
import { Identity } from "@semaphore-protocol/identity"
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { toViemAccount } from "@coinbase/cdp-core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrgClientValidation } from "@arbiter/common";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

interface CreateOrgProps { }
type FormData = z.infer<typeof createOrgClientValidation>;

const CreateOrg: FunctionComponent<CreateOrgProps> = () => {
    const { token } = useAuth();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { currentUser } = useCurrentUser()
    const { userId } = useAuth()

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(createOrgClientValidation),
    });



    const createOrg = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            if (!userId) {
                throw new Error("User data not loaded");
            }
            const evmAccount = currentUser?.evmAccountObjects?.[0]?.address;
            const viemAccount = await toViemAccount(evmAccount as `0x${string}`);

            const seed = userId + "arbiter";
            const signature = await viemAccount.signMessage({ message: seed });
            const hash = await sha256(signature);
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
        onError: (err: any) => {
            if (err instanceof z.ZodError) {
                setError("name", { message: err.message });
                setError("description", { message: err.message });
                return;
            }
            else {
                console.error("Failed to create milestone: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orgs'] })
        },
        onSuccess: () => {
            reset();
            setOpen(false)
        }
    });

    const onSubmit = async (data: FormData) => {
        createOrg.mutate(data)
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <InputArbiter
                            htmlFor="name"
                            title="Organization Name"
                            inputType="text"
                            {...register("name")}
                            error={errors.name?.message}
                            placeholder="Enter organization name"
                        />
                        <Textarea htmlFor="description" title="Description" {...register("description")} error={errors.description?.message} placeholder="Enter organization description" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} variant={"arbiter"}>
                        {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrg;
