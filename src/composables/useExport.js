import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { BRAND, COLOR_SCALES } from '@/config/brand'
import { formatCurrency } from '@/utils/formatters'
import { downloadExcelWorkbook } from '@/utils/excelExport'
import { reportClientError } from '@/lib/observability'

function hexToRgb(hex) {
    const normalized = hex.replace('#', '')
    return [
        parseInt(normalized.slice(0, 2), 16),
        parseInt(normalized.slice(2, 4), 16),
        parseInt(normalized.slice(4, 6), 16)
    ]
}

/**
 * Composable para exportar datos del Dashboard a Excel y PDF
 */
export function useExport() {

    /**
     * Formatea fecha para nombre de archivo
     */
    function formatDateForFilename() {
        return new Date().toISOString().split('T')[0]
    }

    /**
     * Exporta datos del Dashboard a Excel
     * @param {Object} options - Opciones de exportación
     * @param {Object} options.stats - Estadísticas del dashboard
     * @param {Array} options.checkIns - Lista de check-ins recientes
     * @param {string} options.gymName - Nombre del gimnasio
     * @param {string} options.periodLabel - Etiqueta del periodo seleccionado
     */
    async function exportToExcel({ stats, checkIns, gymName, periodLabel }) {
        try {
            // Hoja 1: Resumen de estadísticas
            const statsData = [
                ['Dashboard - ' + gymName],
                ['Periodo: ' + periodLabel],
                ['Generado: ' + new Date().toLocaleString('es-AR')],
                [],
                ['Métrica', 'Valor'],
                ['Ingresos del Periodo', '$' + formatCurrency(stats.periodRevenue || stats.monthlyRevenue)],
                ['Socios Activos', stats.activeMembers],
                ['Asistencia del Periodo', stats.periodAttendance || stats.todayAttendance],
                ['Socios Vencidos', stats.expiredMembers],
                ['Total Miembros', stats.totalMembers]
            ]

            const sheets = [{ name: 'Resumen', data: statsData, widths: [25, 20] }]

            // Hoja 2: Check-ins recientes
            if (checkIns && checkIns.length > 0) {
                const checkInsData = [
                    ['Últimos Check-Ins'],
                    [],
                    ['Socio', 'DNI', 'Hora', 'Estado']
                ]

                checkIns.forEach(c => {
                    checkInsData.push([c.name, c.dni, c.time, c.statusLabel])
                })

                sheets.push({
                    name: 'Check-Ins',
                    data: checkInsData,
                    widths: [30, 15, 15, 12]
                })
            }

            // Descargar archivo
            const filename = `dashboard_${gymName.replace(/\s+/g, '_')}_${formatDateForFilename()}.xlsx`
            await downloadExcelWorkbook(sheets, filename)

            return { success: true, filename }
        } catch (error) {
            reportClientError('report.export_excel', error)
            return { success: false, error: error.message }
        }
    }

    /**
     * Exporta datos del Dashboard a PDF
     * @param {Object} options - Opciones de exportación
     * @param {Object} options.stats - Estadísticas del dashboard
     * @param {Array} options.checkIns - Lista de check-ins recientes
     * @param {string} options.gymName - Nombre del gimnasio
     * @param {string} options.periodLabel - Etiqueta del periodo seleccionado
     * @param {Object} options.comparison - Comparación con periodo anterior
     */
    function exportToPDF({ stats, checkIns, gymName, periodLabel, comparison }) {
        try {
            const doc = new jsPDF()

            // Colores del tema
            const primaryColor = hexToRgb(BRAND.colors.primary)
            const grayColor = hexToRgb(COLOR_SCALES.neutral[500])

            // Título
            doc.setFontSize(22)
            doc.setTextColor(...primaryColor)
            doc.text('Dashboard', 14, 20)

            // Nombre del gimnasio
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(gymName, 14, 30)

            // Fecha y periodo
            doc.setFontSize(10)
            doc.setTextColor(...grayColor)
            doc.text(`Periodo: ${periodLabel}`, 14, 38)
            doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 44)

            // Línea separadora
            doc.setDrawColor(...primaryColor)
            doc.setLineWidth(0.5)
            doc.line(14, 48, 196, 48)

            // Tabla de estadísticas
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text('Resumen de Estadísticas', 14, 58)

            const statsTableData = [
                ['Ingresos del Periodo', `$${formatCurrency(stats.periodRevenue || stats.monthlyRevenue)}`],
                ['Socios Activos', String(stats.activeMembers)],
                ['Asistencia del Periodo', String(stats.periodAttendance || stats.todayAttendance)],
                ['Socios Vencidos', String(stats.expiredMembers)],
                ['Total Miembros', String(stats.totalMembers)]
            ]

            // Agregar comparación si está disponible
            if (comparison) {
                if (comparison.revenueChange !== undefined) {
                    const sign = comparison.revenueChange >= 0 ? '+' : ''
                    statsTableData[0].push(`${sign}${comparison.revenueChange}% vs anterior`)
                }
                if (comparison.attendanceChange !== undefined) {
                    const sign = comparison.attendanceChange >= 0 ? '+' : ''
                    statsTableData[2].push(`${sign}${comparison.attendanceChange}% vs anterior`)
                }
            }

            doc.autoTable({
                startY: 62,
                head: [['Métrica', 'Valor', comparison ? 'Cambio' : ''].filter(Boolean)],
                body: statsTableData.map(row => comparison ? row : row.slice(0, 2)),
                theme: 'striped',
                headStyles: {
                    fillColor: primaryColor,
                    textColor: [255, 255, 255]
                },
                styles: {
                    fontSize: 10
                }
            })

            // Tabla de check-ins
            if (checkIns && checkIns.length > 0) {
                const checkInsY = doc.lastAutoTable.finalY + 15

                doc.setFontSize(14)
                doc.setTextColor(0, 0, 0)
                doc.text('Últimos Check-Ins', 14, checkInsY)

                doc.autoTable({
                    startY: checkInsY + 4,
                    head: [['Socio', 'DNI', 'Hora', 'Estado']],
                    body: checkIns.map(c => [c.name, c.dni, c.time, c.statusLabel]),
                    theme: 'striped',
                    headStyles: {
                        fillColor: primaryColor,
                        textColor: [255, 255, 255]
                    },
                    styles: {
                        fontSize: 9
                    }
                })
            }

            // Pie de página
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(...grayColor)
                doc.text(
                    `Página ${i} de ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                )
            }

            // Descargar archivo
            const filename = `dashboard_${gymName.replace(/\s+/g, '_')}_${formatDateForFilename()}.pdf`
            doc.save(filename)

            return { success: true, filename }
        } catch (error) {
            reportClientError('report.export_pdf', error)
            return { success: false, error: error.message }
        }
    }

    return {
        exportToExcel,
        exportToPDF
    }
}
