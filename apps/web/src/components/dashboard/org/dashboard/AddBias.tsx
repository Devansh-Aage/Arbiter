import { useState, useEffect, type FC } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import IconBtn from "@/components/ui/IconButton";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBiasClientValidation } from "@arbiter/common";
import z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useGetAccessToken } from "@coinbase/cdp-hooks";

interface AddBiasProps {
}

type FormData = z.infer<typeof setBiasClientValidation>;

const AddBias: FC<AddBiasProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);
    const params = useParams();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const orgId = params.orgId as string;
    
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(setBiasClientValidation),
    });

    const setBias = useMutation({
        mutationFn: async (data: { bias: string }) => {
            const res = await axios.post(
                `${import.meta.env.VITE_HTTP_URL}org/bias`,
                {
                    orgId,
                    bias: data.bias
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
                setError("bias", { message: err.message });
                return;
            }
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.message)
                return;
            }
            else {
                console.error("Failed to create organization: ", err)
                toast.error("An unexpected error occurred!")
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["org", params.orgId, "bias"] })
        },
        onSuccess: () => {
            reset();
            setOpen(false)
        }
    });

    const onSubmit = async (data: FormData) => {
        setBias.mutate(data)
    };
    return (
        <div className="border-4 w-full border-muted rounded-xl p-4 flex items-center gap-2">
            <div className="flex-1">
                <p className="text-xl text-foreground font-medium">You haven't added any interests yet.</p>
                <p className="text-muted-foreground">Interests helps the AI agent to give personalized summary and better vote suggestions.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <IconBtn icon={<Plus className="size-5" />} title="Add Interests" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Interests</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add interests.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <Textarea htmlFor="bias" title="Interests" {...register("bias")} error={errors.bias?.message} placeholder="Enter your interests" />
                        </div>
                        <Button type="submit" disabled={setBias.isPending} variant={"arbiter"}>
                            {(setBias.isPending) ? "Adding..." : "Add"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddBias