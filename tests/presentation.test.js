import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { UI_COPY } from '../src/config/uiCopy.js'
import { toUserMessage } from '../src/lib/userFacingError.js'

const sourceRoot = fileURLToPath(new URL('../src', import.meta.url))

async function listFiles(directory, extensions = ['.vue', '.js']) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(path, extensions))
    } else if (extensions.some(extension => entry.name.endsWith(extension))) {
      files.push(path)
    }
  }

  return files
}

test('los errores técnicos se convierten en mensajes claros', () => {
  assert.equal(
    toUserMessage({ message: 'column v_socios_estado.dias_vencido does not exist' }),
    UI_COPY.errors.unavailable
  )
  assert.equal(toUserMessage({ code: '23505' }), UI_COPY.errors.duplicate)
  assert.equal(toUserMessage({ code: '42501' }), UI_COPY.errors.permission)
  assert.match(
    toUserMessage({ code: '23P01' }),
    /se superpone con otra jornada/i
  )
  assert.equal(toUserMessage({ message: 'Failed to fetch' }), UI_COPY.errors.connection)
  assert.equal(toUserMessage({ message: 'Completá el DNI para continuar.' }), 'Completá el DNI para continuar.')
})

test('la navegación y las acciones principales usan lenguaje orientado a tareas', async () => {
  const sidebar = await readFile(join(sourceRoot, 'components/layout/Sidebar.vue'), 'utf8')
  const bottomNav = await readFile(join(sourceRoot, 'components/layout/BottomNav.vue'), 'utf8')
  const paymentView = await readFile(join(sourceRoot, 'views/Payments/NewPaymentView.vue'), 'utf8')
  const memberDetail = await readFile(join(sourceRoot, 'views/Members/MemberDetailView.vue'), 'utf8')

  assert.match(sidebar, /name: 'Inicio'/)
  assert.match(sidebar, /name: 'Control de acceso'/)
  assert.match(bottomNav, /Control de acceso/)
  assert.match(paymentView, /Elegí cómo pagó/)
  assert.doesNotMatch(paymentView, /toast\.promise/)
  assert.doesNotMatch(memberDetail, /Plan ID/)
})

test('las tarjetas de métricas mantienen una alineación vertical uniforme', async () => {
  const statCard = await readFile(join(sourceRoot, 'components/dashboard/StatCard.vue'), 'utf8')
  const dashboard = await readFile(join(sourceRoot, 'views/Dashboard/DashboardView.vue'), 'utf8')

  assert.match(statCard, /appearance-none flex flex-col items-stretch justify-start/)
  assert.match(dashboard, /title="Visitas de hoy"/)
})

test('el menú móvil funciona como drawer accesible y conserva el foco', async () => {
  const bottomNav = await readFile(join(sourceRoot, 'components/layout/BottomNav.vue'), 'utf8')

  assert.match(bottomNav, /aria-haspopup="dialog"/)
  assert.match(bottomNav, /role="dialog"/)
  assert.match(bottomNav, /aria-modal="true"/)
  assert.match(bottomNav, /handleMenuKeydown/)
  assert.match(bottomNav, /previouslyFocusedElement/)
  assert.match(bottomNav, /Cerrar menú de navegación/)
})

test('la UI enfoca el primer campo inválido y las exportaciones pesadas se cargan bajo demanda', async () => {
  const focusUtility = await readFile(join(sourceRoot, 'utils/focusFirstInvalid.js'), 'utf8')
  const main = await readFile(join(sourceRoot, 'main.js'), 'utf8')
  const reports = await readFile(join(sourceRoot, 'composables/useReports.js'), 'utf8')
  const cash = await readFile(join(sourceRoot, 'composables/useCashRegister.js'), 'utf8')

  assert.match(focusUtility, /input:invalid, select:invalid, textarea:invalid/)
  assert.match(main, /installInvalidFieldFocus/)
  assert.match(reports, /await import\('\@\/utils\/excelExport'\)/)
  assert.match(cash, /await import\('\@\/utils\/excelExport'\)/)
  assert.doesNotMatch(reports, /^\s*import .*excelExport/m)
  assert.doesNotMatch(cash, /^\s*import .*excelExport/m)
})

test('las acciones largas tienen feedback visual progresivo', async () => {
  const loadingState = await readFile(join(sourceRoot, 'components/ui/LoadingState.vue'), 'utf8')
  const paymentView = await readFile(join(sourceRoot, 'views/Payments/NewPaymentView.vue'), 'utf8')
  const dashboard = await readFile(join(sourceRoot, 'views/Dashboard/DashboardView.vue'), 'utf8')
  const styles = await readFile(join(sourceRoot, 'style.css'), 'utf8')

  assert.match(loadingState, /role="status"/)
  assert.match(paymentView, /mobile-action-bar/)
  assert.match(dashboard, /v-reveal-on-scroll/)
  assert.match(styles, /\.reveal-on-scroll/)
})

test('las vistas no muestran directamente errores de infraestructura', async () => {
  const files = await listFiles(join(sourceRoot, 'views'))
  const violations = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    if (/(?:toast\.(?:error|warning)|errorAlert\()[^\n]*(?:err|error)\.message/.test(source)) {
      violations.push(file)
    }
  }

  assert.deepEqual(violations, [])
})
