import { useAuth } from "@/context/AuthContext";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FC } from "react"
import { useParams } from "react-router";
import { type OrgHeaderData } from "@arbiter/db/src/types";
import DeleteOrg from "@/components/dashboard/org/settings/DeleteOrg";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgSettingsProps {
}


const OrgSettings: FC<OrgSettingsProps> = ({ }) => {
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
        <div className="py-4 px-8 w-full ">
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