import React from 'react';

const HomePage = () => {
  return (
    <div className="from-violet-50 via-gray-100 to-violet-100 min-h-[70vh] px-4 flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
      {/* Glow effect behind logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-0">
        <div className="h-32 w-32 rounded-full bg-violet-300 blur-3xl opacity-40 animate-pulse"></div>
      </div>
      {/* Logo with 3D hover effect */}
      <img
        src="/img/logo_axsfitt.svg"
        alt="AXSFITT Logo"
        className="h-24 w-24 mb-4 rounded-full shadow-2xl z-10 transition-transform duration-300 hover:scale-110 hover:rotate-6"
        style={{ boxShadow: '0 8px 32px 0 rgba(124,58,237,0.25)' }}
      />
      <h1 className="text-4xl font-extrabold text-purple-800 mb-2 text-center drop-shadow-lg animate-slide-down z-10">
        Bienvenido a <span className="text-violet-600">AXSFITT</span>
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center animate-fade-in-slow z-10">
        Este es el panel principal del sistema de gestión.<br />
        Desde aquí puedes acceder a los módulos, usuarios, perfiles y más, según tus permisos.
      </p>
      {/* Simulación de Dashboard */}
      <div className="w-full max-w-5xl flex flex-col gap-8 mt-8 z-10">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center border border-violet-100 hover:shadow-2xl transition animate-pop">
            <span className="text-2xl font-bold text-violet-700">1,245</span>
            <span className="text-xs text-gray-500 mt-1">Usuarios activos</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center border border-violet-100 hover:shadow-2xl transition animate-pop delay-100">
            <span className="text-2xl font-bold text-violet-700">312</span>
            <span className="text-xs text-gray-500 mt-1">Ventas hoy</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center border border-violet-100 hover:shadow-2xl transition animate-pop delay-200">
            <span className="text-2xl font-bold text-violet-700">$18,900</span>
            <span className="text-xs text-gray-500 mt-1">Ingresos</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center border border-violet-100 hover:shadow-2xl transition animate-pop delay-300">
            <span className="text-2xl font-bold text-violet-700">7</span>
            <span className="text-xs text-gray-500 mt-1">Notificaciones</span>
          </div>
        </div>
        {/* Gráficos y tablas simuladas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simulación de gráfico */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100 flex flex-col items-center animate-fade-in-slow">
            <span className="font-semibold text-violet-700 mb-2">Ventas semanales</span>
            <div className="w-full h-32 flex items-end gap-2">
              {/* Barras simuladas */}
              {[40, 60, 80, 30, 70, 50, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-violet-300 to-violet-500 rounded-t-xl transition-all duration-500"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between w-full text-xs text-gray-400 mt-2">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
          {/* Simulación de tabla */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-violet-100 animate-fade-in-slow">
            <span className="font-semibold text-violet-700 mb-2 block">Últimas acciones</span>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-1 text-left">Usuario</th>
                  <th className="pb-1 text-left">Acción</th>
                  <th className="pb-1 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-violet-50 transition">
                  <td className="py-1">Juan Pérez</td>
                  <td className="py-1">Agregó un producto</td>
                  <td className="py-1">31/05/2025</td>
                </tr>
                <tr className="hover:bg-violet-50 transition">
                  <td className="py-1">Ana López</td>
                  <td className="py-1">Editó perfil</td>
                  <td className="py-1">31/05/2025</td>
                </tr>
                <tr className="hover:bg-violet-50 transition">
                  <td className="py-1">Carlos Ruiz</td>
                  <td className="py-1">Registró una venta</td>
                  <td className="py-1">30/05/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-400 text-center z-10 animate-fade-in-slow">
      </div>
      {/* Sutiles partículas decorativas */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-6 left-8 w-3 h-3 bg-violet-200 rounded-full blur-sm opacity-60 animate-bounce-slow"></div>
        <div className="absolute bottom-8 right-10 w-2 h-2 bg-violet-300 rounded-full blur-sm opacity-50 animate-bounce-slower"></div>
        <div className="absolute bottom-4 left-1/2 w-4 h-4 bg-violet-100 rounded-full blur-md opacity-40 animate-bounce"></div>
      </div>
      {/* Animaciones personalizadas */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
          .animate-fade-in-slow { animation: fade-in 1.5s cubic-bezier(.4,0,.2,1) both; }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slide-down { animation: slide-down 1s cubic-bezier(.4,0,.2,1) both; }
          @keyframes pop {
            0% { transform: scale(0.95);}
            100% { transform: scale(1);}
          }
          .animate-pop { animation: pop 0.7s cubic-bezier(.4,0,.2,1) both; }
          .animate-pop.delay-100 { animation-delay: .1s; }
          .animate-pop.delay-200 { animation-delay: .2s; }
          .animate-pop.delay-300 { animation-delay: .3s; }
          .animate-pop.delay-150 { animation-delay: .15s; }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
          .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
          @keyframes bounce-slower {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-6px);}
          }
          .animate-bounce-slower { animation: bounce-slower 3.5s infinite; }
        `}
      </style>
    </div>
  );
};

export default HomePage;