const tienePermiso = (permisoDescripcion) => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData || !userData.modulos) return false;
    return userData.modulos.some(
      m => m.permisos && m.permisos.some(p => p.permiso_descripcion === permisoDescripcion)
    );
  } catch (error) {
    console.error("Error al obtener o parsear userData:", error);
    return false; // Considerar como no autorizado en caso de error
  }
};

export default tienePermiso;