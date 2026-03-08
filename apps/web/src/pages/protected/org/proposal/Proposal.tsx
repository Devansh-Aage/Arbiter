import socket from "@/lib/socket"
import { useEffect, type FC } from "react"

interface ProposalProps {
}

const Proposal: FC<ProposalProps> = ({ }) => {
    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        return (() => {
            socket.disconnect()
        })
    }, [])

    return (
        <div className="w-full p-4">
            hey
        </div>
    )
}

export default Proposal