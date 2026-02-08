import { ObjectId } from "bson";
import z from "zod";
import { isAddress, isHash } from "viem";

export const addVoteValidation = z.object({
    proposalId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Proposal ObjectId"),
    choiceId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Proposal Choice ObjectId"),
    signature: z.string().refine(isAddress, "Invalid Address"),
    hash: z.string().refine(isHash, "Invalid Hash").optional(),
});