import AddMember from "@/components/dashboard/org/members/AddMember";
import LeaveOrg from "@/components/dashboard/org/members/LeaveOrg";
import MemberTable from "@/components/dashboard/org/members/MemberTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableCell, TableRow, TableBody, TableHead } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import type { MemberTableData } from "@arbiter/db/src/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, type FC } from "react"
import { useParams } from "react-router";
import { useGetAccessToken } from "@coinbase/cdp-hooks";

interface OrgMembersProps {
}

const OrgMembers: FC<OrgMembersProps> = ({ }) => {
    let params = useParams();
    const { email: userEmail } = useAuth();
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);

    const { data, isSuccess } = useQuery({
        queryKey: ["org", params.orgId, "members"],
        queryFn: async (): Promise<{ members: MemberTableData[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/members`, {
                headers: {
                    "authToken": token
                }
            })
            return res.data;
        },
        enabled: !!token
    })

    const user = data?.members.find((member) => member.user.email === userEmail);
    const isAuthorized = user?.role === "CREATOR" || user?.role === "ADMIN";
    return (
        <div className="py-4 px-8 w-full ">
            <div className="flex items-center justify-between">
                <p>Members</p>
                <div className="flex items-center gap-2">
                    {isSuccess ?
                        <LeaveOrg orgId={params.orgId as string} membershipId={user?.id ?? ""} />
                        :
                        <Skeleton className="h-20 w-full" />
                    }

                    {isAuthorized && <AddMember />}
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
                        <MemberTable members={data.members} />
                }
            </div>
        </div>
    )
}

export default OrgMembers