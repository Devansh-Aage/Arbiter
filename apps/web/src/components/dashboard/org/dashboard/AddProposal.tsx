import { useAuth } from "@/context/AuthContext";
import { createProposalValidation } from "@arbiter/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FC } from "react"
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import type z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import IconBtn from "@/components/ui/IconButton";
import { ChevronDownIcon, FilePlusCorner } from "lucide-react";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import InputArbiter from "@/components/ui/InputArbiter";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AddProposalProps {
}

type FormData = z.infer<typeof createProposalValidation>;


const AddProposal: FC<AddProposalProps> = ({ }) => {
    const params = useParams();
    const { orgId } = params;
    // const { token, userId } = useAuth();
    const [open, setOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [deadline, setDeadline] = useState<string | undefined>(undefined)
    const queryClient = useQueryClient()


    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(createProposalValidation),
    });

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value; // "HH:mm" or "HH:mm:ss" (24hr)
        const selectedDate = new Date(date ?? Date.now());
        const [hours, minutes, seconds = 0] = timeValue.split(":").map(Number);
        selectedDate.setHours(hours, minutes, seconds, 0);
        setDeadline(selectedDate.toISOString());
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <IconBtn icon={<FilePlusCorner className="size-5" />} title="Add Proposal" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Proposal</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to upload a proposal.
                    </DialogDescription>
                </DialogHeader>
                <form >
                    <FieldSet>
                        <InputArbiter htmlFor="title" title="Title" {...register("title")} error={errors.title?.message} placeholder="Enter title" />
                        <Field className="gap-1">
                            <FieldLabel htmlFor="media">Proposal File</FieldLabel>
                            <Input id="media" type="file" accept="application/pdf" />
                        </Field>
                        <div className="flex flex-col gap-2">
                            <label className="">
                                Voting Deadline
                            </label>
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
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                captionLayout="dropdown"
                                                defaultMonth={date}
                                                onSelect={(date) => {
                                                    setDate(date)
                                                    setDateOpen(false)
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
                                        defaultValue="10:30"
                                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                </Field>
                            </FieldGroup>
                        </div>
                    </FieldSet>
                    <Button type="submit" disabled={isSubmitting} variant={"arbiter"}>
                        {isSubmitting ? "Adding..." : "Add"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddProposal