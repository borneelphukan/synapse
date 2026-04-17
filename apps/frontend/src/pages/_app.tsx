import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Synapse AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}
