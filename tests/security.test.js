import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

async function readProjectFile(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), 'utf8')
}

async function listVueFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listVueFiles(path))
    } else if (entry.name.endsWith('.vue')) {
      files.push(path)
    }
  }

  return files
}

test('la migración RLS protege las tablas operativas y conserva identidad pública mínima', async () => {
  const migration = await readProjectFile('../supabase/migrations/20260904150000_harden_rls_and_rpc_access.sql')

  for (const table of ['members', 'plans', 'payments', 'transactions', 'staff', 'config']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
  }

  assert.match(migration, /grant select on table public\.config to anon/i)
  assert.match(migration, /revoke all on table public\.members from public, anon/i)
  assert.match(migration, /create policy payments_insert_active_staff/i)
  assert.match(migration, /create policy transactions_insert_active_staff/i)
  assert.match(migration, /security_invoker\s*=\s*true/i)
  assert.match(migration, /storage\.objects/i)
  assert.match(migration, /set search_path = public/i)

  const configMigration = await readProjectFile('../supabase/migrations/20260905110000_restrict_public_config_columns.sql')
  assert.match(configMigration, /revoke all privileges on table public\.config from anon/i)
  assert.match(configMigration, /grant select \(id, nombre_gimnasio, logo_url\)/i)
  assert.match(configMigration, /revoke all privileges on table public\.config from authenticated/i)

  const settingsSource = await readProjectFile('../src/composables/useSettings.js')
  assert.match(settingsSource, /PUBLIC_CONFIG_FIELDS/i)
  assert.match(settingsSource, /AUTHENTICATED_CONFIG_FIELDS/i)
  assert.match(settingsSource, /sanitizeSvgFile/i)
  assert.match(settingsSource, /id, nombre_gimnasio, logo_url/i)
  assert.doesNotMatch(settingsSource, /from\(['"]config['"]\)[\s\S]{0,160}\.select\(['"]\*['"]\)/i)
})

test('la matriz manual documenta anon, admin y recepción sin mutar datos', async () => {
  const matrix = await readProjectFile('../supabase/verification/rls-role-matrix.sql')

  assert.match(matrix, /set local role anon/i)
  assert.match(matrix, /rol = 'admin'/i)
  assert.match(matrix, /rol = 'recepcion'/i)
  assert.match(matrix, /recepcion_members/i)
  const receptionMigration = await readProjectFile('../supabase/migrations/20260905100000_allow_recepcion_operational_access.sql')
  assert.match(receptionMigration, /rol in \('admin', 'staff', 'recepcion'\)/i)
  assert.match(matrix, /rollback;/i)
  assert.match(matrix, /update public\.config/i)
})

test('el ajuste administrativo exige RPC, rol admin y auditoría transaccional', async () => {
  const migration = await readProjectFile('../supabase/migrations/20260904160000_add_payment_adjustment_audit_rpc.sql')

  assert.match(migration, /create table if not exists public\.payment_adjustment_audit/i)
  assert.match(migration, /public\.is_admin\(\)/i)
  assert.match(migration, /for update/i)
  assert.match(migration, /linked_transactions/i)
  assert.match(migration, /insert into public\.payment_adjustment_audit/i)
  assert.match(migration, /security definer/i)
  assert.match(migration, /set search_path = public/i)
  assert.match(migration, /grant execute on function public\.admin_adjust_payment_snapshot/i)
})

test('el arranque de autenticacion comparte una inicializacion acotada entre App y router', async () => {
  const router = await readProjectFile('../src/router/index.js')
  const userStore = await readProjectFile('../src/stores/userStore.js')

  assert.doesNotMatch(router, /supabase\.auth\.getSession\(\)/i)
  assert.match(router, /if \(!userStore\.initialized\) await userStore\.initSession\(\)/i)
  assert.match(userStore, /AUTH_BOOT_TIMEOUT_MS\s*=\s*10000/i)
  assert.match(userStore, /LOGIN_TIMEOUT_MS\s*=\s*10000/i)
  assert.match(userStore, /withTimeout\([\s\S]{0,180}signInWithPassword/i)
  assert.match(userStore, /onAuthStateChange[\s\S]{0,300}setTimeout\(\(\) =>/i)
  assert.doesNotMatch(userStore, /onAuthStateChange[\s\S]{0,300}await checkUserRole/i)
  assert.match(userStore, /initSessionPromise/i)
  assert.match(userStore, /if \(initialized\.value\)/i)
  assert.match(userStore, /initialized\.value\s*=\s*true/i)
})

test('recepcion conserva acceso operativo a Caja en ruta y navegacion', async () => {
  const router = await readProjectFile('../src/router/index.js')
  const sidebar = await readProjectFile('../src/components/layout/Sidebar.vue')
  const bottomNav = await readProjectFile('../src/components/layout/BottomNav.vue')

  assert.match(router, /path: 'caja'[\s\S]{0,180}roles: \['admin', 'recepcion'\]/i)
  assert.match(router, /to\.meta\.roles && !to\.meta\.roles\.includes\(userStore\.userRole\)/i)
  for (const source of [sidebar, bottomNav]) {
    assert.match(source, /name: 'Caja'[\s\S]{0,100}roles: \['admin', 'recepcion'\]/i)
    assert.match(source, /if \(item\.roles\)[\s\S]{0,120}item\.roles\.includes\(userStore\.userRole\)/i)
  }
})

test('Banco de horas conserva aislamiento por recepcionista y acceso administrativo', async () => {
  const migration = await readProjectFile('../supabase/migrations/20260905130000_create_staff_work_hours.sql')
  const router = await readProjectFile('../src/router/index.js')
  const view = await readProjectFile('../src/views/WorkHours/WorkHoursView.vue')
  const composable = await readProjectFile('../src/composables/useWorkHours.js')

  assert.match(migration, /create table if not exists public\.staff_work_hours/i)
  assert.match(migration, /staff_work_hours_unique_staff_date/i)
  assert.match(migration, /staff_work_hours_start_before_end/i)
  assert.match(migration, /staff_work_hours_select/i)
  assert.match(migration, /staff_work_hours_insert/i)
  assert.match(migration, /staff_work_hours_update/i)
  assert.match(migration, /work_date <= public\.business_today\(\)/i)
  assert.match(migration, /target_staff\.rol = 'recepcion'/i)
  assert.match(migration, /staff_work_hours\.staff_id = auth\.uid\(\)/i)
  assert.doesNotMatch(migration, /create policy .*delete/i)
  assert.match(router, /path: 'banco-horas'[\s\S]{0,220}roles: \['admin', 'recepcion'\]/i)
  assert.doesNotMatch(view, /from\(['"]@\/lib\/supabase['"]\)/i)
  assert.doesNotMatch(composable, /\.from\(['"]staff_work_hours['"]\)/i)
})

test('las lecturas operativas de socios y dashboard no usan select estrella', async () => {
  const members = await readProjectFile('../src/composables/useMembers.js')
  const gymStore = await readProjectFile('../src/stores/gymStore.js')
  const reports = await readProjectFile('../src/composables/useReports.js')
  const staff = await readProjectFile('../src/composables/useStaff.js')

  assert.match(members, /MEMBER_LIST_FIELDS/)
  assert.match(members, /MEMBER_FIELDS/)
  assert.doesNotMatch(members, /\.from\(['"]v_socios_estado['"]\)[\s\S]{0,180}\.select\(['"]\*['"]\)/i)
  assert.doesNotMatch(members, /\.from\(['"]members['"]\)[\s\S]{0,180}\.select\(['"]\*['"]\)/i)
  assert.doesNotMatch(gymStore, /\.select\(['"]\*['"]\s*,\s*\{\s*count/i)
  assert.match(reports, /OVERDUE_MEMBER_FIELDS/)
  assert.doesNotMatch(reports, /\.from\(['"]v_socios_estado['"]\)[\s\S]{0,180}\.select\(['"]\*['"]\)/i)
  assert.match(staff, /STAFF_FIELDS/)
  assert.doesNotMatch(staff, /\.from\(['"]staff['"]\)[\s\S]{0,140}\.select\(['"]\*['"]\)/i)
})

test('la ficha de socios conserva la desactivacion y las alertas llevan al filtro correcto', async () => {
  const deactivationMigration = await readProjectFile('../supabase/migrations/20260906020000_add_member_deactivation_date.sql')
  const membersView = await readProjectFile('../src/views/Members/MembersListView.vue')
  const memberForm = await readProjectFile('../src/views/Members/MemberFormView.vue')
  const dashboard = await readProjectFile('../src/views/Dashboard/DashboardView.vue')
  const sidebar = await readProjectFile('../src/components/layout/Sidebar.vue')

  assert.match(deactivationMigration, /add column if not exists fecha_baja date/i)
  assert.match(deactivationMigration, /create trigger members_set_deactivation_date/i)
  assert.match(deactivationMigration, /America\/Argentina\/Buenos_Aires/i)
  assert.match(membersView, /useRouter, useRoute/i)
  assert.match(membersView, /route\.query\.filter === 'vencidos'/i)
  assert.match(membersView, /member\.estado_cuota === 'vencido'/i)
  assert.match(memberForm, /formData\.activo = !formData\.activo/i)
  assert.match(dashboard, /aria-label="Notificaciones"/i)
  assert.match(dashboard, /openExpiredMembers/i)
  assert.match(sidebar, /items-center justify-between gap-2 border-t/i)
})

test('las modales operativas consumen fachadas y los adaptadores devuelven campos explicitos', async () => {
  const lastAccessModal = await readProjectFile('../src/components/modals/LastAccessModal.vue')
  const memberHistoryModal = await readProjectFile('../src/components/modals/MemberHistoryModal.vue')
  const attendance = await readProjectFile('../src/composables/useAttendance.js')
  const revenueChart = await readProjectFile('../src/components/charts/RevenueChart.vue')
  const assistanceChart = await readProjectFile('../src/components/charts/AssistanceChart.vue')
  const reports = await readProjectFile('../src/composables/useReports.js')
  const cashRepository = await readProjectFile('../src/contexts/billing-cash/infrastructure/persistence/SupabaseCashTransactionRepository.js')

  assert.doesNotMatch(lastAccessModal, /supabase\./i)
  assert.doesNotMatch(memberHistoryModal, /supabase\./i)
  assert.doesNotMatch(revenueChart, /supabase\./i)
  assert.doesNotMatch(assistanceChart, /supabase\./i)
  for (const source of [lastAccessModal, memberHistoryModal, revenueChart, assistanceChart]) {
    assert.doesNotMatch(source, /console\.(error|warn)/i)
  }
  assert.match(lastAccessModal, /useAttendance/)
  assert.match(memberHistoryModal, /listMemberAttendances/)
  assert.match(attendance, /ATTENDANCE_FIELDS/)
  assert.match(reports, /REVENUE_FIELDS/)
  assert.match(reports, /ATTENDANCE_ACTIVITY_FIELDS/)
  assert.match(cashRepository, /TRANSACTION_FIELDS/)
  assert.doesNotMatch(cashRepository, /\.select\(['"]\*['"]\)/i)
})

test('los puntos de interaccion criticos tienen soporte de teclado y anuncios de error', async () => {
  const statCard = await readProjectFile('../src/components/dashboard/StatCard.vue')
  const table = await readProjectFile('../src/components/ui/BaseTable.vue')
  const modal = await readProjectFile('../src/components/ui/BaseModal.vue')
  const confirmDialog = await readProjectFile('../src/components/ui/BaseConfirmDialog.vue')
  const login = await readProjectFile('../src/views/Auth/LoginView.vue')

  assert.match(statCard, /:is="route \? 'button' : 'div'"/)
  assert.match(statCard, /aria-label="route \? `\$\{title\}: abrir detalle` : undefined"/)
  assert.match(table, /@keydown\.enter\.prevent="col\.sortable && handleSort\(col\.key\)"/)
  assert.match(table, /@keydown\.space\.prevent="col\.sortable && handleSort\(col\.key\)"/)
  assert.match(login, /:aria-invalid="emailError \? 'true' : undefined"/)
  assert.match(login, /id="email-error" role="alert"/)
  assert.match(login, /id="password-error" role="alert"/)
  assert.match(modal, /aria-modal="true"/)
  assert.match(modal, /:aria-describedby="bodyId"/)
  assert.match(modal, /aria-hidden="true"/)
  assert.match(confirmDialog, /UI_TOKENS\.iconTones/)
  assert.match(confirmDialog, /aria-hidden="true"/)
})

test('la configuracion de Vercel conserva los recursos PWA fuera del fallback SPA', async () => {
  const vercelConfig = await readProjectFile('../vercel.json')
  const manifest = await readProjectFile('../public/manifest.webmanifest')
  const serviceWorker = await readProjectFile('../public/sw.js')

  assert.match(vercelConfig, /manifest\.webmanifest/i)
  assert.match(vercelConfig, /application\/manifest\+json/i)
  assert.match(vercelConfig, /sw\.js/i)
  assert.match(vercelConfig, /application\/javascript/i)
  assert.match(vercelConfig, /X-Content-Type-Options/i)
  assert.match(vercelConfig, /nosniff/i)
  assert.match(vercelConfig, /X-Frame-Options/i)
  assert.match(vercelConfig, /Referrer-Policy/i)
  assert.match(vercelConfig, /Permissions-Policy/i)
  assert.match(vercelConfig, /Strict-Transport-Security/i)
  assert.match(manifest, /yacyreta-logo\.svg/i)
  assert.match(serviceWorker, /self\.addEventListener\(['"]fetch/i)
  assert.match(serviceWorker, /yacyreta-shell-v2/i)
  assert.match(serviceWorker, /Promise\.allSettled/i)
  assert.match(serviceWorker, /extractSameOriginAssets/i)
})

test('la observabilidad de produccion es opt-in, acotada y no transmite mensajes', async () => {
  const observability = await readProjectFile('../src/lib/observability.js')

  assert.match(observability, /VITE_ERROR_REPORT_URL/i)
  assert.match(observability, /navigator\.sendBeacon/i)
  assert.match(observability, /MAX_REPORTS_PER_SESSION\s*=\s*20/i)
  assert.match(observability, /new Blob\(\[payload\]/i)
  assert.match(observability, /safeError\.type/i)
  assert.doesNotMatch(observability, /sendAggregatedReport[\s\S]{0,700}error\?\.message/i)
})

test('los controles HTML mantienen contratos mínimos de interacción accesible', async () => {
  const sourceRoot = fileURLToPath(new URL('../src', import.meta.url))
  const vueFiles = await listVueFiles(sourceRoot)

  for (const file of vueFiles) {
    const source = await readFile(file, 'utf8')
    assert.doesNotMatch(source, /<button\b(?![^>]*\btype\s*=)[^>]*>/i, file)
    assert.doesNotMatch(source, /<img\b(?![^>]*\balt\s*=)[^>]*>/i, file)
  }
})

test('las exportaciones de Excel no usan el parser vulnerable de xlsx', async () => {
  const excelExport = await readProjectFile('../src/utils/excelExport.js')
  const exportComposable = await readProjectFile('../src/composables/useExport.js')
  const reports = await readProjectFile('../src/composables/useReports.js')
  const cash = await readProjectFile('../src/composables/useCashRegister.js')

  assert.match(excelExport, /write-excel-file\/browser/)
  for (const source of [excelExport, exportComposable, reports, cash]) {
    assert.doesNotMatch(source, /(?:from|import\()\s*['"]xlsx['"]/i)
    assert.doesNotMatch(source, /(?:readFile|sheet_to_json|read\s*\()/i)
  }
})
