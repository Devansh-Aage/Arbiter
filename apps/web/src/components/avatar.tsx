import { cn } from '@/lib/utils'
import { type FC } from 'react'

interface AvatarProps {
    email?: string
    imgLink?: string
    className?: string
}

const Avatar: FC<AvatarProps> = ({ email, imgLink, className }) => {
    if (email) {
        return (
            <div className={cn(
                "  bg-pink-900 rounded-full flex items-center justify-center text-white text-lg ",
                "size-10",
                className
            )}>{email.charAt(0).toUpperCase()}</div>
        )
    }
    if (imgLink) {
        return (
            <div className={cn(
                "   rounded-full flex items-center justify-center ",
                "size-10",
                className
            )}>
                <img src={imgLink} className='object-cover rounded-full' alt="profile" />
            </div>
        )
    }

}

export default Avatar