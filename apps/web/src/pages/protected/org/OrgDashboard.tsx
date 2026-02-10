import AddBias from "@/components/dashboard/org/dashboard/AddBias"
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FC } from "react"
import { useParams } from "react-router";

interface OrgDashboardProps {
}

const OrgDashboard: FC<OrgDashboardProps> = ({ }) => {

    let params = useParams();
    const { token } = useAuth();
    const { data, isSuccess } = useQuery({
        queryKey: ["org", params.orgId, "bias"],
        queryFn: async (): Promise<{ bias: string }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org/${params.orgId}/bias`, {
                headers: {
                    "authToken": token
                }
            })
            return res.data;
        }
    })

    return (
        <div className="p-4 w-full">
            {
                isSuccess && data?.bias === null ? <AddBias /> : null
            }
        </div>
    )
}

export default OrgDashboard