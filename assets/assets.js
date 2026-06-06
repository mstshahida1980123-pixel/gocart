import upload_area from "./upload_area.svg"
import { ZapIcon, ShieldCheckIcon, BadgeCheckIcon } from "lucide-react"

export const assets = {
    upload_area,
}

export const categories = ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];



export const ourSpecsData = [
    {
        title: 'Fast Delivery',
        description: 'Delivery within 24-72 hours depending on location.',
        accent: '#06b6d4',
        icon: ZapIcon,
    },
    {
        title: 'Secure Payments',
        description: 'Multiple secure payment options supported.',
        accent: '#f97316',
        icon: ShieldCheckIcon,
    },
    {
        title: 'Quality Guarantee',
        description: 'All products inspected for quality before shipping.',
        accent: '#10b981',
        icon: BadgeCheckIcon,
    },
];
