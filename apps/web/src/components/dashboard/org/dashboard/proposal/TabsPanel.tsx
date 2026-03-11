import type { FC } from "react"
import { NavLink } from "react-router"

interface TabsPanelProps {
}

const paths = [
    {
        title: "Overview",
        path: `overview`
    },
    {
        title: "Chat",
        path: `chat`
    },
    {
        title: "Vote",
        path: `vote`
    },
    {
        title: "Settings",
        path: `settings`
    },
]

const TabsPanel: FC<TabsPanelProps> = ({ }) => {
    return (
        <div className="w-full font-semibold flex items-center gap-4 border-b border-zinc-800">
            {
                paths.map((p) => (
                    <NavLink to={p.path} className={({ isActive }) => `relative px-4 py-2 flex  text-xl items-center justify-center hover:text-white rounded-md ${isActive ? "text-white underline underline-offset-4" : " text-slate-300"}`}>
                        {p.title}
                    </NavLink>
                )
                )
            }
        </div>
    )
}

export default TabsPanel