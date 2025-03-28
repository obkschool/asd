import { ConvexProvider, ConvexReactClient } from "convex/react";
import '../styles/globals.css';

// Create a Convex client using the API URL from your dashboard
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://adorable-spider-894.convex.cloud");

function MyApp({ Component, pageProps }) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />
    </ConvexProvider>
  );
}

export default MyApp; 