function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona tu información personal y configuraciones.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración de Perfil
            </h3>
            <p className="text-sm text-gray-600">
              Esta sección estará disponible pronto para que puedas:
            </p>
            <div className="text-left max-w-md mx-auto mt-6 space-y-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Actualizar información personal</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Cambiar contraseña</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Configurar preferencias de entrevista</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Configurar avatar y voz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage