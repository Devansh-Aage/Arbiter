import socket from "@/lib/socket"
import type { ProposalPageData } from "@arbiter/db/src/types"
import { Clock3 } from "lucide-react"
import { useEffect, type FC } from "react"
import { ADD_VOTE_REQ, ADD_VOTE_RES } from "@arbiter/common/src/eventConstants"
import { useCurrentUser } from "@coinbase/cdp-hooks"
import { toViemAccount } from "@coinbase/cdp-core"
import type { Vote } from "@arbiter/db/generated/prisma/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

type ProposalWithDates = ProposalPageData & {
    createdAt?: Date | string
    startTime?: Date | string | null
    deadline?: Date | string
}

interface InfoPanelProps {
    proposalData: ProposalWithDates,
    userChoice: Vote | null
}

const formatDate = (value?: Date | string | null) => {
    if (!value) {
        return "-"
    }

    return new Date(value).toLocaleString()
}

const InfoPanel: FC<InfoPanelProps> = ({ proposalData, userChoice }) => {
    const queryClient = useQueryClient()
    const choiceId = userChoice?.choiceId;
    const hasVoted = choiceId !== undefined && choiceId !== null;
    const { currentUser } = useCurrentUser();
    const evmAddress = currentUser?.evmAccountObjects?.[0]?.address;
    console.log(evmAddress);
    const proposal = proposalData
    const isProposalActive = proposal.proposalStatus === "ACTIVE";
    const proposalChoices = proposal.proposalChoices.map((choice) => ({
        id: choice.id,
        text: choice.text,
        votes: choice.votes,
    }))
    const votes = proposalData.votes;
    const totalVotes = votes.totalVotes

    useEffect(() => {
        const handler = (_data: string) => {
            queryClient.invalidateQueries({ queryKey: ["proposal", proposal.id, "choice"] })
            queryClient.invalidateQueries({ queryKey: ["proposal", proposal.id, "overview"] })
            queryClient.invalidateQueries({ queryKey: ["proposal", proposal.id, "vote"] })
        };
        socket.on(ADD_VOTE_RES, handler);

        return () => {
            socket.off(ADD_VOTE_RES, handler);
        };
    }, [])

    const createMessage = async (choiceId: string, proposalId: string) => {
        const viemAccount = await toViemAccount(evmAddress as `0x{string}`)
        const timestamp = Math.floor(Date.now() / 1000)
        const msg = {
            timestamp,
            choiceId,
            proposalId,
            app: "arbiter"
        }
        const signature = await viemAccount.signMessage({ message: JSON.stringify(msg) })
        return { signature, timestamp };
    }

    const handleVote = async (choiceId: string) => {
        if (hasVoted) {
            toast.error("You have already voted on this proposal")
            return;
        }
        const { signature, timestamp } = await createMessage(choiceId, proposal.id)
        socket.emit(ADD_VOTE_REQ, {
            proposalId: proposal.id,
            choiceId,
            signature,
            timestamp
        })
    }

    return (
        <div className="border-l border-zinc-800 bg-background w-full p-5">
            <div>
                <p className="text-base font-semibold">Cast Your Vote</p>

                <div className="mt-3 space-y-2">
                    {proposalChoices.map((choice) => {
                        const voteValue = votes.choices.find((vote) => vote.id === choice.id)?.value ?? 0;
                        const percentage = totalVotes === 0 ? 0 : Math.round((voteValue / totalVotes) * 100)

                        return (
                            <Button
                                disabled={hasVoted || !isProposalActive}
                                key={choice.id}
                                onClick={() => handleVote(choice.id)}
                                variant={choiceId === choice.id ? "default" : "outline"}
                                className={`cursor-pointer w-full py-4 `}
                            >
                                <span className="font-medium">{choice.text}</span>
                                <span className="text-sm text-foreground">
                                    ({percentage}%)
                                </span>
                            </Button>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-foreground" />
                    <p className="text-sm font-semibold tracking-wide text-foreground">TIMELINE</p>
                </div>

                <div className="mt-4 space-y-6">
                    <div className="relative pl-7">
                        <span className="absolute left-1 top-1.5 size-3 rounded-full bg-accent" />
                        <span className="absolute left-[9px] top-5 h-[calc(100%+18px)] w-px bg-zinc-700" />
                        <p className="text-xl font-semibold leading-8">Created</p>
                        <p className="mt-1 text-foreground/60">{formatDate(proposal.createdAt)}</p>
                    </div>

                    <div className="relative pl-7">
                        <span className="absolute left-1 top-1.5 size-3 rounded-full bg-accent" />
                        <span className="absolute left-[9px] top-5 h-[calc(100%+18px)] w-px bg-zinc-700" />
                        <p className="text-xl font-semibold leading-8">Start</p>
                        <p className="mt-1 text-foreground/60">{formatDate(proposal.startTime)}</p>
                    </div>

                    <div className="relative pl-7">
                        <span className="absolute left-1 top-1.5 size-3 rounded-full bg-accent" />
                        <p className="text-xl font-semibold leading-8">End</p>
                        <p className="mt-1 text-foreground/60">{formatDate(proposal.deadline)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InfoPanel