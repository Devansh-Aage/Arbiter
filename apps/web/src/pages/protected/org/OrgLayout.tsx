import OrgHeader from "@/components/dashboard/org/OrgHeader";
import OrgSidebar from "@/components/dashboard/org/OrgSidebar"
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FC } from "react"
import { Outlet, useParams } from "react-router"
import { type OrgHeaderData } from "@arbiter/db/src/types";
interface OrgLayoutProps {
}
const OrgLayout: FC<OrgLayoutProps> = ({ }) => {
    let params = useParams();
    const { token } = useAuth();

    const { data: orgHeaderData, isSuccess: isOrgHeaderDataSuccess } = useQuery({
        queryKey: ["org", params.orgId, "header"],
        queryFn: async (): Promise<OrgHeaderData> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/header`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data;
        }
    })

    return (
        <div className='w-full h-screen font-nunito flex' >
            <OrgSidebar />
            <div className="flex-1 flex flex-col p-3">
                {
                    isOrgHeaderDataSuccess ?
                        <OrgHeader org={orgHeaderData.org} numMemberships={orgHeaderData.numMemberships} numProposals={orgHeaderData.numProposals} numVotes={orgHeaderData.numVotes} />
                        :
                        <Skeleton className="h-20 w-full" />
                }
                <Outlet />
            </div>
        </div >
    )
}

export default OrgLayout