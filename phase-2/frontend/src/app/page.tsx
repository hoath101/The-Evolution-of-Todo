import Link from "next/link";
import TaskBox from "../components/TaskBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-linear-to-b from-white/80 to-white backdrop-blur-sm sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 md:mt-28 lg:mt-32 lg:px-8 xl:mt-36">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Stay Organized,</span>
                  <span className="block text-indigo-600">Stay Productive</span>
                </h1>
                <p className="mt-6 text-base text-gray-500 sm:mt-8 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-10 md:text-xl lg:mx-0">
                  A simple and powerful todo application to help you manage your tasks efficiently.
                  Transform the way you organize your work and life with our intuitive platform.
                </p>
                <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/sign-up"
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/sign-in"
                      className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 hover:shadow-md"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative h-56 w-full sm:h-72 md:h-96 lg:h-full lg:w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                {/* Real Tasks Box */}
                <div className="relative z-10 p-8">
                  <TaskBox />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to stay organized
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform provides all the tools you need to manage your tasks efficiently.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Task Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create, update, and organize your tasks with our intuitive interface.
                  Set priorities, deadlines, and track progress seamlessly.
                </p>
              </div>

              <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Secure Authentication</h3>
                <p className="mt-2 text-base text-gray-500">
                  Your data is protected with industry-standard security measures.
                  Secure authentication keeps your information safe at all times.
                </p>
              </div>

              <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Responsive Design</h3>
                <p className="mt-2 text-base text-gray-500">
                  Access your tasks from any device, anywhere.
                  Our responsive design works perfectly on desktop, tablet, and mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-br from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Join thousands of productive users today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
