import { useState, useEffect, type FC } from 'react'
import SideLink from './SideLink'
import { Building, LogOut, Moon, Settings, Sun, User } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import axios from "axios"
import { type User as UserType } from "@arbiter/db/src/types"
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '../theme-provider'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import Avatar from '../avatar'
import { useGetAccessToken } from '@coinbase/cdp-hooks'


interface SidebarProps {

}

const Sidebar: FC<SidebarProps> = ({ }) => {
    const { logout } = useAuth()
    const { theme, setTheme } = useTheme();
    const { getAccessToken } = useGetAccessToken();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const token = await getAccessToken();
            setToken(token);
        })();
    }, []);
    const { data: userData, isLoading: isUserDataLoading } = useQuery({
        queryKey: ["userData"],
        queryFn: async (): Promise<{ user: UserType }> => {
            const res = await axios.get(`${import.meta.env.VITE_HTTP_URL}auth/user`, {
                headers: {
                    "authToken": token
                }
            });
            return res.data
        },
        enabled: !!token
    })


    return (
        <div className='w-16 h-full font-nunito bg-sidebar flex flex-col justify-between items-center'>
            <div className=''>
                <p className='font-semibold text-3xl mt-5 mb-10 text-center'>A</p>
                <div className='flex flex-col gap-3 '>
                    <SideLink to="/dashboard/orgs" icon={<Building size={20} />} text='Organizations' />
                    <SideLink to="/dashboard/profile" icon={<User size={20} />} text='Profile' />
                    <SideLink to="/dashboard/settings" icon={<Settings size={20} />} text='Settings' />
                </div>
            </div>
            <div className='pb-5 flex flex-col gap-5 justify-center items-center'>
                <Button variant={'outline'} className='size-8 rounded-full'
                    onClick={() => {
                        theme === "dark" ?
                            setTheme('light') : setTheme("dark")
                    }}>
                    {
                        theme === "dark" ?
                            <Moon size={5} className="" />
                            :
                            <Sun size={5} className="" />
                    }
                </Button>
                {
                    isUserDataLoading ?
                        <Skeleton className='rounded-full size-10' />
                        :
                        <Popover>
                            <PopoverTrigger >
                                <Avatar className='cursor-pointer' email={userData?.user.email} />
                            </PopoverTrigger>
                            <PopoverContent className='py-2 px-3 w-fit font-medium'>
                                <div>
                                    <div>
                                        {userData?.user.username}
                                    </div>
                                    <div className='text-foreground/80 font-light'>
                                        {userData?.user.email}
                                    </div>
                                </div>
                                <Separator className='my-2' />
                                <div>
                                    <Button variant={'ghost'} onClick={logout} size="sm" className='flex items-center justify-between w-full'>
                                        Log Out
                                        <LogOut />
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                }
            </div>
        </div>
    )
}

export default Sidebar