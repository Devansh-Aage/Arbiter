import { publicClient } from "@/lib/viem"
import { toViemAccount } from "@coinbase/cdp-core"
import { useCurrentUser } from "@coinbase/cdp-hooks"
import { Verified } from "lucide-react"
import { useEffect, type FC, useState } from "react"
import { useLocation } from "react-router"

interface VerifyProps {
}

const Verify: FC<VerifyProps> = ({ }) => {
    const { timestamp, choiceId, proposalId, signature, wallet } = useLocation().state as { timestamp: number, choiceId: string, proposalId: string, signature: string, wallet: string }
    const [isVerifying, setIsVerifying] = useState(false)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        (async () => {
            setIsVerifying(true)
            const msg = {
                timestamp,
                choiceId,
                proposalId,
                app: "arbiter"
            }
            const isValid = await publicClient.verifyMessage({
                address: wallet as `0x{string}`,
                message: JSON.stringify(msg),
                signature: signature as `0x{string}`
            })
            console.log(isValid)
            setIsValid(isValid)
            setIsVerifying(false)
        })()
    }, [])


    return (
        <div className=" flex flex-col items-center justify-center bg-background text-foreground relative p-6">
            <div className="flex flex-col items-center gap-6">
                {isVerifying ? (
                    <>
                        <div className="animate-pulse text-5xl font-bold tracking-tight text-blue-400">
                            Verifying Vote...
                        </div>
                        <div className="flex gap-2 mt-2">
                            <span className="w-3 h-3 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-3 h-3 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-3 h-3 rounded-full bg-blue-400 animate-bounce" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div
                            className={`text-6xl font-extrabold tracking-tight ${isValid ? "text-green-400" : "text-red-400"
                                }`}
                        >
                            {isValid ? "Vote Valid" : "Vote Invalid"}
                        </div>
                        <div
                            className={`text-xl font-medium ${isValid ? "text-green-300" : "text-red-300"
                                }`}
                        >
                            {isValid
                                ? "This vote has been verified and is authentic."
                                : "This vote could not be verified. The signature may be invalid or tampered."}
                        </div>
                        <div
                            className={`mt-2 px-5 py-2 rounded-full text-sm font-semibold ${isValid
                                ? "bg-green-500/20 text-green-300 border border-green-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                                }`}
                        >
                            {isValid ? "✓ Signature Verified" : "✗ Signature Invalid"}
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-foreground/70 text-sm">
                <Verified className="size-5" />
                Verified by Crypto Wallet Signatures
            </div>
        </div>
    )
}

export default Verify