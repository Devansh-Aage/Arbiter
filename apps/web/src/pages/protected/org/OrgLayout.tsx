import OrgSidebar from "@/components/dashboard/org/OrgSidebar"
import type { FC } from "react"
import { Outlet, useParams } from "react-router"

interface OrgLayoutProps {
}

const OrgLayout: FC<OrgLayoutProps> = ({ }) => {
    let params = useParams();
    console.log(params);

    return (
        <div className='w-full h-screen font-nunito flex '>
            <OrgSidebar />
            <Outlet />
        </div>
    )
}

export default OrgLayout