import { type FC, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import InputArbiter from "@/components/ui/InputArbiter"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { useGetAccessToken } from "@coinbase/cdp-hooks"

interface DeleteOrgProps {
    orgName: string;
    orgId: string;
}

const DeleteOrg: FC<DeleteOrgProps> = ({ orgName, orgId }) => {
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const queryClient = useQueryClient()
    const isDeleteEnabled = confirmText === orgName
    const navigate = useNavigate()

    const deleteOrgMutation = useMutation({
        mutationFn: async () => await axios.delete(`${import.meta.env.VITE_HTTP_URL}org/${orgId}`, {
            headers: {
                authToken: token,
            },
        }),
        onError: (err) => {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data.message)
                return;
            }
            console.error("Failed to update vote weight: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['orgs'] })
        }
    })

    const handleDelete = () => {
        deleteOrgMutation.mutate()
        setIsOpen(false)
        setConfirmText("")
        navigate("/dashboard/orgs")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Delete Organization</CardTitle>
                <CardDescription>
                    This action is permanent. All the data and members will be removed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete Organization</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Organization</DialogTitle>
                            <DialogDescription>
                                This action is permanent. All the data and members will be removed.
                            </DialogDescription>
                        </DialogHeader>
                        <InputArbiter
                            title="Organization Name"
                            htmlFor="confirm-org-name"
                            id="confirm-org-name"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Type "${orgName}" to confirm`}
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
                                disabled={!isDeleteEnabled}
                                onClick={handleDelete}
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

export default DeleteOrg