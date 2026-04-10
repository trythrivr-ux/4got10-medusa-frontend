export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Yarn is Working!</h1>
        <p className="text-lg text-gray-600 mb-8">
          The frontend is running successfully with yarn.
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">Status: ✅ Frontend Working</p>
          <p className="text-sm mt-2">Package Manager: Yarn</p>
          <p className="text-sm">Server: Running on localhost:8000</p>
        </div>
      </div>
    </div>
  )
}
