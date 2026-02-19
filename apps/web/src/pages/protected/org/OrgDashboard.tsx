import AddBias from "@/components/dashboard/org/dashboard/AddBias"
import AddProposal from "@/components/dashboard/org/dashboard/AddProposal";
import ProposalTable from "@/components/dashboard/org/dashboard/ProposalTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableCell, TableRow, TableBody, TableHead } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, type FC } from "react"
import { useParams } from "react-router";
import { useGetAccessToken } from "@coinbase/cdp-hooks";

interface OrgDashboardProps {
}

const OrgDashboard: FC<OrgDashboardProps> = ({ }) => {

    let params = useParams();
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);

    const { data, isSuccess } = useQuery({
        queryKey: ["org", params.orgId, "bias"],
        queryFn: async (): Promise<{ bias: string }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/bias`, {
                headers: {
                    "authToken": token
                }
            })
            return res.data;
        },
        enabled: !!token
    })

    return (
        <div className="p-4 w-full flex flex-col gap-4">
            {
                isSuccess && data?.bias === null ? <AddBias /> : null
            }
            <div className="w-full ">
                <div className="flex items-center justify-between">
                    <p>Proposals</p>
                    <div className="flex items-center gap-2">
                        <AddProposal />
                    </div>
                </div>
                <div className="mt-4">
                    {
                        !isSuccess ?
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vote Weight</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell colSpan={3} className="text-center">
                                                    <Skeleton className="h-10 w-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                            :
                            <ProposalTable />
                    }
                </div>
            </div>
        </div>
    )
}

export default OrgDashboard