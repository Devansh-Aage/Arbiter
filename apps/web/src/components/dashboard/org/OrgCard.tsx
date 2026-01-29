import type { FunctionComponent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organization } from "@arbiter/db/src/types";
import { Users, Calendar } from "lucide-react";

interface OrgCardProps {
    organization: Organization & { _count?: { memberships: number } };
}

const OrgCard: FunctionComponent<OrgCardProps> = ({ organization }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
                <CardTitle className="text-xl">{organization.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {organization.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                            {organization.memberships.length ?? 0} {organization.memberships.length === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(organization.createdAt)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrgCard;
