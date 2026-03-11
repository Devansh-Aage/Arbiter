import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, type FC } from "react"
import { useParams } from "react-router";
import { type OrgHeaderData } from "@arbiter/db/src/types";
import DeleteOrg from "@/components/dashboard/org/settings/DeleteOrg";
import { Skeleton } from "@/components/ui/skeleton";
import EditBias from "@/components/dashboard/org/settings/EditBias";
import { useGetAccessToken } from "@coinbase/cdp-hooks";
import EditDescription from "@/components/dashboard/org/settings/EditDescription";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrgSettingsProps {
}


const OrgSettings: FC<OrgSettingsProps> = ({ }) => {
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

    const { data } = useQuery({
        queryKey: ["org", params.orgId, "role"],
        queryFn: async (): Promise<{ isAuthorized: boolean }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/role`, {
                headers: {
                    "authToken": token
                }
            })
            return res.data;
        },
        enabled: !!token
    })

    const isAuthorized = data?.isAuthorized;

    return (
        <ScrollArea className=" h-[calc(100vh-120px)]">
            <div className="py-4 px-8 w-full flex flex-col gap-5">
                {token && isAuthorized && <EditDescription token={token} />}
                {token && <EditBias token={token} />}
                {
                    isOrgHeaderDataSuccess ?
                        <DeleteOrg orgId={orgHeaderData.org.id} orgName={orgHeaderData?.org.name} />
                        :
                        <Skeleton className="h-20 w-full" />
                }
            </div>
        </ScrollArea>
    )
}

export default OrgSettings