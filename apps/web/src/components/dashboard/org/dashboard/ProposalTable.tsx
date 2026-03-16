import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FC } from "react"
import {  useNavigate, useParams } from "react-router";

interface ProposalData {
    id: string;
    title: string;
    proposalStatus: string;
    deadline: string;
    createdAt: string;
    _count: {
        votes: number;
    }
}

interface ProposalTableProps {
    proposals: ProposalData[];
}

const getTimeline = (status: string, deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()

    if (status === "UPCOMING" || status === "ACTIVE") {
        const diffMs = deadlineDate.getTime() - now.getTime()
        const diffHrs = Math.max(Math.floor(diffMs / (1000 * 60 * 60)), 0)

        return `Will end in ${diffHrs} hrs`
    }

    if (status === "CLOSED" || status === "COMPLETED") {
        return `Ended at ${deadlineDate.toLocaleString()}`
    }

    return "-"
}

const ProposalTable: FC<ProposalTableProps> = ({ proposals }) => {
    const navigate = useNavigate();
    const params = useParams();
    const orgId = params.orgId as string;
    return (
        <Table className="w-full text-lg">
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Timeline</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {proposals.map((proposal) => (
                    <TableRow className="cursor-pointer" onClick={() => navigate(`/dashboard/orgs/${orgId}/dashboard/${proposal.id}/overview`)} key={proposal.id}>
                        <TableCell>{proposal.title}</TableCell>
                        <TableCell>{proposal.proposalStatus}</TableCell>
                        <TableCell>{proposal._count.votes}</TableCell>
                        <TableCell>
                            {getTimeline(proposal.proposalStatus, proposal.deadline)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default ProposalTable