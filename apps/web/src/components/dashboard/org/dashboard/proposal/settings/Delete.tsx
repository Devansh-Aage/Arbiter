import { type FC, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import InputArbiter from "@/components/ui/InputArbiter"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { useGetAccessToken } from "@coinbase/cdp-hooks"

interface DeleteProps {
    proposalId: string;
    proposalName: string;
    orgId: string;
    token: string;
}

const Delete: FC<DeleteProps> = ({ proposalId, proposalName, orgId, token }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const isDeleteEnabled = confirmText === proposalName

    const deleteProposalMutation = useMutation({
        mutationFn: async () => await axios.delete(`${import.meta.env.VITE_HTTP_URL}proposal/${proposalId}`, {
            headers: {
                authToken: token,
            },
        }),
        onSuccess: () => {
            toast.success("Proposal deleted successfully.")
            navigate(`/dashboard/orgs/${orgId}/dashboard`)
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.message)
                return
            }
            console.error("Failed to delete proposal: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["org", orgId, "proposals"] })
        },
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Delete Proposal</CardTitle>
                <CardDescription>
                    This action is permanent and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete Proposal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Proposal</DialogTitle>
                            <DialogDescription>
                                Type the proposal name to confirm deletion.
                            </DialogDescription>
                        </DialogHeader>
                        <InputArbiter
                            title="Proposal Name"
                            htmlFor="confirm-proposal-name"
                            id="confirm-proposal-name"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Type "${proposalName}" to confirm`}
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsOpen(false)
                                    setConfirmText("")
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!token || !isDeleteEnabled || deleteProposalMutation.isPending}
                                onClick={() => {
                                    deleteProposalMutation.mutate()
                                    setIsOpen(false)
                                    setConfirmText("")
                                }}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default Delete