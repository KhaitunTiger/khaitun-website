import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { LanguageProvider } from '../context/LanguageContext'
import { WalletProvider } from '../context/WalletContext'


import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <LanguageProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </LanguageProvider>
    </WalletProvider>
  )
}
