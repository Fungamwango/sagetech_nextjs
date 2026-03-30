export default function Loading() {
  return (
    <div
      className="modern-page-loader flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgb(22,40,50), rgba(0,0,0,0.95))",
      }}
    >
      <div className="text-center modern-page-loader__content">
        <div className="modern-page-loader__ring" aria-hidden="true">
          <div className="modern-page-loader__core" />
        </div>
        <p className="loading-text">Loading page...</p>
        <p className="modern-page-loader__subtext">Preparing SageTech</p>
      </div>
    </div>
  );
}
