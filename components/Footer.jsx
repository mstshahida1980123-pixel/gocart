"use client"
import { useEffect, useState } from 'react'
import Link from "next/link";
import { useSiteSettings } from '@/context/SiteSettingsContext'

const Footer = () => {

    const MailIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14.6654 4.66699L8.67136 8.48499C8.46796 8.60313 8.23692 8.66536 8.0017 8.66536C7.76647 8.66536 7.53544 8.60313 7.33203 8.48499L1.33203 4.66699M2.66536 2.66699H13.332C14.0684 2.66699 14.6654 3.26395 14.6654 4.00033V12.0003C14.6654 12.7367 14.0684 13.3337 13.332 13.3337H2.66536C1.92898 13.3337 1.33203 12.7367 1.33203 12.0003V4.00033C1.33203 3.26395 1.92898 2.66699 2.66536 2.66699Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const PhoneIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9.22003 11.045C9.35772 11.1082 9.51283 11.1227 9.65983 11.086C9.80682 11.0493 9.93692 10.9636 10.0287 10.843L10.2654 10.533C10.3896 10.3674 10.5506 10.233 10.7357 10.1404C10.9209 10.0479 11.125 9.99967 11.332 9.99967H13.332C13.6857 9.99967 14.0248 10.1402 14.2748 10.3902C14.5249 10.6402 14.6654 10.9794 14.6654 11.333V13.333C14.6654 13.6866 14.5249 14.0258 14.2748 14.2758C14.0248 14.5259 13.6857 14.6663 13.332 14.6663C10.1494 14.6663 7.09719 13.4021 4.84675 11.1516C2.59631 8.90119 1.33203 5.84894 1.33203 2.66634C1.33203 2.31272 1.47251 1.97358 1.72256 1.72353C1.9726 1.47348 2.31174 1.33301 2.66536 1.33301H4.66536C5.01899 1.33301 5.35812 1.47348 5.60817 1.72353C5.85822 1.97358 5.9987 2.31272 5.9987 2.66634V4.66634C5.9987 4.87333 5.9505 5.07749 5.85793 5.26263C5.76536 5.44777 5.63096 5.60881 5.46536 5.73301L5.15336 5.96701C5.03098 6.06046 4.94471 6.1934 4.90923 6.34324C4.87374 6.49308 4.89122 6.65059 4.9587 6.78901C5.86982 8.63959 7.36831 10.1362 9.22003 11.045Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const MapPinIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13.3346 6.66634C13.3346 9.99501 9.64197 13.4617 8.40197 14.5323C8.28645 14.6192 8.14583 14.6662 8.0013 14.6662C7.85677 14.6662 7.71615 14.6192 7.60064 14.5323C6.36064 13.4617 2.66797 9.99501 2.66797 6.66634C2.66797 5.25185 3.22987 3.8953 4.23007 2.89511C5.23026 1.89491 6.58681 1.33301 8.0013 1.33301C9.41579 1.33301 10.7723 1.89491 11.7725 2.89511C12.7727 3.8953 13.3346 5.25185 13.3346 6.66634Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M8.0013 8.66634C9.10587 8.66634 10.0013 7.77091 10.0013 6.66634C10.0013 5.56177 9.10587 4.66634 8.0013 4.66634C6.89673 4.66634 6.0013 5.56177 6.0013 6.66634C6.0013 7.77091 6.89673 8.66634 8.0013 8.66634Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const FacebookIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14.9987 1.66699H12.4987C11.3936 1.66699 10.3338 2.10598 9.55242 2.88738C8.77102 3.66878 8.33203 4.72859 8.33203 5.83366V8.33366H5.83203V11.667H8.33203V18.3337H11.6654V11.667H14.1654L14.9987 8.33366H11.6654V5.83366C11.6654 5.61265 11.7532 5.40068 11.9094 5.2444C12.0657 5.08812 12.2777 5.00033 12.4987 5.00033H14.9987V1.66699Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const InstagramIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14.5846 5.41699H14.593M5.83464 1.66699H14.168C16.4692 1.66699 18.3346 3.53247 18.3346 5.83366V14.167C18.3346 16.4682 16.4692 18.3337 14.168 18.3337H5.83464C3.53345 18.3337 1.66797 16.4682 1.66797 14.167V5.83366C1.66797 3.53247 3.53345 1.66699 5.83464 1.66699ZM13.3346 9.47533C13.4375 10.1689 13.319 10.8772 12.9961 11.4995C12.6732 12.1218 12.1623 12.6265 11.536 12.9417C10.9097 13.2569 10.2 13.3667 9.50779 13.2553C8.81557 13.1439 8.1761 12.8171 7.68033 12.3213C7.18457 11.8255 6.85775 11.1861 6.74636 10.4938C6.63497 9.80162 6.74469 9.0919 7.05991 8.46564C7.37512 7.83937 7.87979 7.32844 8.50212 7.00553C9.12445 6.68261 9.83276 6.56415 10.5263 6.66699C11.2337 6.7719 11.8887 7.10154 12.3944 7.60725C12.9001 8.11295 13.2297 8.76789 13.3346 9.47533Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const TwitterIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M18.3346 3.33368C18.3346 3.33368 17.7513 5.08368 16.668 6.16701C18.0013 14.5003 8.83464 20.5837 1.66797 15.8337C3.5013 15.917 5.33464 15.3337 6.66797 14.167C2.5013 12.917 0.417969 8.00034 2.5013 4.16701C4.33464 6.33368 7.16797 7.58368 10.0013 7.50034C9.2513 4.00034 13.3346 2.00034 15.8346 4.33368C16.7513 4.33368 18.3346 3.33368 18.3346 3.33368Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const LinkedinIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13.3346 6.66699C14.6607 6.66699 15.9325 7.19378 16.8702 8.13146C17.8079 9.06914 18.3346 10.3409 18.3346 11.667V17.5003H15.0013V11.667C15.0013 11.225 14.8257 10.801 14.5131 10.4885C14.2006 10.1759 13.7767 10.0003 13.3346 10.0003C12.8926 10.0003 12.4687 10.1759 12.1561 10.4885C11.8436 10.801 11.668 11.225 11.668 11.667V17.5003H8.33464V11.667C8.33464 10.3409 8.86142 9.06914 9.7991 8.13146C10.7368 7.19378 12.0086 6.66699 13.3346 6.66699Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M5.0013 7.50033H1.66797V17.5003H5.0013V7.50033Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M3.33464 5.00033C4.25511 5.00033 5.0013 4.25413 5.0013 3.33366C5.0013 2.41318 4.25511 1.66699 3.33464 1.66699C2.41416 1.66699 1.66797 2.41318 1.66797 3.33366C1.66797 4.25413 2.41416 5.00033 3.33464 5.00033Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const YoutubeIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.667 5.83301C16.3337 4.56199 15.3667 3.59399 14.0957 3.26066C12.5174 2.83368 10.0001 2.83368 10.0001 2.83368C10.0001 2.83368 7.48245 2.83368 5.9041 3.26066C4.63308 3.59399 3.66675 4.56199 3.33341 5.83301C2.91675 7.45799 2.91675 10.0003 2.91675 10.0003C2.91675 10.0003 2.91675 12.5427 3.33341 14.1677C3.66675 15.4387 4.63308 16.4067 5.9041 16.7401C7.48245 17.1671 10.0001 17.1671 10.0001 17.1671C10.0001 17.1671 12.5174 17.1671 14.0957 16.7401C15.3667 16.4067 16.3337 15.4387 16.667 14.1677C17.0837 12.5427 17.0837 10.0003 17.0837 10.0003C17.0837 10.0003 17.0837 7.45799 16.667 5.83301Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.74935 12.4997V7.49971L12.4993 10.0003L8.74935 12.4997Z" fill="#90A1B9"/></svg>)
    const TiktokIcon = () => (<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.666 2.5C11.666 3.78633 10.6197 4.83267 9.33333 4.83267C8.04699 4.83267 7.00066 3.78633 7.00066 2.5C7.00066 2.5 4.00066 2.5 4.00066 9.16633C4.00066 13.4363 6.89799 16.4997 11.0053 16.4997C14.5033 16.4997 16.666 14.4163 16.666 11.6663C16.666 11.6663 14.666 11.6663 14.666 13.6663C14.666 15.1663 13.4027 16.4997 11.666 16.4997C9.42999 16.4997 7.66699 14.7367 7.66699 12.5003C7.66699 10.2637 9.42999 8.50067 11.666 8.50067C12.1827 8.50067 12.6653 8.59267 13.1113 8.757C13.1113 8.757 13.1113 6.66633 13.1113 5.00033C12.6693 4.89501 12.2193 4.83401 11.7667 4.81801C11.9157 5.10501 11.9993 5.41501 11.9993 5.74101V8.50067C11.8327 8.45667 11.666 8.43301 11.4993 8.43301C10.1827 8.43301 9.09999 9.51667 9.09999 10.8337C9.09999 12.1507 10.1827 13.2333 11.4993 13.2333C12.1433 13.2333 12.7413 12.9963 13.1707 12.5913C13.1707 12.5913 13.1707 13.0963 13.1707 13.3333C13.1707 14.7933 12.0933 15.9163 10.6333 15.9163C9.17333 15.9163 8.04666 14.7897 8.04666 13.3297C8.04666 11.8697 9.17333 10.743 10.6333 10.743C10.6333 10.743 10.6333 10.743 10.6333 10.743C10.6333 10.743 10.6333 10.743 10.6333 10.743" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)

    const parseJsonOrArray = (value) => {
        if (Array.isArray(value)) return value
        if (!value) return []
        try {
            return JSON.parse(value)
        } catch {
            return []
        }
    }

    const [linkSections, setLinkSections] = useState([
        {
            title: "PRODUCTS",
            links: [
                { text: "Earphones", path: '/', icon: null },
                { text: "Headphones", path: '/', icon: null },
                { text: "Smartphones", path: '/', icon: null },
                { text: "Laptops", path: '/', icon: null },
            ]
        },
                {
            title: "WEBSITE",
            links: [
                { text: "Home", path: '/', icon: null },
                { text: "Privacy Policy", path: '/', icon: null },
            ]
        },
        {
            title: "CONTACT",
            links: [
                { text: "+1-212-456-7890", path: '/contact', icon: PhoneIcon },
                { text: "contact@example.com", path: '/contact', icon: MailIcon },
                { text: "794 Francisco, 94102", path: '/contact', icon: MapPinIcon }
            ]
        }
    ]);

    const { settings, isLoading } = useSiteSettings()
    const [siteName, setSiteName] = useState('gocart')

    useEffect(() => {
        if (!isLoading && settings) {
            setSiteName(settings.siteName || 'gocart')
            const prodLinks = (parseJsonOrArray(settings.footerProducts) || []).map(i => ({ text: i.text || i.name || '', path: i.url || '/' }))
            const webLinks = (parseJsonOrArray(settings.footerWebsite) || []).map(i => ({ text: i.text || i.name || '', path: i.url || '/' }))
            setLinkSections([
                {
                    title: 'PRODUCTS',
                    links: prodLinks.length ? prodLinks : [
                        { text: 'Earphones', path: '/', icon: null },
                        { text: 'Headphones', path: '/', icon: null },
                        { text: 'Smartphones', path: '/', icon: null },
                        { text: 'Laptops', path: '/', icon: null },
                    ]
                },
                {
                    title: 'WEBSITE',
                    links: webLinks.length ? webLinks : [
                        { text: 'Home', path: '/', icon: null },
                        { text: 'Privacy Policy', path: '/', icon: null },
                    ]
                },
                {
                    title: 'CONTACT',
                    links: [
                        { text: settings.phone || '+1-212-456-7890', path: '/contact', icon: PhoneIcon },
                        { text: settings.email || 'contact@example.com', path: '/contact', icon: MailIcon },
                        { text: settings.address || '794 Francisco, 94102', path: '/', icon: MapPinIcon }
                    ]
                }
            ])
        }
    }, [isLoading, settings])

    const iconMap = {
        Facebook: FacebookIcon,
        Instagram: InstagramIcon,
        Twitter: TwitterIcon,
        'Twitter / X': TwitterIcon,
        'X / Twitter': TwitterIcon,
        LinkedIn: LinkedinIcon,
        YouTube: YoutubeIcon,
        TikTok: TiktokIcon,
    }

    const socialIcons = (parseJsonOrArray(settings?.socialLinks) || [])
        .filter((link) => link.url && link.url.trim())
        .map((link) => ({
            icon: iconMap[link.platform] || FacebookIcon,
            link: link.url,
        }))
    if (isLoading) return null

    return (
        <footer className="mx-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-slate-500/30 text-slate-500">
                    <div>
                        <Link href="/" className="text-4xl font-semibold text-slate-700">
                            <span className="text-green-600">{siteName.charAt(0)}</span>{siteName.slice(1)}<span className="text-green-600 text-5xl leading-0">.</span>
                        </Link>
                        <p className="max-w-[410px] mt-6 text-sm">Welcome to {siteName}, your ultimate destination for the latest and smartest gadgets. From smartphones and smartwatches to essential accessories, we bring you the best in innovation — all in one place.</p>
                        <div className="flex items-center gap-3 mt-5">
                            {socialIcons.map((item, i) => (
                                <Link href={item.link} key={i} className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:scale-105 hover:border border-slate-300 transition rounded-full">
                                    <item.icon />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5 text-sm ">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-medium text-slate-700 md:mb-5 mb-3">{section.title}</h3>
                                <ul className="space-y-2.5">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && <link.icon />}
                                            <Link href={link.path} className="hover:underline transition">{link.text}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="py-4 text-sm text-slate-500">
                    {settings?.copyrightText || 'Copyright 2025 © gocart All Right Reserved.'}
                </p>
            </div>
        </footer>
    );
};

export default Footer;