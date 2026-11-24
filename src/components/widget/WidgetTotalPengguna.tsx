

interface Props {
  total: number;
  loading: boolean;
}

export default function WidgetTotalPengguna({ total, loading }: Props) {
  if (loading) {
    return <div className="h-28 w-full rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>;
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 dark:bg-orange-500/10"></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staf Medis & Admin</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white/90 mt-1">
            {total}
          </h3>
          <p className="text-xs text-orange-600 font-medium mt-1 bg-orange-50 px-2 py-0.5 rounded inline-block dark:bg-orange-900/30">
            Punya Akses Sistem
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/20 text-xl">
          🩺
        </div>
      </div>
    </div>
  );
}