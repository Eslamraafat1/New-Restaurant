export default function Loading() {
  return (
    <div className="wrap grid gap-8 py-12 lg:grid-cols-2" aria-busy="true" role="status">
      <div className="skeleton aspect-square" />
      <div className="space-y-4">
        <div className="skeleton h-12 w-3/4" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-40 w-full" />
      </div>
    </div>
  );
}
