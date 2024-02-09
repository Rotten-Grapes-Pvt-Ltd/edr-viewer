import { Inter } from "next/font/google";
import "./globals.css";
import QueryClientProviderProvider from "@/provider/QueryClientProviderProvider";
import MapProvider from "@/provider/MapContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EDR viewer",
  description: "Created by Rottengrapes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ToastContainer />
      <QueryClientProviderProvider>
        <MapProvider>
          <body className={inter.className}>{children}</body>
        </MapProvider>
      </QueryClientProviderProvider>
    </html>
  );
}
