import type { ProposalPageData } from "@arbiter/db/src/types";
import { useGetAccessToken } from "@coinbase/cdp-hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, type FC, useEffect } from "react"
import { useParams } from "react-router";
import Close from "@/components/dashboard/org/dashboard/proposal/settings/Close";
import Delete from "@/components/dashboard/org/dashboard/proposal/settings/Delete";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsProps {
}

const Settings: FC<SettingsProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);
    const params = useParams()
    const { proposalId, orgId } = params

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);

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

    const proposal = isProposalSuccess ? proposalData.proposal : null
    const isProposalClosed = isProposalSuccess && proposalData.proposal.proposalStatus === "CLOSED"

    return (
        <div className="p-4 w-full flex flex-col gap-5">
            {
                isAuthorized ? (token && proposal && orgId ? (
                    <>
                        {!isProposalClosed ?
                            <Close token={token} proposalId={proposal.id} />
                            :
                            <p className="text-lg text-foreground/70 font-semibold bg-card p-4 rounded-md">Proposal has been closed.</p>
                        }
                        <Delete
                            token={token}
                            proposalId={proposal.id}
                            proposalName={proposal.title}
                            orgId={orgId}
                        />
                    </>
                ) : (
                    <>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </>
                )) : (
                    <p className="text-lg text-foreground/70 font-semibold">Nothing for you here.</p>
                )
            }
        </div>
    )
}

export default Settings