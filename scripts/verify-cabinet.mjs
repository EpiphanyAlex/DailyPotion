/** Local browser acceptance. Requires running Supabase, the dev server and agent-browser. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const base = process.env.CABINET_QA_URL ?? 'http://localhost:3000'
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'This verifier only runs against localhost')
const browser = process.env.AGENT_BROWSER_BIN ?? 'agent-browser'
const session = `cabinet-${Date.now()}`
const status = execFileSync('./node_modules/.bin/supabase', ['status', '-o', 'env'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const local = Object.fromEntries([...status.matchAll(/^([A-Z_]+)="([^"]*)"$/gm)].map((match) => [match[1], match[2]]))
assert(['localhost', '127.0.0.1'].includes(new URL(local.API_URL).hostname), 'Only the local Supabase stack is allowed')
const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, options) => {
    const headers = new Headers(options?.headers)
    headers.set('Connection', 'close')
    return fetch(url, { ...options, headers })
  } },
}
const admin = createClient(local.API_URL, local.SERVICE_ROLE_KEY, clientOptions)
const accounts = []
const artifacts = 'output/playwright/phase-5'
mkdirSync(artifacts, { recursive: true })

function ab(...args) {
  if (args[0] === 'open' || args[0] === 'screenshot') console.log(args[0], args[1])
  return execFileSync(browser, ['--session', session, ...args], { encoding: 'utf8', timeout: 35000, stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}
function inspect() { return ab('snapshot', '-i') }
function value(expression) { return JSON.parse(ab('eval', expression)) }
function wait(expression) {
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    if (value(`Boolean(${expression})`)) return
  }
  assert.fail(`Timed out waiting for: ${expression}`)
}
function contains(text) { wait(`document.body.innerText.includes(${JSON.stringify(text)})`) }
function assertUI(expression, message) { assert(value(expression), message) }
function screenshot(name) { ab('screenshot', `${artifacts}/${name}.png`) }
async function makeAccount(label) {
  const email = `${session}-${label}@example.test`
  const password = `Qa-${randomUUID()}Aa!`
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  accounts.push(data.user.id)
  const client = createClient(local.API_URL, local.PUBLISHABLE_KEY ?? local.ANON_KEY, clientOptions)
  const signedIn = await client.auth.signInWithPassword({ email, password })
  if (signedIn.error) throw signedIn.error
  return { email, password, client }
}
async function inventory(account) {
  const { data, error } = await account.client.from('user_bottles').select('*')
  if (error) throw error
  return data
}
async function persisted(account, predicate) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const rows = await inventory(account)
    if (predicate(rows)) return rows
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  assert.fail('The expected database state was not persisted')
}
async function login(account, navigate = true) {
  if (navigate) ab('open', `${base}/zh/login?redirect=/cabinet`)
  inspect()
  ab('find', 'label', '邮箱', 'fill', account.email, '--exact')
  ab('find', 'label', '密码', 'fill', account.password, '--exact')
  ab('find', 'role', 'button', 'click', '--name', '登录', '--exact')
  ab('wait', '#cabinet-search')
  inspect()
}
function addModal() {
  ab('click', 'main header button')
  ab('wait', '#catalog-search')
  inspect()
}
function closeModal() {
  ab('press', 'Escape')
  wait('!document.querySelector("[role=dialog]")')
  inspect()
}
function menu(id, index) {
  ab('click', `[data-bottle-id="${id}"] button[aria-haspopup="menu"]`)
  inspect()
  ab('click', `[role="menu"] button:nth-child(${index})`)
  inspect()
}
function removeDialog(id) {
  menu(id, 2)
  ab('wait', '[role="alertdialog"]')
}
function confirmRemove() {
  ab('click', '[role="alertdialog"] button.bg-danger')
  inspect()
}
function failRequests(mode) {
  ab('eval', `(() => {
    window.__qaOriginalFetch ??= window.fetch;
    window.__qaFailures = 0;
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input.url ?? input.toString(), location.href);
      const method = init?.method ?? input.method ?? 'GET';
      if (url.pathname === '/rest/v1/user_bottles' && (${JSON.stringify(mode)} === 'all' || method === 'GET')) {
        window.__qaFailures += 1;
        throw new TypeError('Injected acceptance-test network failure');
      }
      return window.__qaOriginalFetch(input, init);
    };
  })()`)
}
function restoreRequests() { ab('eval', 'window.fetch = window.__qaOriginalFetch; undefined') }

try {
  const a = await makeAccount('a')
  const b = await makeAccount('b')
  ab('set', 'viewport', '1280', '900')
  ab('open', `${base}/zh/cabinet`)
  assert(new URL(ab('get', 'url')).pathname === '/zh/login', 'Guest cabinet access must redirect to login')
  await login(a)
  contains('你的酒柜还是空的')
  screenshot('desktop-empty')

  addModal()
  ab('fill', '#catalog-search', 'Roku')
  contains('Roku 六金酒')
  ab('click', '[role="dialog"] button[aria-pressed]:nth-child(3)')
  contains('没有找到匹配的酒瓶')
  ab('click', '[role="dialog"] button[aria-pressed]:nth-child(2)')
  contains('Roku 六金酒')
  ab('click', '[role="dialog"] li button.bg-success')
  contains('已在酒柜')
  assertUI('!document.querySelector("[role=dialog] li button")', 'An added catalog bottle must not remain addable')
  closeModal()
  console.log('PASS catalog addition and duplicate prevention')
  ab('reload')
  ab('wait', '[data-bottle-id]')
  let rows = await inventory(a)
  assert.equal(rows.length, 1, 'Catalog addition must persist exactly once')
  const roku = rows[0]

  addModal()
  ab('click', '[role="dialog"] .bg-info-soft button')
  inspect()
  ab('find', 'role', 'button', 'click', '--name', '保存', '--exact')
  contains('请填写酒瓶名称')
  contains('请选择类型，类型决定该瓶参与哪些配方匹配')
  assert.equal((await inventory(a)).length, 1, 'Invalid custom input must not write')
  const { data: gin, error: ginError } = await a.client.from('spirit_types').select('id').eq('slug', 'gin').single()
  if (ginError) throw ginError
  ab('fill', '#custom-name', 'QA 备用金酒')
  ab('select', '#custom-type', gin.id)
  ab('fill', '#custom-volume', '-1')
  ab('find', 'role', 'button', 'click', '--name', '保存', '--exact')
  contains('容量须为有效的正整数（毫升）')
  assert.equal((await inventory(a)).length, 1, 'Invalid capacity must not write')
  ab('fill', '#custom-volume', '375')
  ab('find', 'role', 'button', 'click', '--name', '保存', '--exact')
  wait('!document.querySelector("[role=dialog]")')
  contains('QA 备用金酒')
  rows = await persisted(a, (items) => items.length === 2)
  assert.equal(rows.length, 2)
  const custom = rows.find((row) => row.custom_name === 'QA 备用金酒')
  assert.equal(custom.volume_ml, 375)
  console.log('PASS custom validation and capacity persistence')
  removeDialog(roku.id)
  assertUI('document.querySelector("[role=alertdialog]").innerText.includes("0 款")', 'A second gin must preserve recipe availability')
  ab('press', 'Escape')
  removeDialog(custom.id)
  confirmRemove()
  wait('document.querySelectorAll("[data-bottle-id]").length === 1')
  ab('reload')
  ab('wait', '[data-bottle-id]')
  assert.equal((await inventory(a)).length, 1)
  removeDialog(roku.id)
  assertUI('/[1-9][0-9]* 款/.test(document.querySelector("[role=alertdialog]").innerText)', 'Removing the only gin must lose recipes')
  ab('press', 'Escape')

  menu(roku.id, 1)
  wait(`document.querySelector('[data-bottle-id="${roku.id}"]').innerText.includes('愿望单')`)
  await persisted(a, (items) => items[0]?.status === 'wishlist')
  ab('reload')
  ab('wait', '[data-bottle-id]')
  removeDialog(roku.id)
  assertUI('document.querySelector("[role=alertdialog]").innerText.includes("0 款")', 'Wishlist bottles must not affect availability')
  ab('press', 'Escape')
  menu(roku.id, 1)
  wait(`document.querySelector('[data-bottle-id="${roku.id}"]').innerText.includes('已拥有')`)
  await persisted(a, (items) => items[0]?.status === 'owned')

  console.log('PASS removal impact and persisted status changes')
  failRequests('all')
  menu(roku.id, 1)
  contains('操作失败，界面已恢复原状，请重试。')
  assertUI(`document.querySelector('[data-bottle-id="${roku.id}"]').innerText.includes('已拥有')`, 'Failed status changes must roll back')
  removeDialog(roku.id)
  confirmRemove()
  contains('操作失败，界面已恢复原状，请重试。')
  ab('wait', `[data-bottle-id="${roku.id}"]`)
  assert.equal((await inventory(a)).length, 1)
  assertUI('window.__qaFailures >= 2', 'Failure injection must reach real query boundaries')
  restoreRequests()
  console.log('PASS failed write rollback')

  failRequests('read')
  menu(roku.id, 1)
  contains('修改已保存，但未能重新读取酒柜。')
  assert.equal((await inventory(a))[0].status, 'wishlist')
  restoreRequests()
  ab('find', 'role', 'button', 'click', '--name', '重试读取', '--exact')
  wait('!document.body.innerText.includes("修改已保存，但未能重新读取酒柜。")')
  assert.equal((await inventory(a))[0].status, 'wishlist', 'Retry loading must not repeat the write')
  console.log('PASS saved-write/read-failure recovery')
  ab('eval', `(() => {
    window.__qaWrites = 0;
    window.__qaWriteCompleted = false;
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input.url ?? input.toString(), location.href);
      if (url.pathname === '/rest/v1/user_bottles' && init?.method === 'PATCH') {
        window.__qaWrites += 1;
        await new Promise(resolve => { window.__qaReleaseWrite = resolve });
      }
      const response = await window.__qaOriginalFetch(input, init);
      window.__qaWriteCompleted = true;
      return response;
    };
  })()`)
  ab('click', `[data-bottle-id="${roku.id}"] button[aria-haspopup="menu"]`)
  inspect()
  ab('eval', '(() => { const button = document.querySelector("[role=menu] button"); button.click(); button.click() })()')
  wait(`document.querySelector('[data-bottle-id="${roku.id}"]').innerText.includes('已拥有')`)
  wait('window.__qaWrites === 1')
  assertUI('window.__qaWrites === 1', 'Rapid repeated clicks must produce one write')
  ab('eval', 'window.__qaReleaseWrite(); undefined')
  wait('window.__qaWriteCompleted === true')
  await persisted(a, (items) => items[0]?.status === 'owned')
  restoreRequests()
  console.log('PASS rapid-click single-flight')

  screenshot('desktop-inventory')
  ab('set', 'viewport', '900', '900')
  assertUI('document.documentElement.scrollWidth <= innerWidth', 'Tablet layout must not overflow')
  screenshot('tablet-inventory')
  ab('set', 'viewport', '390', '844')
  assertUI('document.documentElement.scrollWidth <= innerWidth', 'Mobile layout must not overflow')
  assertUI('(() => {const action=document.querySelector("main > button").getBoundingClientRect();const nav=document.querySelector("nav.fixed").getBoundingClientRect();return action.bottom <= nav.top})()', 'Floating Add must clear the bottom navigation')
  screenshot('mobile-inventory')
  ab('click', 'main > button')
  ab('wait', '#catalog-search')
  screenshot('mobile-add')
  closeModal()
  assertUI('document.activeElement === document.querySelector("main > button")', 'Closing the modal must restore focus')
  ab('open', `${base}/en/cabinet`)
  contains('My Cabinet')
  contains('Roku Gin')
  assertUI('!document.querySelector("[data-nextjs-dialog]")', 'No framework error overlay should appear')
  assert.equal(ab('errors'), '', 'Browser must have no uncaught errors')

  ab('open', `${base}/zh/cabinet`)
  ab('wait', '[data-bottle-id]')
  ab('eval', `(() => {
    window.__qaOriginalFetch = window.fetch;
    window.__qaHeld = false;
    window.__qaReleased = false;
    window.fetch = async (input, init) => {
      const url = new URL(typeof input === 'string' ? input : input.url ?? input.toString(), location.href);
      const response = await window.__qaOriginalFetch(input, init);
      if (url.pathname === '/rest/v1/user_bottles' && (init?.method ?? 'GET') === 'GET' && !window.__qaHeld) {
        window.__qaHeld = true;
        await new Promise(resolve => { window.__qaRelease = resolve });
        window.__qaReleased = true;
      }
      return response;
    };
  })()`)
  menu(roku.id, 1)
  wait('window.__qaHeld === true')
  ab('click', 'nav.fixed a[href="/zh/profile"]')
  wait('location.pathname === "/zh/profile"')
  inspect()
  ab('click', 'main button.w-full')
  wait('location.pathname === "/zh"')
  console.log('PASS A signed out while its cabinet read is delayed')
  ab('click', 'nav.fixed a[href="/zh/cabinet"]')
  wait('location.pathname === "/zh/login"')
  await login(b, false)
  assertUI('typeof window.__qaRelease === "function"', 'The delayed A request must survive client-side navigation')
  ab('eval', 'window.__qaRelease(); undefined')
  wait('window.__qaReleased === true')
  contains('你的酒柜还是空的')
  assertUI('document.querySelectorAll("[data-bottle-id]").length === 0', 'A late response must not enter B cabinet')
  assert.equal((await inventory(b)).length, 0)
  assert.equal((await inventory(a)).length, 1, 'A data must remain isolated after B signs in')
  console.log('PASS: guest guard, catalog/custom CRUD, matching impact, rollback, read retry, rapid clicks, zh/en, responsive layout, focus return and account isolation including delayed A response')
  console.log(`Screenshots: ${artifacts}`)
} catch (error) {
  try { screenshot('failure'); console.error(inspect()) } catch { /* Browser may have already stopped. */ }
  throw error
} finally {
  try { ab('close') } catch { /* Close only this verifier session. */ }
  for (const id of accounts) {
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) console.error('Could not remove a temporary QA account:', error.message)
  }
}
