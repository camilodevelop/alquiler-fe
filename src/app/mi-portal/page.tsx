export default function MiPortalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📱</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Usa la app móvil</h1>
        <p className="text-gray-500 text-sm mb-6">
          Para gestionar tu contrato, pagos y comunicarte con tu propietario, descarga la app Rentyva.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            App Store
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Google Play
          </a>
        </div>
      </div>
    </div>
  );
}
