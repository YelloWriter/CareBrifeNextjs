"use client";

import dynamic from "next/dynamic";

// Keep the original browser-only app intact, including its language and input state.
const OriginalApp = dynamic(() => import("../App"), { ssr: false });

export default OriginalApp;
