import MessageInput from "@/components/dashboard/org/dashboard/proposal/chat/MessageInput"
import Messages from "@/components/dashboard/org/dashboard/proposal/chat/Messages"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGetAccessToken } from "@coinbase/cdp-hooks"
import { useEffect, useState, type FC } from "react"
import { useParams } from "react-router"

interface ChatProps { }

const Chat: FC<ChatProps> = () => {
    const { getAccessToken } = useGetAccessToken()
    const [token, setToken] = useState<string | null>(null)
    const { proposalId } = useParams<{ proposalId: string }>()

    useEffect(() => {
        ; (async () => {
            const t = await getAccessToken()
            setToken(t)
        })()
    }, [])

    if (!proposalId) return null

    return (
        <div className="flex flex-col h-[90%]">
            <Messages proposalId={proposalId} token={token} />
            <MessageInput proposalId={proposalId} token={token} />
        </div>
    )
}

export default Chat
