function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Welcome to Tailwind CSS!
        </h1>
        <p className="text-gray-600 mb-6">
          Your setup is working if you see this beautiful card. Try editing this
          page and using more Tailwind utility classes!
        </p>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
