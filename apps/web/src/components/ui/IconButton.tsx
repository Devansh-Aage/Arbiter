import { Loader } from 'lucide-react'
import type { ButtonHTMLAttributes, FC, ReactNode } from 'react'

interface IconBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode
    title: string
    className?: string
    onClick?: () => void
    disabled?: boolean
}

const IconBtn: FC<IconBtnProps> = ({ icon, title, className, onClick, disabled, ...props }) => {
    return (
        <button onClick={onClick} {...props} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-white
        border-2 border-transparent focus:border-slate-500 active:border-slate-600  ${disabled ? 'opcaity-60' : 'bg-primary hover:opacity-85'} ${className}`}>
            {disabled ? <Loader className='animate-spin' /> : icon}
            <div className='h-6 w-px bg-foreground opacity-40 border-0' />
            <span className='font-semibold'>{disabled ? 'Loading...' : title}</span>
        </button>
    )
}

export default IconBtn