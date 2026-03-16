import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { useEffect, useRef, type FC } from "react"

interface Message {
    id: string
    author: "USER" | "AI"
    text: string
    userId: string
    proposalId: string
    createdAt: string
}

interface MessagesProps {
    proposalId: string
    token: string | null
}

const formatTime = (dateStr: string) => format(new Date(dateStr), "HH:mm")

const Messages: FC<MessagesProps> = ({ proposalId, token }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: messages, isLoading, isError } = useQuery({
        queryKey: ["proposal", proposalId, "chat"],
        queryFn: async (): Promise<Message[]> => {
            const res = await axios.get(
                `${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}/chat`,
                { headers: { authToken: token } }
            )
            return res.data
        },
        enabled: !!token,
    })

    // API returns desc order (newest first), reverse to show oldest at top
    const sortedMessages = messages ? [...messages] : []

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [sortedMessages.length])

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                Loading messages...
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-1 items-center justify-center text-destructive text-sm">
                Error loading messages.
            </div>
        )
    }

    return (
        <ScrollArea className="h-[85%]">
            <div className="flex flex-1 flex-col-reverse overflow-y-auto p-4 gap-1 scrollbar-thin">
                <div className="h-px bg-background" ref={messagesEndRef} />
                {sortedMessages.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    sortedMessages.map((message) => {
                        const isUser = message.author === "USER"
                        return (
                            <div
                                key={message.id}
                                className={cn("flex items-end", { "justify-end": isUser })}
                            >
                                <div
                                    className={cn(
                                        "max-w-lg mx-2 px-3 py-2 rounded-lg my-[2px] wrap-break-word relative pr-12 pb-5 text-sm",
                                        {
                                            "bg-primary text-primary-foreground rounded-br-none": isUser,
                                            "bg-muted text-foreground rounded-bl-none": !isUser,
                                        }
                                    )}
                                >
                                    {message.text}
                                    <span className="absolute bottom-1 right-2 text-[10px] opacity-60">
                                        {formatTime(message.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}

            </div>
        </ScrollArea>
    )
}

export default Messages
