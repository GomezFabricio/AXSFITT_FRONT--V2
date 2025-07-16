import React, { useState, useEffect } from 'react';
import { obtenerMetricasVentas } from '../../../api/ventasApi';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaShoppingCart, 
  FaBoxOpen, 
  FaMoneyBillWave,
  FaCheck,
  FaClock,
  FaTimes,
  FaShoppingBag
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MetricasDeVenta = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    abonado: '#4ade80', // verde
    pendiente: '#facc15', // amarillo
    cancelado: '#f87171'  // rojo
  };

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const data = await obtenerMetricasVentas(token);
        
        // Formatear datos para los gráficos
        if (data.ventasPorMes) {
          data.ventasPorMes = data.ventasPorMes.map(item => {
            // Formatear fecha para mostrar nombre del mes
            const [year, month] = item.mes.split('-');
            const date = new Date(year, month - 1);
            const nombreMes = date.toLocaleString('es-ES', { month: 'short' });
            return {
              ...item,
              mes_nombre: `${nombreMes} ${year}`
            };
          });
        }
        
        setMetricas(data);
      } catch (err) {
        console.error('Error al cargar métricas:', err);
        setError('No se pudieron cargar las métricas de ventas');
      } finally {
        setLoading(false);
      }
    };
    
    cargarMetricas();
  }, []);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Cargando métricas...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!metricas) return null;
  
  // Calcular porcentajes para el gráfico de estado de ventas
  const totalVentas = metricas.resumen.total_ventas;
  const estadosVentas = [
    { name: 'Completadas', value: metricas.resumen.ventas_completadas, color: STATUS_COLORS.abonado },
    { name: 'Pendientes', value: metricas.resumen.ventas_pendientes, color: STATUS_COLORS.pendiente },
    { name: 'Canceladas', value: metricas.resumen.ventas_canceladas, color: STATUS_COLORS.cancelado }
  ].filter(item => item.value > 0); // Filtrar valores 0 para evitar segmentos vacíos
  
  // Filtrar ventas por origen para eliminar entradas con 0 ventas
  const ventasPorOrigenFiltradas = metricas.ventasPorOrigen.filter(item => item.cantidad_ventas > 0);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaChartLine className="mr-2" /> Métrcias de Ventas
      </h1>
      
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase">Ventas Totales</p>
              <p className="text-2xl font-bold">{metricas.resumen.total_ventas}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaShoppingCart className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase">Ingresos Totales</p>
              <p className="text-2xl font-bold">{formatCurrency(metricas.resumen.ingresos_totales || 0)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase">Ticket Promedio</p>
              <p className="text-2xl font-bold">{formatCurrency(metricas.resumen.ticket_promedio || 0)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaShoppingBag className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase">Tasa de Conversión</p>
              <p className="text-2xl font-bold">
                {metricas.resumen.total_ventas ? 
                  `${((metricas.resumen.ventas_completadas / metricas.resumen.total_ventas) * 100).toFixed(1)}%` :
                  '0%'
                }
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaCheck className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico de ventas por mes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2" /> Ventas de los últimos 6 meses
          </h2>
          <div className="h-80">
            {!metricas.ventasPorMes || metricas.ventasPorMes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <p className="text-lg">No hay datos de ventas por mes</p>
                  <p className="text-sm">Los datos aparecerán aquí cuando tengas ventas registradas</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metricas.ventasPorMes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes_nombre" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'ingresos') return formatCurrency(value);
                      return value;
                    }}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cantidad_ventas" name="Cantidad de ventas" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="ingresos" name="Ingresos" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Gráfico de estado de ventas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaClock className="mr-2" /> Estado de ventas
          </h2>
          <div className="h-80 flex justify-center items-center">
            {estadosVentas.length === 0 ? (
              <div className="text-center text-gray-500">
                <p className="text-lg">No hay datos de ventas disponibles</p>
                <p className="text-sm">Crea algunas ventas para ver las métricas</p>
              </div>
            ) : estadosVentas.length === 1 ? (
              <div className="text-center">
                <div className="mb-4">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-2" 
                    style={{ backgroundColor: estadosVentas[0].color }}
                  ></div>
                  <p className="text-lg font-semibold">{estadosVentas[0].name}</p>
                  <p className="text-2xl font-bold">{estadosVentas[0].value}</p>
                  <p className="text-sm text-gray-500">100% del total</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosVentas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent, value }) => {
                      // Solo mostrar etiquetas si hay más de 1 segmento significativo
                      if (estadosVentas.length <= 1 || percent < 0.05) return '';
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {estadosVentas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Cantidad']} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Gráficos inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaBoxOpen className="mr-2" /> Top productos más vendidos
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metricas.productosMasVendidos && metricas.productosMasVendidos.length > 0 ? (
                  metricas.productosMasVendidos.map((producto, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {producto.producto_nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {producto.unidades_vendidas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(producto.ingresos_generados)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      <p className="text-lg">No hay datos de productos</p>
                      <p className="text-sm">Los productos más vendidos aparecerán aquí</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Ventas por origen */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaShoppingCart className="mr-2" /> Ventas por origen
          </h2>
          <div className="h-80">
            {ventasPorOrigenFiltradas.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <p className="text-lg">No hay datos de origen disponibles</p>
                  <p className="text-sm">Las ventas aparecerán aquí cuando tengas datos</p>
                </div>
              </div>
            ) : ventasPorOrigenFiltradas.length === 1 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-2" 
                    style={{ backgroundColor: COLORS[0] }}
                  ></div>
                  <p className="text-lg font-semibold">{ventasPorOrigenFiltradas[0].venta_origen}</p>
                  <p className="text-2xl font-bold">{ventasPorOrigenFiltradas[0].cantidad_ventas}</p>
                  <p className="text-sm text-gray-500">100% del total</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="cantidad_ventas"
                    nameKey="venta_origen"
                    data={ventasPorOrigenFiltradas}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    label={({ venta_origen, percent }) => {
                      // Solo mostrar etiquetas si hay más de 1 segmento significativo
                      if (ventasPorOrigenFiltradas.length <= 1 || percent < 0.05) return '';
                      return `${venta_origen}: ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {ventasPorOrigenFiltradas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'cantidad_ventas') return [value, 'Ventas'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value}: ${entry.payload.cantidad_ventas}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricasDeVenta;