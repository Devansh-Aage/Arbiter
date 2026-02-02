import type { FC } from "react"
import OrgSideLink from "./OrgSideLink"
import { Home, Settings, Users } from "lucide-react"
import { useParams } from "react-router"

interface OrgSidebarProps {
}

const OrgSidebar: FC<OrgSidebarProps> = ({ }) => {
    const { orgId } = useParams<{ orgId: string }>();

    return (
        <div className='max-w-64 h-full font-nunito bg-sidebar flex flex-col gap-4 items-center p-4'>
            <p>Organization</p>
            <div className='flex flex-col gap-3 w-full'>
                <OrgSideLink to={`/dashboard/orgs/${orgId}/dashboard`} icon={<Home size={20} />} text='Dashboard' />
                <OrgSideLink to={`/dashboard/orgs/${orgId}/members`} icon={<Users size={20} />} text='Members' />
                <OrgSideLink to={`/dashboard/orgs/${orgId}/settings`} icon={<Settings size={20} />} text='Settings' />
            </div>
        </div>
    )
}

export default OrgSidebar