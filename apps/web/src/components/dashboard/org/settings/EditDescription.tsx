import { useState, useEffect, type FC } from "react";
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
import { updateDescriptionValidation } from "@arbiter/common";
import z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Pen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditDescriptionProps {
    token: string;
}

type FormData = z.infer<typeof updateDescriptionValidation>;

const EditDescription: FC<EditDescriptionProps> = ({ token }) => {
    const params = useParams();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const orgId = params.orgId as string;

    const { data: descriptionData, isSuccess: isDescriptionSuccess } = useQuery({
        queryKey: ["org", params.orgId, "description"],
        queryFn: async (): Promise<{ description: string }> => {
            const res = await axios.get(
                `${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/description`,
                {
                    headers: {
                        authToken: token,
                    },
                },
            );
            return res.data;
        },
        enabled: !!token,
    });

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(updateDescriptionValidation),
        defaultValues: { description: descriptionData?.description },
    });

    useEffect(() => {
        if (descriptionData?.description) {
            reset({ description: descriptionData.description });
        }
    }, [descriptionData]);

    const editDescription = useMutation({
        mutationFn: async (data: { description: string }) => {
            const res = await axios.post(
                `${import.meta.env.VITE_HTTP_URL}org/${orgId}/description`,
                { description: data.description },
                {
                    headers: {
                        authToken: token,
                    },
                },
            );
            return res.data;
        },
        onError: (err: any) => {
            if (err instanceof z.ZodError) {
                setError("description", { message: err.message });
                return;
            }
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.message);
                return;
            } else {
                console.error("Failed to update description: ", err);
                toast.error("An unexpected error occurred!");
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["org", params.orgId, "description"],
            });
        },
        onSuccess: () => {
            reset();
            setOpen(false);
        },
    });

    const onSubmit = async (data: FormData) => {
        editDescription.mutate(data);
    };

    if (!isDescriptionSuccess || !descriptionData) {
        return <Skeleton className="h-20 w-full" />;
    }

    if (descriptionData && descriptionData.description == null) {
        return null;
    }

    return (
        <div className="border-4 w-full border-muted rounded-xl p-4">
            <div className="flex gap-2">
                <div className="flex-1">
                    <p className="text-xl text-foreground font-medium">Edit Description</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <IconBtn icon={<Pen className="size-5" />} title="Edit Description" />
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Description</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to edit the description.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                <Textarea
                                    htmlFor="description"
                                    title="Description"
                                    {...register("description")}
                                    error={errors.description?.message}
                                    placeholder="Enter the organization description"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={editDescription.isPending}
                                variant={"arbiter"}
                            >
                                {editDescription.isPending ? "Editing..." : "Edit"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <p className="text-muted-foreground w-full border border-primary/20 p-2 rounded-md mt-3">
                {descriptionData.description}
            </p>
        </div>
    );
};

export default EditDescription;
