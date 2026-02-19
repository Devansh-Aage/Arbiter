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
import { setBiasClientValidation } from "@arbiter/common";
import z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Pen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAccessToken } from "@coinbase/cdp-hooks";

interface EditBiasProps {}

type FormData = z.infer<typeof setBiasClientValidation>;

const EditBias: FC<EditBiasProps> = ({}) => {
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

  const { data: biasData, isSuccess: isBiasSuccess } = useQuery({
    queryKey: ["org", params.orgId, "bias"],
    queryFn: async (): Promise<{ bias: string }> => {
      const res = await axios.get(
        `${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/bias`,
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
    resolver: zodResolver(setBiasClientValidation),
    defaultValues: { bias: biasData?.bias },
  });

  const editBias = useMutation({
    mutationFn: async (data: { bias: string }) => {
      const res = await axios.post(
        `${import.meta.env.VITE_HTTP_URL}org/bias`,
        {
          orgId,
          bias: data.bias,
        },
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
        setError("bias", { message: err.message });
        return;
      }
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message);
        return;
      } else {
        console.error("Failed to create organization: ", err);
        toast.error("An unexpected error occurred!");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["org", params.orgId, "bias"],
      });
    },
    onSuccess: () => {
      reset();
      setOpen(false);
    },
  });

  const onSubmit = async (data: FormData) => {
    editBias.mutate(data);
  };

  if (!isBiasSuccess || !biasData) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (biasData && biasData.bias == null) {
    return null;
  }

  return (
    <div className="border-4 w-full border-muted rounded-xl p-4 ">
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="text-xl text-foreground font-medium">Edit Interests</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <IconBtn icon={<Pen className="size-5" />} title="Edit Interests" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Interests</DialogTitle>
              <DialogDescription>
                Fill in the details below to edit the interests.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Textarea
                  htmlFor="bias"
                  title="Interests"
                  {...register("bias")}
                  error={errors.bias?.message}
                  placeholder="Enter your interests"
                />
              </div>
              <Button
                type="submit"
                disabled={editBias.isPending}
                variant={"arbiter"}
              >
                {editBias.isPending ? "Editing..." : "Edit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground w-full border border-primary/20 p-2 rounded-md mt-3">
        {biasData.bias}
      </p>
    </div>
  );
};

export default EditBias;
