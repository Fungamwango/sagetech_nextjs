"use client";

import Script from "next/script";

const BANNER_CONTAINER_ID = "container-f0770270fb50a74a4913719313c4c34b";

export default function NativeBannerAd() {
  return (
    <div className="w-full px-0 pb-4 pt-3">
      <div className="overflow-hidden rounded-[16px] border border-white/[0.04] bg-white/[0.02] px-2 py-2">
        <div id={BANNER_CONTAINER_ID} />
      </div>
      <Script
        id="native-banner-ad"
        src="https://pl29088157.profitablecpmratenetwork.com/f0770270fb50a74a4913719313c4c34b/invoke.js"
        strategy="afterInteractive"
        async
        data-cfasync="false"
      />
    </div>
  );
}
