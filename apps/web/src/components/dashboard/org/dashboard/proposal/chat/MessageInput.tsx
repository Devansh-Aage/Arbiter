import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Loader, SendHorizontal } from "lucide-react"
import { useState, type FC, type FormEvent } from "react"
import { toast } from "sonner"

interface MessageInputProps {
    proposalId: string
    token: string | null
}

const MessageInput: FC<MessageInputProps> = ({ proposalId, token }) => {
    const [input, setInput] = useState("")
    const queryClient = useQueryClient();
    const { userId } = useAuth()

    const { mutate, isPending } = useMutation({
        mutationFn: async (text: string) => {
            if (!userId) {
                toast.error("User ID not found")
                return
            }
            await axios.post(
                `${import.meta.env.VITE_HTTP_URL}proposal/chat`,
                { proposalId, text },
                { headers: { authToken: token } }
            )

            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("proposal_id", proposalId);

            await axios.post(`${import.meta.env.VITE_FASTAPI_URL}chat-evaluate`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId, "chat"] })
        },
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (input.trim().length === 0 || !token || isPending) return
        mutate(input.trim())
        setInput("")
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t shrink-0 sticky bottom-0 bg-background">
            <div className="flex gap-3 items-center">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isPending || !token}
                    className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    )}
                    placeholder="Ask about this proposal..."
                />
                <Button
                    type="submit"
                    disabled={input.trim().length === 0 || isPending || !token}
                    className="shrink-0 w-10 h-9 p-0"
                >
                    {isPending ? <Loader className="animate-spin" size={18} /> : <SendHorizontal size={18} />}
                </Button>
            </div>
        </form>
    )
}

export default MessageInput
