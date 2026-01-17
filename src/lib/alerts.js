import Swal from 'sweetalert2'

/**
 * Configuración global de SweetAlert2 con estilos Tailwind
 */
const swalConfig = {
  confirmButtonColor: '#5F388C', // primary-600
  cancelButtonColor: '#e5e7eb', // gray-200
  cancelButtonText: 'Cancelar',
  confirmButtonText: 'Confirmar',
  customClass: {
    popup: 'rounded-xl shadow-2xl',
    title: 'text-xl font-bold text-gray-900',
    htmlContainer: 'text-gray-600',
    confirmButton: 'bg-primary-600 hover:bg-primary-700 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all',
    cancelButton: 'bg-gray-100 hover:bg-gray-200 px-6 py-2.5 rounded-lg font-medium text-gray-700 border border-gray-300 transition-all mr-2',
    actions: 'gap-3'
  },
  buttonsStyling: false
}

/**
 * Muestra un modal de confirmación para acciones destructivas o críticas
 * @param {string} title - Título del modal
 * @param {string} text - Texto descriptivo de la acción
 * @returns {Promise<boolean>} - true si el usuario confirma, false si cancela
 */
export const confirmAlert = async (title, text = '') => {
  const result = await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    focusCancel: true,
    reverseButtons: true
  })
  
  return result.isConfirmed
}

/**
 * Muestra un modal de éxito
 * @param {string} title - Título del modal
 * @param {string} text - Texto descriptivo (opcional)
 */
export const successAlert = async (title, text = '') => {
  await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: 'success',
    showCancelButton: false,
    confirmButtonText: 'Entendido'
  })
}

/**
 * Muestra un modal de error
 * @param {string} title - Título del modal
 * @param {string} text - Texto descriptivo del error
 */
export const errorAlert = async (title, text = '') => {
  await Swal.fire({
    ...swalConfig,
    title,
    text,
    icon: 'error',
    showCancelButton: false,
    confirmButtonText: 'Entendido'
  })
}
