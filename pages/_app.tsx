import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { WalletProvider } from '@/context/WalletContext'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <WalletProvider>
          <CartProvider>
            <Component {...pageProps} />
          </CartProvider>
        </WalletProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
