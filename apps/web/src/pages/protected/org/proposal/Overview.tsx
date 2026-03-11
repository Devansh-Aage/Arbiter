import type { ProposalPageData } from "@arbiter/db/src/types"
import { useGetAccessToken } from "@coinbase/cdp-hooks"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FC, useEffect } from "react"
import { useParams } from "react-router"

interface OverviewProps {
}

const Overview: FC<OverviewProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken()
    const [token, setToken] = useState<string | null>(null)
    const params = useParams()
    const { proposalId } = params

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, [])

    const { data: proposalData, isSuccess: isProposalSuccess } = useQuery({
        queryKey: ["proposal", proposalId, "overview"],
        queryFn: async (): Promise<{ proposal: ProposalPageData }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })
    return (
        <div className=" px-3 text-foreground/80 text-xl">
            {proposalData?.proposal.summary}
        </div>
    )
}

export default Overview