import type { FC } from "react"
import { useState } from "react"
import type { MemberTableData } from "@arbiter/db/src/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MoreVertical, Save } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router";
import { toast } from "sonner";

interface MemberTableProps {
    members: MemberTableData[];
}

const MemberTable: FC<MemberTableProps> = ({ members }) => {
    const [editingVoteWeight, setEditingVoteWeight] = useState<string | null>(null)
    const [voteWeightValues, setVoteWeightValues] = useState<Record<string, number>>({})
    const [changedValues, setChangedValues] = useState<Set<string>>(new Set())
    const queryClient = useQueryClient();
    const params = useParams();
    const { orgId } = params;
    const { token, email: userEmail } = useAuth();

    const user = members.find((member) => member.user.email === userEmail);
    const isAuthorized = user?.role === "CREATOR" || user?.role === "ADMIN";

    const handleVoteWeightClick = (memberId: string, currentValue: number) => {
        setEditingVoteWeight(memberId)
        if (!voteWeightValues[memberId]) {
            setVoteWeightValues(prev => ({ ...prev, [memberId]: currentValue }))
        }
    }

    const handleVoteWeightChange = (memberId: string, value: number, originalValue: number) => {
        setVoteWeightValues(prev => ({ ...prev, [memberId]: value }))
        if (value !== originalValue) {
            setChangedValues(prev => new Set(prev).add(memberId))
        } else {
            setChangedValues(prev => {
                const newSet = new Set(prev)
                newSet.delete(memberId)
                return newSet
            })
        }
    }

    const updateVoteWeightMutation = useMutation({
        mutationFn: async (data: { memberId: string, voteWeight: number }) => await axios.post(`${import.meta.env.VITE_HTTP_URL}org/vote-weight`, {
            membershipId: data.memberId,
            orgId: orgId,
            voteWeight: data.voteWeight,
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
            queryClient.invalidateQueries({ queryKey: ['org', orgId, 'members'] })
        }
    })

    const handleSaveVoteWeight = (memberId: string) => {
        updateVoteWeightMutation.mutate({ memberId, voteWeight: voteWeightValues[memberId] })
        setEditingVoteWeight(null)
        setChangedValues(prev => {
            const newSet = new Set(prev)
            newSet.delete(memberId)
            return newSet
        })
    }

    const makeAdminMutation = useMutation({
        mutationFn: async (memberId: string) => await axios.post(`${import.meta.env.VITE_HTTP_URL}org/add-admin`, {
            membershipId: memberId,
            orgId: orgId,
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
            console.error("Failed to make admin: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['org', orgId, 'members'] })
        }
    })

    const removeAdminRoleMutation = useMutation({
        mutationFn: async (memberId: string) => await axios.post(`${import.meta.env.VITE_HTTP_URL}org/remove-admin`, {
            membershipId: memberId,
            orgId: orgId,
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
            console.error("Failed to remove admin role: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['org', orgId, 'members'] })
        }
    })

    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: string) => await axios.post(`${import.meta.env.VITE_HTTP_URL}org/remove-member`, {
            membershipId: memberId,
            orgId: orgId,
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
            console.error("Failed to remove member: ", err)
            toast.error("An unexpected error occurred!")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['org', orgId, 'members'] })
        }
    })

    const handleMakeAdmin = (memberId: string) => {
        makeAdminMutation.mutate(memberId)
    }

    const handleRemoveAdminRole = (memberId: string) => {
        removeAdminRoleMutation.mutate(memberId)
    }

    const handleRemoveMember = (memberId: string) => {
        removeMemberMutation.mutate(memberId)
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Vote Weight</TableHead>
                        <TableHead>Joined At</TableHead>
                        {
                            isAuthorized &&
                            <TableHead className="">Actions</TableHead>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(
                        members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                    {member.user.email}
                                </TableCell>
                                <TableCell>
                                    {member.role}
                                </TableCell>
                                <TableCell>
                                    {
                                        isAuthorized ?
                                            editingVoteWeight === member.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={voteWeightValues[member.id] ?? member.voteWeight}
                                                        onChange={(e) => handleVoteWeightChange(
                                                            member.id,
                                                            Number(e.target.value),
                                                            member.voteWeight
                                                        )}
                                                        min={1}
                                                        className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                        autoFocus
                                                    />
                                                    {changedValues.has(member.id) && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveVoteWeight(member.id)}
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleVoteWeightClick(member.id, member.voteWeight)}
                                                    className="font-normal"
                                                >
                                                    {voteWeightValues[member.id] ?? member.voteWeight}
                                                </Button>
                                            )
                                            :
                                            member.voteWeight
                                    }
                                </TableCell>
                                <TableCell>
                                    {new Date(member.createdAt).toLocaleDateString()}
                                </TableCell>
                                {
                                    isAuthorized &&
                                    <TableCell className="">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-2" align="end">
                                                {
                                                    member.role !== "CREATOR" ?
                                                        <div className="flex flex-col gap-1">
                                                            {
                                                                member.role === "MEMBER" ?
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="justify-start"
                                                                        onClick={() => handleMakeAdmin(member.id)}
                                                                    >
                                                                        Make Admin
                                                                    </Button>
                                                                    :
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="justify-start"
                                                                        onClick={() => handleRemoveAdminRole(member.id)}
                                                                    >
                                                                        Remove Admin Role
                                                                    </Button>
                                                            }

                                                            <Button
                                                                variant="ghost"
                                                                className="justify-start text-destructive hover:text-destructive"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                            >
                                                                Remove Member
                                                            </Button>
                                                        </div>
                                                        :
                                                        <p>No Actions Available</p>
                                                }
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                }
                            </TableRow>
                        )
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default MemberTable