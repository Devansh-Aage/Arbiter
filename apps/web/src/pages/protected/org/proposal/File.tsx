import pinata from "@/lib/pinata"
import type { ProposalPageData } from "@arbiter/db/src/types"
import { useGetAccessToken } from "@coinbase/cdp-hooks"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FC, useEffect } from "react"
import { useParams } from "react-router"
import { Skeleton } from "@/components/ui/skeleton"
interface FileProps {
}

const File: FC<FileProps> = ({ }) => {
    const { getAccessToken } = useGetAccessToken()
    const [token, setToken] = useState<string | null>(null)
    const params = useParams()
    const { proposalId } = params
    const [file, setFile] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        ; (async () => {
            const t = await getAccessToken()
            setToken(t)
        })()
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

    useEffect(() => {
        const getFile = async () => {
            if (proposalData) {
                setLoading(true)
                const url = await pinata.gateways.private.createAccessLink({ cid: proposalData.proposal.mediaUrl, expires: 3000000 })
                setFile(url)
                setLoading(false)
            }
        }
        getFile()
    }, [proposalData])

    if (loading || !isProposalSuccess) return <Skeleton className="w-full h-full" />


    return (
        <div className="w-full h-full">
            <iframe className="w-full h-full pt-5" src={file}></iframe>
        </div>
    )
}

export default File