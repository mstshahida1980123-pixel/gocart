import { Outfit } from "next/font/google";
import Providers from './Providers'
import prisma from '@/lib/prisma'
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

const defaultSettings = {
    title: "GoCart. - Shop smarter",
    description: "GoCart is the online shop for curated gadgets, essentials, and fast support.",
    keywords: ['electronics', 'gadgets', 'shopping', 'online store', 'technology'],
}

export async function generateMetadata() {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'site' } })
    const siteName = settings?.siteName || 'GoCart'
    const title = settings?.seoTitle || `${siteName} - Shop smarter`
    const description = settings?.metaDescription || defaultSettings.description
    const keywords = settings?.metaKeywords ? settings.metaKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean) : defaultSettings.keywords

    return {
        title,
        description,
        keywords,
    }
}

export default async function RootLayout({ children }) {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'site' } })
    const facebookPixelId = settings?.facebookPixelId || ''
    const googleAnalyticsId = settings?.googleAnalyticsId || ''
    const googleTagManagerId = settings?.googleTagManagerId || ''

    const fbPixelScript = facebookPixelId ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${facebookPixelId}'); fbq('track', 'PageView');` : ''
    const gaScript = googleAnalyticsId ? `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${googleAnalyticsId}');` : ''
    const gtmScript = googleTagManagerId ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');` : ''

    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                {googleTagManagerId ? (
                    <script dangerouslySetInnerHTML={{ __html: gtmScript }} />
                ) : null}
                {facebookPixelId ? (
                    <script dangerouslySetInnerHTML={{ __html: fbPixelScript }} />
                ) : null}
                {googleAnalyticsId ? (
                    <>
                        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}></script>
                        <script dangerouslySetInnerHTML={{ __html: gaScript }} />
                    </>
                ) : null}
                {googleTagManagerId ? (
                    <noscript>
                        <iframe src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
                    </noscript>
                ) : null}
                <Providers siteSettings={settings}>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
