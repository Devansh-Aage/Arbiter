import { useGetAccessToken } from "@coinbase/cdp-hooks"
import socket, { connectSocketWithToken } from "@/lib/socket"
import { useEffect, type FC, useState } from "react"
import { Outlet, useParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ProposalPageData } from "@arbiter/db/src/types"
import axios from "axios"
import InfoPanel from "@/components/dashboard/org/dashboard/proposal/InfoPanel"
import { Skeleton } from "@/components/ui/skeleton"
import type { Vote } from "@arbiter/db/generated/prisma/client"
import TabsPanel from "@/components/dashboard/org/dashboard/proposal/TabsPanel"
import { ADD_VOTE_RES, VOTE_ADDED_EVENT } from "@arbiter/common/src/eventConstants"

interface ProposalProps {
}

const Proposal: FC<ProposalProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken()
    const [token, setToken] = useState<string | null>(null)
    const params = useParams()
    const { proposalId } = params
    const queryClient = useQueryClient()

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, [])

    useEffect(() => {
        void connectSocketWithToken(getAccessToken)

        return (() => {
            socket.disconnect()
        })
    }, [getAccessToken])

    useEffect(() => {
        const newVoteHandler = () => {
            console.log("New vote added");

            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId, "overview"] })
            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId, "vote"] })
        };
        socket.on(VOTE_ADDED_EVENT, newVoteHandler)
        return (() => {
            socket.off(VOTE_ADDED_EVENT, newVoteHandler)
        })
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
    const { data: userChoiceData, isSuccess: isUserChoiceSuccess } = useQuery({
        queryKey: ["proposal", proposalId, "choice"],
        queryFn: async (): Promise<{ userChoice: Vote | null }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}/user-choice`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })

    return (
        <div className="w-full p-4 flex max-h-[calc(100vh-120px)]">
            <div className="w-[70%]">
                <p className="text-foreground text-2xl font-bold">{proposalData?.proposal.title}</p>
                <TabsPanel />
                <Outlet />
            </div>
            <div className="w-[30%]">
                {isProposalSuccess && isUserChoiceSuccess ? (
                    <InfoPanel proposalData={proposalData.proposal} userChoice={userChoiceData?.userChoice} />
                )
                    :
                    <Skeleton className="h-full w-full" />
                }
            </div>
        </div>
    )
}

export default Proposal