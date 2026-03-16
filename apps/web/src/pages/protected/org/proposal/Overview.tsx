import { ScrollArea } from "@/components/ui/scroll-area"
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
        <ScrollArea className="h-[85%]">
            <div className=" px-3 text-foreground/80 ">
                <p className="text-lg font-semibold">Summary: {proposalData?.proposal.summary.text}</p>
                <div className="text-xl mt-2 flex flex-col gap-2">
                    <p className="font-semibold">Pros: </p>
                    <ul>
                        {proposalData?.proposal.summary.accept.map((accept, i) => (
                            <li key={i}>{accept}</li>
                        ))}
                    </ul>
                    <p className="font-semibold">Cons: </p>
                    <ul>
                        {proposalData?.proposal.summary.reject.map((reject, i) => (
                            <li key={i}>{reject}</li>
                        ))}
                    </ul>
                    <div>
                        <p><span className="font-semibold">Vote Suggestion:</span> {proposalData?.proposal.proposalData.vote}</p>
                        <p><span className="font-semibold">Reasoning:</span> {proposalData?.proposal.proposalData.summary}</p>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

export default Overview