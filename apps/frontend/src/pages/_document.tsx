import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full antialiased">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" crossOrigin="anonymous" />
        <meta name="description" content="Upload meeting transcripts and extract decisions, participants, and relationships with AI." />
      </Head>
      <body className="min-h-full flex flex-col bg-slate-950 transition-colors duration-300">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
