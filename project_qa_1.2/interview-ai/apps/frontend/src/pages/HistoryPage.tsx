function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Entrevistas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Revisa tus entrevistas anteriores y tu progreso.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5l-2-2m0 0l-2-2m2 2H3" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin entrevistas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no has completado ninguna entrevista.
            </p>
            <div className="mt-6">
              <a
                href="/interview/setup"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Comenzar Primera Entrevista
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage