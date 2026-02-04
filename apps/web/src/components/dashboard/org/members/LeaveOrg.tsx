import { useAuth } from "@/context/AuthContext"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useState, type FC } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import IconBtn from "@/components/ui/IconButton"
import { DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeaveOrgProps {
    orgId: string;
    membershipId: string;
}

const LeaveOrg: FC<LeaveOrgProps> = ({ orgId, membershipId }) => {
    const { token } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const removeMemberMutation = useMutation({
        mutationFn: async () => await axios.post(`${import.meta.env.VITE_HTTP_URL}org/remove-member`, {
            orgId: orgId,
            membershipId: membershipId,
        }, {
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

    const handleRemoveMember = () => {
        removeMemberMutation.mutate()
        setIsOpen(false)
        navigate("/dashboard/orgs")
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <IconBtn icon={<DoorOpen className="size-5" />} title="Leave Organization" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave Organization</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to leave this organization?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleRemoveMember}
                    >
                        Leave
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default LeaveOrg