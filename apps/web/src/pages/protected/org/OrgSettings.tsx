import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, type FC } from "react"
import { useParams } from "react-router";
import { type OrgHeaderData } from "@arbiter/db/src/types";
import DeleteOrg from "@/components/dashboard/org/settings/DeleteOrg";
import { Skeleton } from "@/components/ui/skeleton";
import EditBias from "@/components/dashboard/org/settings/EditBias";
import { useGetAccessToken } from "@coinbase/cdp-hooks";

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

    return (
        <div className="py-4 px-8 w-full flex flex-col gap-5">
            <EditBias />
            {
                isOrgHeaderDataSuccess ?
                    <DeleteOrg orgId={orgHeaderData.org.id} orgName={orgHeaderData?.org.name} />
                    :
                    <Skeleton className="h-20 w-full" />
            }
        </div>
    )
}

export default OrgSettings