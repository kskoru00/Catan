import PlayersProvider from "providers/players";

import Layout from "components/Layout";

import "styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <PlayersProvider>
        <Component {...pageProps} />
      </PlayersProvider>
    </Layout>
  );
}
