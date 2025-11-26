import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI Video Demo Platform
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12">
            Transform screen share sales demos into world-class product demos
            using AI
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Upload Videos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your screen share sales demos with ease
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                AI Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatic transcription, scene detection, and enhancement
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Professional Output
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get polished, professional product demos ready to share
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg border border-gray-300 dark:border-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
