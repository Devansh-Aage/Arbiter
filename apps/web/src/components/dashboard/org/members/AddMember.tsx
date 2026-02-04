import { useAuth } from "@/context/AuthContext";
import type { FC } from "react"
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { emailValidation } from "@arbiter/common";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputArbiter from "@/components/ui/InputArbiter";
import { UserPlus } from "lucide-react";
import { useParams } from "react-router";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import IconBtn from "@/components/ui/IconButton";

interface AddMemberProps {
}

type FormData = z.infer<typeof emailValidation>;

const AddMember: FC<AddMemberProps> = ({ }) => {
    const params = useParams();
    const { orgId } = params;
    const { token } = useAuth();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { userId } = useAuth()

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(emailValidation),
    });



    const addMember = useMutation({
        mutationFn: async (data: { email: string; }) => {
            if (!userId) {
                throw new Error("User data not loaded");
            }

            const res = await axios.post(
                `${import.meta.env.VITE_HTTP_URL}org/add-member`,
                {
                    email: data.email,
                    orgId: orgId,
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
                setError("email", { message: err.message });
                return;
            }
            else if (err instanceof AxiosError) {
                toast.error(err.response?.data.message)
                return;
            }
            else {
                console.error("Failed to add member: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['org', orgId] })
        },
        onSuccess: () => {
            reset();
            setOpen(false)
        }
    });

    const onSubmit = async (data: FormData) => {
        addMember.mutate(data)
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <IconBtn icon={<UserPlus className="size-5" />} title="Add Member" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Member to Organization</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a member to the organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <InputArbiter
                            htmlFor="email"
                            title="Member Email"
                            inputType="text"
                            {...register("email")}
                            error={errors.email?.message}
                            placeholder="Enter member email"
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} variant={"arbiter"}>
                        {isSubmitting ? "Adding..." : "Add"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddMember