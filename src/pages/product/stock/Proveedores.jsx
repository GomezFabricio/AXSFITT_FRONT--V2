import React, { useState, useEffect } from 'react';
import ModalConfirmarEliminarProveedor from '../../../components/organisms/Modals/proveedores/ModalConfirmarEliminarProveedor';
import useProveedores from '../../../hooks/useProveedores';
import ModalModificarProveedor from '../../../components/organisms/Modals/proveedores/ModalModificarProveedor';
import Table from '../../../components/molecules/Table';

const Proveedores = () => {
    const {
        proveedores,
        loading,
        error,
        cargarProveedores,
        handleCrearProveedor,
        handleActualizarProveedor,
        handleEliminarProveedor,
        puedeAgregar,
        puedeModificar,
        puedeEliminar,
    } = useProveedores();

    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        cargarProveedores();
    }, [cargarProveedores]);

    useEffect(() => {
        // Delegar solo sobre la tabla para evitar performance issues
        const table = document.getElementById('tabla-modulos');
        if (!table) return;
        const handler = (e) => {
            if (e.target.closest('.btn-editar-proveedor')) {
                const id = e.target.closest('.btn-editar-proveedor').getAttribute('data-id');
                const prov = proveedores.find(p => p.proveedor_id === parseInt(id));
                handleEdit(prov);
            }
            if (e.target.closest('.btn-eliminar-proveedor')) {
                const id = e.target.closest('.btn-eliminar-proveedor').getAttribute('data-id');
                handleDelete(parseInt(id));
            }
        };
        table.addEventListener('click', handler);
        return () => table.removeEventListener('click', handler);
    }, [proveedores]);

    const handleAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (prov) => {
        setEditData(prov);
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (pendingDeleteId) {
            await handleEliminarProveedor(pendingDeleteId);
            setPendingDeleteId(null);
        }
        setConfirmOpen(false);
    };

    const handleSubmit = async (data) => {
        setFormLoading(true);
        if (editData) {
            await handleActualizarProveedor(editData.proveedor_id, data);
        } else {
            await handleCrearProveedor(data);
        }
        setFormLoading(false);
        setModalOpen(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Proveedores</h1>
            {puedeAgregar && (
                <button className="btn btn-primary mb-4" onClick={handleAdd}>Agregar Proveedor</button>
            )}
            {error && <div className="alert alert-error mb-2">{error}</div>}
            <Table
                columns={[
                    { title: 'Nombre', data: 'proveedor_nombre' },
                    { title: 'Contacto', data: 'proveedor_contacto' },
                    { title: 'Email', data: 'proveedor_email' },
                    { title: 'Teléfono', data: 'proveedor_telefono' },
                    { title: 'Dirección', data: 'proveedor_direccion' },
                    { title: 'CUIT', data: 'proveedor_cuit' },
                    { title: 'Estado', data: 'proveedor_estado' },
                    (puedeModificar || puedeEliminar) && {
                        title: 'Acciones',
                        data: null,
                        orderable: false,
                        render: (data, type, row) => {
                            let botones = [];
                            if (puedeModificar) {
                                botones.push(
                                    `<button class="btn-editar-proveedor" data-id="${row.proveedor_id}" title="Modificar"
              style="background:#e0e7ff;color:#2563eb;border:none;padding:6px 12px;
              border-radius:6px;cursor:pointer;font-weight:600;margin-right:8px;display:inline-block;">
              Modificar
            </button>`
                                );
                            }
                            if (puedeEliminar) {
                                botones.push(
                                    `<button class="btn-eliminar-proveedor" data-id="${row.proveedor_id}" title="Eliminar"
              style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;
              border-radius:6px;cursor:pointer;font-weight:600;display:inline-block;">
              Eliminar
            </button>`
                                );
                            }
                            if (botones.length === 0) return '-';
                            return `<div style="display:flex;gap:10px;justify-content:center;align-items:center;">
          ${botones.join('')}
        </div>`;
                        }
                    }
                ].filter(Boolean)}
                data={proveedores}
                loading={loading}
            />
            <ModalModificarProveedor
                isOpen={modalOpen}
                proveedor={editData}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
                isSubmitting={formLoading}
            />
            <ModalConfirmarEliminarProveedor
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={formLoading}
            />
        </div>
    );
};

export default Proveedores;
