import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createApplication } from '../api'

function CreateApplication() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    company_name: '',
    application_type: 'Recordation',
    description: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createApplication(formData)
      navigate(`/applications/${result.tracking_number}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Create New Application</h2>
      <div className="card">
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
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Application'}
            </button>
            <button type="button" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateApplication
