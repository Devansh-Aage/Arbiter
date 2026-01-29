import { useAuth } from "@/context/AuthContext";
import type { Organization } from "@arbiter/db/src/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FunctionComponent } from "react";
import OrgCard from "@/components/dashboard/org/OrgCard";
import CreateOrg from "@/components/dashboard/org/CreateOrg";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

interface OrgDashboardProps { }

const OrgDashboard: FunctionComponent<OrgDashboardProps> = () => {

    const { token } = useAuth();
    const { data: orgs, isLoading: isOrgLoading } = useQuery({
        queryKey: ["orgs"],
        queryFn: async (): Promise<{ orgs: Organization[] }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}org`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })

    return (
        <div className="p-6 w-full min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Organizations</h1>
                <CreateOrg />
            </div>

            {isOrgLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3 p-6 border rounded-xl">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex justify-between pt-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !orgs?.orgs || orgs.orgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No Organizations Found</h2>
                    <p className="text-muted-foreground max-w-md">
                        You haven't joined any organizations yet. Create or join an organization to get started.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orgs.orgs.map((org) => (
                        <OrgCard key={org.id} organization={org} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrgDashboard;
