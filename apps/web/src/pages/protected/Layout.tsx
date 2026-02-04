import Sidebar from "@/components/dashboard/Sidebar"
import type { FC } from "react"
import { Outlet } from "react-router"

interface LayoutProps {
}

const Layout: FC<LayoutProps> = ({ }) => {
    return (
        <div className='w-full h-screen font-nunito flex'>
            <Sidebar />
            <Outlet />
        </div>
    )
}

export default Layout