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
