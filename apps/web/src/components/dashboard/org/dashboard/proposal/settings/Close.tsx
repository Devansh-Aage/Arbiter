import { type FC, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useGetAccessToken } from "@coinbase/cdp-hooks"

interface CloseProps {
    proposalId: string;
    token: string
}

const Close: FC<CloseProps> = ({ proposalId, token }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const closeProposalMutation = useMutation({
        mutationFn: async () => await axios.post(`${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}/close`, {}, {
            headers: {
                authToken: token,
            },
        }),
        onSuccess: () => {
            toast.success("Proposal closed successfully.")
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.message)
                return
            }
            console.error("Failed to close proposal: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId, "overview"] })
            queryClient.invalidateQueries({ queryKey: ["proposal", proposalId, "choice"] })
        },
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Close Proposal</CardTitle>
                <CardDescription>
                    Closing a proposal ends voting and prevents future votes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Close Proposal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Close Proposal</DialogTitle>
                            <DialogDescription>
                                This will end voting for this proposal immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!token || closeProposalMutation.isPending}
                                onClick={() => {
                                    closeProposalMutation.mutate()
                                    setIsOpen(false)
                                }}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default Close