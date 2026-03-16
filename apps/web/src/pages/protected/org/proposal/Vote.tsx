import { useGetAccessToken } from "@coinbase/cdp-hooks"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FC, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import type { VoteTable } from "@arbiter/db/src/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VoteProps {
}

type msgData = {
    timestamp: number,
    choiceId: string,
    proposalId: string,
    signature: string,
    wallet: string
}

const getRelativeTime = (date: Date): { relative: string; formatted: string } => {
    const now = new Date()
    const voteDate = new Date(date)
    const diffMs = now.getTime() - voteDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const formatted = voteDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    if (diffDays === 0) return { relative: "Today", formatted }
    if (diffDays === 1) return { relative: "Yesterday", formatted }
    return { relative: `${diffDays} days ago`, formatted }
}

const SKELETON_ROWS = 5

const Vote: FC<VoteProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken()
    const [token, setToken] = useState<string | null>(null)
    const params = useParams()
    const { proposalId } = params
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, [])

    const { data: voteData, isSuccess: isVoteDataSuccess } = useQuery({
        queryKey: ["proposal", proposalId, "vote"],
        queryFn: async (): Promise<{ voteData: VoteTable[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}/vote`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })

    const handleVerify = (data: msgData) => {
        navigate('../verify', {
            state: {
                timestamp: data.timestamp,
                choiceId: data.choiceId,
                proposalId: data.proposalId,
                signature: data.signature,
                wallet: data.wallet,
            }
        })
    }

    return (
        <ScrollArea className="h-[85%]">
            <Table className="w-full text-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead>Voter</TableHead>
                        <TableHead>Choice</TableHead>
                        <TableHead>Voted At</TableHead>
                        <TableHead>Voting Power</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {!isVoteDataSuccess
                        ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-3 w-28" />
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20 rounded-md" /></TableCell>
                            </TableRow>
                        ))
                        : voteData?.voteData.map((vote) => {
                            const { relative, formatted } = getRelativeTime(vote.votedAt)
                            return (
                                <TableRow key={vote.id}>
                                    <TableCell>
                                        <p className="font-medium">{vote.user}</p>
                                        <p className="text-sm text-muted-foreground font-mono truncate max-w-[160px]">{vote.wallet}</p>
                                    </TableCell>
                                    <TableCell>{vote.choice}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{relative}</p>
                                        <p className="text-sm text-muted-foreground">{formatted}</p>
                                    </TableCell>
                                    <TableCell>{vote.voteValue}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleVerify({
                                            timestamp: vote.timestamp, choiceId: vote.choiceId, proposalId: proposalId as string, signature: vote.signature,
                                            wallet: vote.wallet
                                        })} variant="outline" size="sm">Verify</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table >
        </ScrollArea>
    )
}

export default Vote