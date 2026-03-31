"use client";

type PageLoaderProps = {
  label?: string;
  sublabel?: string;
  fullHeight?: boolean;
};

export default function PageLoader({
  label = "Loading page...",
  sublabel = "Preparing SageTech",
  fullHeight = true,
}: PageLoaderProps) {
  return (
    <div
      className={`modern-page-loader flex items-center justify-center px-4 ${fullHeight ? "min-h-screen" : "min-h-[60vh]"}`}
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgb(22,40,50), rgba(0,0,0,0.95))",
      }}
    >
      <div className="text-center modern-page-loader__content">
        <div className="modern-page-loader__ring" aria-hidden="true">
          <div className="modern-page-loader__core" />
        </div>
        <p className="loading-text">{label}</p>
        <p className="modern-page-loader__subtext">{sublabel}</p>
      </div>
    </div>
  );
}
