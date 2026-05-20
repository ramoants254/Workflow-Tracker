const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/applications'

export async function fetchApplications() {
  const res = await fetch(`${API_BASE}/`)
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

export async function fetchApplication(trackingNumber) {
  const res = await fetch(`${API_BASE}/${trackingNumber}/`)
  if (!res.ok) throw new Error('Failed to fetch application')
  return res.json()
}

export async function createApplication(data) {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create application: ${err}`)
  }
  return res.json()
}

export async function updateApplication(trackingNumber, data) {
  const res = await fetch(`${API_BASE}/${trackingNumber}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update application: ${err}`)
  }
  return res.json()
}

export async function submitApplication(trackingNumber) {
  const res = await fetch(`${API_BASE}/${trackingNumber}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to submit application: ${err}`)
  }
  return res.json()
}

export async function startReview(trackingNumber) {
  const res = await fetch(`${API_BASE}/${trackingNumber}/start-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to start review: ${err}`)
  }
  return res.json()
}

export async function makeDecision(trackingNumber, decision, comment) {
  const res = await fetch(`${API_BASE}/${trackingNumber}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, comment })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to make decision: ${err}`)
  }
  return res.json()
}
