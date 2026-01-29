import { z } from "zod";
import { isAddress } from "viem";
import { ObjectId } from "bson";

export const signinUser = z.object({
  email: z.email("Please enter a valid Email"),
  wallet: z.string().refine(isAddress, "Invalid Address"),
});

export const createOrgValidation = z.object({
  identityCommitment: z.string("Must be a string"),
  name: z
    .string()
    .min(3, "Name must have atleast 3 characters")
    .max(50, "Name too long!"),
  description: z
    .string()
    .min(10, "The description must be at least 50 characters long")
    .max(1500, "Description too long!"),
});

export const getOrgByIdValidation = z.object({
  id: z.custom<ObjectId>().refine((id) => id instanceof ObjectId, "Invalid ObjectId"),
});
