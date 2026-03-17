import { createProposalValidation } from "@arbiter/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import IconBtn from "@/components/ui/IconButton";
import { ChevronDownIcon, FilePlusCorner, Plus, Trash } from "lucide-react";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import InputArbiter from "@/components/ui/InputArbiter";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import pinata from "@/lib/pinata";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddProposalProps { token: string }

type FormData = z.infer<typeof createProposalValidation>;

const AddProposal: FC<AddProposalProps> = ({ token }) => {
  const params = useParams();
  const { orgId } = params;
  const [open, setOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [choices, setChoices] = useState<string[]>([""]);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [predictionSuccess, setPredictionSuccess] = useState(false)
  const [acceptanceChance, setAcceptanceChance] = useState(0)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createProposalValidation),
  });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    const selectedDate = new Date(date ?? Date.now());
    const [hours, minutes, seconds = 0] = timeValue.split(":").map(Number);
    selectedDate.setHours(hours, minutes, seconds, 0);
    setDeadline(selectedDate.toISOString());
  }


  const handleAddProposal = useMutation({
    mutationFn: async (data: FormData) => {
      setProposalLoading(true);
      if (!file) {
        toast.error("Please upload a proposal file")
        return;
      }
      if (!orgId) {
        toast.error("Organization ID not found")
        return
      }
      if (!deadline) {
        toast.error("Deadline not found")
        return
      }
      if (choices.length < 2) {
        toast.error("Add more choices!")
        return
      }

      const fileRes = await pinata.upload.private.file(file);
      const fileCID = fileRes.cid;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("org_id", orgId);
      formData.append("title", data.title);
      formData.append("mediaUrl", fileCID);
      formData.append("deadline", deadline);
      choices.forEach((choice) => formData.append("proposalChoices", choice));

      await axios.post(`${import.meta.env.VITE_FASTAPI_URL}bias-evaluate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
    },
    onError: (err: any) => {
      if (err instanceof z.ZodError) {
        setError("title", { message: err.message });
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
      queryClient.invalidateQueries({ queryKey: ["org", params.orgId, "proposals"] })
      setProposalLoading(false);
    },
    onSuccess: () => {
      reset();
      setFile(null);
      setDate(undefined);
      setDeadline(undefined);
      setChoices([]);
      setOpen(false)
    }
  })

  const onAddSubmit = async (data: FormData) => {
    handleAddProposal.mutate(data)
  }

  const handlePredictPassingProbability = async () => {
    try {
      setPredictionLoading(true)
      if (!orgId) {
        toast.error("Organization ID not found");
        return;
      }
      if (!file) {
        toast.error("Please upload a proposal file");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("org_id", orgId);
      const res = await axios.post(`${import.meta.env.VITE_FASTAPI_URL}evaluate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const response = res.data
      setPredictionSuccess(response.status === "success")
      setAcceptanceChance(response.evaluation.overall_acceptance_chance);
      setRecommendations(response.evaluation.recommendations);
    } catch (error) {
      console.error("Failed to predict passing probability: ", error)
      toast.error("An unexpected error occurred!")
    }
    finally {
      setPredictionLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconBtn
          icon={<FilePlusCorner className="size-5" />}
          title="Add Proposal"
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Proposal</DialogTitle>
          <DialogDescription>
            Fill in the details below to upload a proposal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onAddSubmit)}>
          <FieldSet className="gap-3">
            <InputArbiter
              htmlFor="title"
              title="Title"
              {...register("title")}
              error={errors.title?.message}
              placeholder="Enter title"
            />
            <Field className="gap-1">
              <FieldLabel htmlFor="media">Proposal File</FieldLabel>
              <Input onChange={(e) => setFile(e.target.files?.[0] ?? null)} id="media" type="file" accept="application/pdf" />
            </Field>
            <div className="flex flex-col gap-2">
              <label className="">Voting Deadline</label>
              <FieldGroup className="max-w-xs flex-row">
                <Field>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker-optional"
                        className="w-32 justify-between font-normal"
                      >
                        {date ? format(date, "PPP") : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        defaultMonth={date}
                        onSelect={(date) => {
                          setDate(date);
                          setDateOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field className="w-32">
                  <Input
                    onChange={handleTimeChange}
                    type="time"
                    id="time-picker-optional"
                    step="1"
                    defaultValue=""
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </Field>
              </FieldGroup>
            </div>
            <Field>
              <FieldLabel>Choices</FieldLabel>
              {choices.map((choice, index) => (
                <div key={index} className="flex flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="Enter choice"
                    value={choice}
                    onChange={(e) => {
                      const updated = [...choices];
                      updated[index] = e.target.value;
                      setChoices(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant={"destructive"}
                    size={"icon"}
                    onClick={() => setChoices(choices.filter((_, i) => i !== index))}
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                className="max-w-[40%]"
                variant={"outline"}
                onClick={() => setChoices([...choices, ""])}
              >
                <Plus /> Add Another Choice
              </Button>
            </Field>
          </FieldSet>
          <div className="flex items-center gap-3">
            <Button className="flex-1" type="submit" disabled={proposalLoading || predictionLoading} variant={"arbiter"}>
              {proposalLoading ? "Adding..." : "Add"}
            </Button>
            <Button className="flex-1" onClick={handlePredictPassingProbability} disabled={proposalLoading || predictionLoading} variant={"arbiter"}>
              {predictionLoading ? "Predicting..." : "Predict passing probability"}
            </Button>
          </div>
        </form>
        {
          predictionSuccess && (
            <ScrollArea className="h-[200px]">
              <div>
                <h3><span className="font-bold">Acceptance Chance:</span> {acceptanceChance}%</h3>
                <ul className="list-disc list-inside">
                  <p className="font-bold">Recommendations:</p>
                  {recommendations.map((recommendation, index) => (
                    <li key={index}> {recommendation}</li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          )
        }
      </DialogContent>
    </Dialog>
  );
};

export default AddProposal;
