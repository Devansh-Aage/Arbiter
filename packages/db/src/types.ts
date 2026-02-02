// Re-export types only - no runtime imports
import type { User, Organization as Org, Membership, Proposal as Prop, Message, DiscussionVote, Discussion, Vote, ProposalData, zkVote, ProposalResult, ProposalChoice } from "../generated/prisma/client";
export type { User };

export interface UserData extends User {
    memberships: Membership[];
    proposaldata: ProposalData[];
    votes: Vote[];
    discussions: Discussion[];
    discussionVotes: DiscussionVote[];
    messages: Message[];
}

export interface Organization extends Org {
    memberships: Membership[];
    proposals: Proposal[];
}

export interface Proposal extends Prop {
    org: Organization;
    proposaldata: ProposalData[];
    votes: Vote[];
    proposalChoices: ProposalChoice[];
    proposalResult: ProposalResult;
    discussions: Discussion[];
    messages: Message[];
    zkVotes: zkVote[];
    createdAt: Date;
}