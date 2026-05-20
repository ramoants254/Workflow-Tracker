import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchApplication, updateApplication } from '../api'

function EditApplication() {
  const { trackingNumber } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})

  const canEdit = app && ['Draft', 'Need More Information'].includes(app.status)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApplication(trackingNumber)
        setApp(data)
        setFormData({
          applicant_name: data.applicant_name,
          applicant_email: data.applicant_email,
          company_name: data.company_name,
          application_type: data.application_type,
          description: data.description
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trackingNumber])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updated = await updateApplication(trackingNumber, formData)
      setApp(updated)
      navigate(`/applications/${trackingNumber}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="center"><div className="spinner"></div> Loading...</div>
  if (error && !app) return <div className="center" style={{ color: '#ef4444' }}>Error: {error}</div>
  if (!app) return <div className="center">Application not found</div>

  if (!canEdit) {
    return (
      <div>
        <button onClick={() => navigate(`/applications/${trackingNumber}`)} style={{ marginBottom: '20px' }}>
          ← Back to Application
        </button>

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Editing Disabled</h2>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            This application is currently <strong>{app.status}</strong>. Only Draft and Need More Information applications can be edited.
          </p>
          <div style={{ marginTop: '20px' }}>
            <button className="primary" onClick={() => navigate(`/applications/${trackingNumber}`)}>
              Return to Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(`/applications/${trackingNumber}`)} style={{ marginBottom: '20px' }}>
        ← Back to Application
      </button>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Edit Application</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Applicant Name *</label>
            <input
              type="text"
              name="applicant_name"
              value={formData.applicant_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Applicant Email *</label>
            <input
              type="email"
              name="applicant_email"
              value={formData.applicant_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Application Type *</label>
            <select
              name="application_type"
              value={formData.application_type}
              onChange={handleChange}
              required
            >
              <option>Recordation</option>
              <option>Renewal</option>
              <option>Change of Ownership</option>
              <option>Change of Name</option>
              <option>Discontinuation</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/applications/${trackingNumber}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditApplication
