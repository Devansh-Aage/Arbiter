import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FC } from "react"

interface ProposalTableProps {
}

const ProposalTable: FC<ProposalTableProps> = ({ }) => {
    return (
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Timeline</TableHead>
                </TableRow>
            </TableHeader>
        </Table>
    )
}

export default ProposalTable