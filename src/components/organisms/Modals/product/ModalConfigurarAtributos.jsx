import React, { useState, useEffect } from 'react';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';

const ModalConfigurarAtributos = ({ isOpen, onClose, onSave, initialAtributos }) => {
  const [atributos, setAtributos] = useState([]);
  const [atributoValores, setAtributoValores] = useState({});
  const [precioBase, setPrecioBase] = useState('');
  const [precioCostoBase, setPrecioCostoBase] = useState('');
  const [stockBase, setStockBase] = useState('');

  useEffect(() => {
    // Si initialAtributos es un array de objetos, extrae solo los nombres de los atributos
    if (initialAtributos && Array.isArray(initialAtributos)) {
      const nombresAtributos = initialAtributos.map(attr => attr.atributo_nombre);
      setAtributos(nombresAtributos);

      // Inicializar valores de atributos si existen
      const initialValues = {};
      nombresAtributos.forEach(attr => {
        initialValues[attr] = [];
      });
      setAtributoValores(initialValues);
    } else {
      setAtributos([]);
      setAtributoValores({});
    }
  }, [initialAtributos]);


  const handleSave = () => {
    const atributosConfigurados = atributos.map(atributo => ({
      atributo_nombre: atributo,
      valores: atributoValores[atributo] || [],
    }));
    onSave({ atributos: atributosConfigurados, precioBase, precioCostoBase, stockBase });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      style={{
        background: 'linear-gradient(rgba(30, 27, 75, 0.15), rgba(30, 27, 75, 0.25))',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)'
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-7 border border-violet-100 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-scale-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">
          Configurar Atributos
        </h2>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Ingrese los atributos del producto (ej: Sabor, Tamaño, Color):
          </p>
          <div className="mt-2">
            <ReactTagInput
              tags={atributos}
              onChange={newTags => setAtributos(newTags)}
              placeholder="Agregar atributo"
              className="border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Guardar Atributos
          </button>
        </div>
      </div>
      
      {/* Animación para el modal */}
      <style jsx global>{`
        @keyframes modal-scale-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-scale-fade-in {
          animation: modal-scale-fade-in 0.3s ease-out forwards;
        }
        /* Estilo personalizado para ReactTagInput */
        .react-tag-input {
          border-radius: 0.5rem !important;
          border-color: rgb(221, 214, 254) !important;
        }
        .react-tag-input:focus-within {
          border-color: rgb(139, 92, 246) !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
        }
        .react-tag-input__input {
          border-radius: 0.5rem !important;
        }
        .react-tag-input__tag {
          background-color: rgb(237, 233, 254) !important;
          color: rgb(107, 70, 193) !important;
          border-radius: 0.375rem !important;
        }
        .react-tag-input__tag__remove {
          background-color: rgb(167, 139, 250) !important;
        }
      `}</style>
    </div>
  );
};

export default ModalConfigurarAtributos;