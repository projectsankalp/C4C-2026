import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-black">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        
        <h1 className="mb-3 text-5xl font-extrabold text-gray-900 tracking-tight">
          Sakhi<span className="text-blue-600">Link</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          A Privacy-First, Data-Driven Early Warning & Supply Chain System.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 text-left">
          
          {/* School Demo Card */}
          <Link href="/school" className="block p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all group cursor-pointer bg-white">
            <div className="text-4xl mb-4">🏫</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">1. School Input</h2>
            <p className="text-sm text-gray-500">Teacher's 1-Min Weekly Attendance Log (The Data Source).</p>
          </Link>

          {/* ASHA Demo Card */}
          <Link href="/asha" className="block p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:shadow-lg transition-all group cursor-pointer bg-white">
            <div className="text-4xl mb-4">🩺</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-green-600 transition-colors">2. ASHA Dashboard</h2>
            <p className="text-sm text-gray-500">Privacy-first field worker alerts and resolution tracking.</p>
          </Link>

          {/* PHC Demo Card */}
          <Link href="/phc" className="block p-6 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all group cursor-pointer bg-white">
            <div className="text-4xl mb-4">🏥</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">3. PHC Supply Chain</h2>
            <p className="text-sm text-gray-500">Automated inventory routing based on ground-level alerts.</p>
          </Link>

        </div>

      </div>
    </main>
  );
}