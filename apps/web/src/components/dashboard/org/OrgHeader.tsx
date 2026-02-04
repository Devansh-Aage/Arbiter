import { Skeleton } from "@/components/ui/skeleton";
import type { FC } from "react"

interface OrgHeaderProps {
    org: {
        id: string;
        name: string;
        createdAt: Date;
    },
    numMemberships: number;
    numProposals: number;
    numVotes: number;
}

const OrgHeader: FC<OrgHeaderProps> = ({ org, numMemberships, numProposals, numVotes }) => {
    return (
        <div className="w-full py-3 px-5 flex flex-col gap-2">
            <p className="text-4xl font-bold">
                {org.name}
            </p>
            <div className="flex items-center gap-4">
                <p className=" text-foreground opacity-90 text-xl">
                    {numProposals} Proposals
                </p>
                <p className=" text-foreground opacity-90 text-xl">
                    {numVotes} Votes
                </p>
                <p className=" text-foreground opacity-90 text-xl">
                    {numMemberships} Members
                </p>
            </div>
        </div>
    )
}

export default OrgHeader