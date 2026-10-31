import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
export const metadata: Metadata = {
 title: {default:"Magix Household Products | We Mean Clean",template:"%s | Magix Household Products"},
 description:"Magix Household Products — mops, brooms, floor wipers, toilet brushes and household cleaning essentials from Bengaluru.",
 icons:{icon:"/magix-favicon.png",shortcut:"/favicon.ico",apple:"/apple-touch-icon.png"}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{var t=localStorage.getItem('magix-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}"}}/></head><body>{children}</body></html>}
