"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import { Dashboard } from "../_components/dashboard";

const WalletConnect = dynamic(
  () => import("../_components/wallet/WalletConnect"),
  { ssr: false },
);
export default function HomePage() {
  return (
    <main className="container h-screen" suppressHydrationWarning>
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Pump . <span className="text-primary">Sniff</span>
        </h1>
        {/* <CreatePostForm /> */}
        <div className="flex w-full flex-row">
          <div className="flex w-full justify-end">
            {/* <WalletConnect /> */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <WalletConnect />
            </motion.div>
          </div>
          <div className="w-full">
            <Dashboard />
          </div>
          <div className="w-full" />
        </div>
        {/* <div className="w-full max-w-2xl overflow-y-scroll">
            <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              }
            >
              <PostList />
            </Suspense>
          </div> */}
      </div>
    </main>
  );
}
