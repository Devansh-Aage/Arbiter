import { type FC, type ReactNode } from 'react'
import { NavLink } from 'react-router'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
interface SideLinkProps {
    icon: ReactNode
    text: string
    to: string
}

const SideLink: FC<SideLinkProps> = ({ icon, text, to }) => {
    return (
        <Tooltip>
            <TooltipTrigger>
                <NavLink to={to} className={({ isActive }) => `relative size-10 flex items-center justify-center hover:opacity-85 rounded-md ${isActive ? "dark:bg-cyan-400 bg-cyan-950 text-white" : "dark:bg-cyan-800 bg-cyan-700 text-slate-200"}`}>
                    {icon}
                </NavLink>
            </TooltipTrigger>
            <TooltipContent side='right'>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>

    )
}

export default SideLink