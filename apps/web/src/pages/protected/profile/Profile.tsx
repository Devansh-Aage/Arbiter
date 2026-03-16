import { useGetAccessToken } from "@coinbase/cdp-hooks";
import { useQuery } from "@tanstack/react-query";
import { useState, type FC, useEffect } from "react"
import { type User as UserType } from "@arbiter/db/src/types"
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProfileProps {
}

const Profile: FC<ProfileProps> = ({ }) => {
    const { logout } = useAuth()
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);
    const { data: userData, isLoading: isUserDataLoading } = useQuery({
        queryKey: ["userData"],
        queryFn: async (): Promise<{ user: UserType }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/user`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })

    const email = userData?.user.email ?? "";
    const wallet = userData?.user.wallet ?? "Wallet not connected";
    const avatarLetter = email.charAt(0).toUpperCase() || "?";

    return (
        <div className="flex flex-1 items-start pt-20 justify-center bg-background px-6 py-10">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-sm">
                {isUserDataLoading ? (
                    <p className="text-center text-sm text-muted-foreground">Loading profile...</p>
                ) : userData?.user ? (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
                            {avatarLetter}
                        </div>

                        <div className="space-y-2">
                            <h1 className="break-all text-2xl font-semibold text-foreground">{email}</h1>
                            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground/70">
                                    Wallet Address
                                </p>
                                <p className="break-all">{wallet}</p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <p className="text-center text-sm text-muted-foreground">Unable to load profile details.</p>
                )}
            </div>
        </div>
    )
}

export default Profile