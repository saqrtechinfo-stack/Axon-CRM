import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-xl w-full text-center bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-lg p-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-slate-100 mb-6">
          <span className="text-xs font-medium text-slate-500">
            🚧 New Feature
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 mb-3">
          Coming Soon
        </h1>

        {/* Gradient highlight */}
        <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
          We’re working on something awesome
        </p>

        {/* Description */}
        <p className="text-slate-500 text-sm md:text-base mb-8">
          This feature is currently under development. It will be available soon
          to enhance your HRM experience.
        </p>

        
      </div>
    </div>
  );
}

export default page