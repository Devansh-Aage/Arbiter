import { type FC, type ReactNode } from 'react'
import { NavLink } from 'react-router'

interface OrgSideLinkProps {
    icon: ReactNode
    text: string
    to: string
}

const OrgSideLink: FC<OrgSideLinkProps> = ({ icon, text, to }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md hover:opacity-85 transition-all ${isActive
                    ? "bg-primary text-white"
                    : "bg-purple-900 text-slate-300"
                }`
            }
        >
            {icon}
            <span className="text-sm font-medium">{text}</span>
        </NavLink>
    )
}

export default OrgSideLink