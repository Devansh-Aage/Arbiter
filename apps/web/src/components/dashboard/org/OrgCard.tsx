import type { FunctionComponent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organization } from "@arbiter/db/src/types";
import { Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

interface OrgCardProps {
    organization: Organization & { _count?: { memberships: number } };
}

const OrgCard: FunctionComponent<OrgCardProps> = ({ organization }) => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    return (
        <Card className="hover:ring hover:ring-primary transition-all cursor-pointer" onClick={() => navigate(`/dashboard/orgs/${organization.id}/dashboard`)}>
            <CardHeader>
                <CardTitle className="text-xl">{organization.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                            {organization.memberships.length ?? 0} {organization.memberships.length === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        {(() => {
                            const createdAt = organization.memberships.find((m) => m.userId === userId)?.createdAt;
                            return (
                                <>
                                    Joined on:
                                    <span>
                                        {createdAt ? formatDate(createdAt) : "N/A"}
                                    </span>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrgCard;
