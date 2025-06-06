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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Configurar Atributos</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Ingrese los atributos del producto (ej: Sabor, Tamaño, Color):</p>
            <ReactTagInput
              tags={atributos}
              onChange={newTags => setAtributos(newTags)}
              placeholder="Agregar atributo"
            />
          </div>

          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md width-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={handleSave}
            >
              Guardar Atributos
            </button>
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md width-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfigurarAtributos;