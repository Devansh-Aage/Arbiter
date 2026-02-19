import OrgHeader from "@/components/dashboard/org/OrgHeader";
import OrgSidebar from "@/components/dashboard/org/OrgSidebar"
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, type FC } from "react"
import { Outlet, useParams } from "react-router"
import { type OrgHeaderData } from "@arbiter/db/src/types";
import { useGetAccessToken } from "@coinbase/cdp-hooks";
interface OrgLayoutProps {
}
const OrgLayout: FC<OrgLayoutProps> = ({ }) => {
    let params = useParams();
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);

    const { data: orgHeaderData, isSuccess: isOrgHeaderDataSuccess } = useQuery({
        queryKey: ["org", params.orgId, "header"],
        queryFn: async (): Promise<OrgHeaderData> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/header`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data;
        },
        enabled: !!token
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