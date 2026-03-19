import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3456'
const API_KEY = process.env.API_KEY_INTERNAL || 'synapse-internal-key-change-in-production'

const results = []

async function call(name, url, options = {}, expectedStatuses = [200]) {
  const start = Date.now()
  try {
    const res = await fetch(url, options)
    const text = await res.text()
    let json
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }

    const matchedExpected = expectedStatuses.includes(res.status)
    results.push({
      name,
      ok: matchedExpected,
      status: res.status,
      expectedStatuses,
      ms: Date.now() - start,
      body: json ?? text.slice(0, 400),
    })
    return { res, json, text }
  } catch (error) {
    results.push({
      name,
      ok: false,
      status: 0,
      expectedStatuses,
      ms: Date.now() - start,
      body: String(error),
    })
    return { res: null, json: null, text: '' }
  }
}

function authHeaders() {
  return {
    'content-type': 'application/json',
    'x-api-key': API_KEY,
  }
}

async function run() {
  // Baseline GET collection endpoints
  await call('GET /api/gardening/plants', `${BASE}/api/gardening/plants`)
  await call('GET /api/gardening/seeds', `${BASE}/api/gardening/seeds`)
  await call('GET /api/gardening/seeds?lowStock=true', `${BASE}/api/gardening/seeds?lowStock=true`)
  await call('GET /api/gardening/plantings', `${BASE}/api/gardening/plantings`)
  await call('GET /api/gardening/tasks', `${BASE}/api/gardening/tasks`)
  await call('GET /api/gardening/tasks?upcoming=true', `${BASE}/api/gardening/tasks?upcoming=true`)

  const from = new Date()
  const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
  await call('GET /api/gardening/calendar', `${BASE}/api/gardening/calendar?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)

  // Unauthorized behavior checks (expected 401)
  await call(
    'POST /api/gardening/plants (unauth)',
    `${BASE}/api/gardening/plants`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'unauth-test', category: 'vegetable' }),
    },
    [401],
  )

  await call(
    'POST /api/gardening/tasks (unauth)',
    `${BASE}/api/gardening/tasks`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'unauth-task', dueDate: new Date().toISOString() }),
    },
    [401],
  )

  const unique = `audit-${Date.now()}`

  // Create full linked dataset (plant -> seed -> planting -> task)
  const createPlant = await call('POST /api/gardening/plants (auth)', `${BASE}/api/gardening/plants`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name: `Audit Plant ${unique}`,
      category: 'vegetable',
      variety: 'Test',
      sowOutdoorStart: 3,
      sowOutdoorEnd: 5,
      harvestStart: 7,
      harvestEnd: 9,
      daysToHarvest: 90,
      notes: 'created by endpoint audit',
    }),
  })

  const plantId = createPlant.json?.plant?.id

  let seedId = null
  let plantingId = null
  let taskId = null

  if (plantId) {
    await call(`GET /api/gardening/plants/${plantId}`, `${BASE}/api/gardening/plants/${plantId}`)

    await call(`PUT /api/gardening/plants/${plantId}`, `${BASE}/api/gardening/plants/${plantId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        name: `Audit Plant ${unique} Updated`,
        category: 'vegetable',
        variety: 'Improved',
        sowOutdoorStart: 3,
        sowOutdoorEnd: 5,
        harvestStart: 7,
        harvestEnd: 10,
        daysToHarvest: 95,
      }),
    })

    const createSeed = await call('POST /api/gardening/seeds (auth)', `${BASE}/api/gardening/seeds`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        plantId,
        quantity: 42,
        supplier: 'Audit Supplier',
        batchCode: unique,
      }),
    })

    seedId = createSeed.json?.seed?.id

    if (seedId) {
      await call(`GET /api/gardening/seeds/${seedId}`, `${BASE}/api/gardening/seeds/${seedId}`)

      await call(`PUT /api/gardening/seeds/${seedId}`, `${BASE}/api/gardening/seeds/${seedId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          plantId,
          quantity: 36,
          supplier: 'Audit Supplier 2',
          batchCode: `${unique}-revA`,
          notes: 'updated via audit',
        }),
      })
    }

    const createPlanting = await call('POST /api/gardening/plantings (auth)', `${BASE}/api/gardening/plantings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        plantId,
        location: 'audit-bed',
        sowDate: new Date().toISOString(),
        quantity: 6,
      }),
    })

    plantingId = createPlanting.json?.planting?.id

    if (plantingId) {
      await call(`GET /api/gardening/plantings/${plantingId}`, `${BASE}/api/gardening/plantings/${plantingId}`)

      await call('PATCH /api/gardening/plantings (auth)', `${BASE}/api/gardening/plantings`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id: plantingId, status: 'growing' }),
      })

      await call(`PUT /api/gardening/plantings/${plantingId}`, `${BASE}/api/gardening/plantings/${plantingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          plantId,
          location: 'audit-bed-2',
          sowDate: new Date().toISOString(),
          quantity: 8,
          status: 'transplanted',
          notes: 'updated via audit',
        }),
      })
    }
  }

  const createTask = await call('POST /api/gardening/tasks (auth)', `${BASE}/api/gardening/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      title: `Audit Task ${unique}`,
      description: 'Endpoint audit task',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      recurring: 'weekly',
    }),
  })

  taskId = createTask.json?.task?.id

  if (taskId) {
    await call(`GET /api/gardening/tasks/${taskId}`, `${BASE}/api/gardening/tasks/${taskId}`)

    await call(`PUT /api/gardening/tasks/${taskId}`, `${BASE}/api/gardening/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        title: `Audit Task ${unique} Updated`,
        description: 'Endpoint audit task updated',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        recurring: 'weekly',
        completed: false,
      }),
    })

    await call('PATCH /api/gardening/tasks (complete=true)', `${BASE}/api/gardening/tasks`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id: taskId, completed: true }),
    })

    await call('PATCH /api/gardening/tasks (complete=false)', `${BASE}/api/gardening/tasks`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id: taskId, completed: false }),
    })

    await call('PATCH /api/gardening/tasks (complete omitted defaults true)', `${BASE}/api/gardening/tasks`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id: taskId }),
    })

    await call(`PATCH /api/gardening/tasks/${taskId}/complete`, `${BASE}/api/gardening/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ completed: true }),
    })

    await call('POST /api/gardening/tasks/batch-complete', `${BASE}/api/gardening/tasks/batch-complete`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ taskIds: [taskId], completed: false }),
    })
  }

  // Cleanup path tests (delete endpoints)
  if (taskId) {
    await call(`DELETE /api/gardening/tasks/${taskId}`, `${BASE}/api/gardening/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  if (seedId) {
    await call(`DELETE /api/gardening/seeds/${seedId}`, `${BASE}/api/gardening/seeds/${seedId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  if (plantingId) {
    await call(`DELETE /api/gardening/plantings/${plantingId}`, `${BASE}/api/gardening/plantings/${plantingId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  if (plantId) {
    await call(`DELETE /api/gardening/plants/${plantId}`, `${BASE}/api/gardening/plants/${plantId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  const out = {
    baseUrl: BASE,
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    },
    results,
  }

  const outPath = path.resolve(process.cwd(), 'data', 'gardening-endpoint-audit.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')

  console.log(JSON.stringify(out, null, 2))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
