import { ObjectId } from "bson";
import z from "zod";
import { isAddress, isHash } from "viem";

export const addVoteValidation = z.object({
    proposalId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Proposal ObjectId"),
    choiceId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Proposal Choice ObjectId"),
    signature: z.string("Signature is required"),
    timestamp: z.number("Timestamp is required"),
    hash: z.string().refine(isHash, "Invalid Hash").optional(),
});