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
    .min(10, "The description must be at least 10 characters long")
    .max(1500, "Description too long!"),
});
export const createOrgClientValidation = z.object({
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
  orgId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Organization ObjectId"),
});

export const addMemberValidation = z.object({
  email: z.email("Please enter a valid Email"),
  orgId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Organization ObjectId"),
});

export const orgMemberValidation = z.object({
  membershipId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Membership ObjectId"),
  orgId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Organization ObjectId"),
});

export const updateVoteWeightValidation = z.object({
  membershipId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Membership ObjectId"),
  orgId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Organization ObjectId"),
  voteWeight: z.number().min(1, "Vote weight must be greater than 0").max(100, "Vote weight must be less than 100"),
});

export const OrgIdValidation = z.object({
  orgId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Organization ObjectId"),
});

export const emailValidation = z.object({
  email: z.email("Please enter a valid Email"),
});

export const createDiscussionValidation = z.object({
  text: z.string().min(1, "Text must be at least 1 character").max(5000, "Text must be less than 5000 characters"),
  proposalId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Proposal ObjectId"),
  userId: z.string().refine((id) => ObjectId.isValid(id), "Invalid User ObjectId"),
  parentId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Discussion ObjectId").optional(),
})

export const discussionVoteValidation=z.object({
  discussionId: z.string().refine((id) => ObjectId.isValid(id), "Invalid Discussion ObjectId"),
  userId: z.string().refine((id) => ObjectId.isValid(id), "Invalid User ObjectId"),
  type: z.enum(["UP", "DOWN"]),
})

export const getDiscussionsValidation=z.object({
  proposalId:z.string().refine((id)=>ObjectId.isValid(id),"Invlaid Proposal Object ID!")
})