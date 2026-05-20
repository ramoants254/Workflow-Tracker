import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchApplication, submitApplication, startReview, makeDecision } from '../api'

function ApplicationDetail() {
  const { trackingNumber } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [decisionData, setDecisionData] = useState({ decision: 'approved', comment: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApplication(trackingNumber)
        setApp(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trackingNumber])

  const handleSubmit = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await submitApplication(trackingNumber)
      setApp(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartReview = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await startReview(trackingNumber)
      setApp(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecision = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await makeDecision(trackingNumber, decisionData.decision, decisionData.comment)
      setApp(updated)
      setShowDecisionForm(false)
      setDecisionData({ decision: 'approved', comment: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="center"><div className="spinner"></div> Loading...</div>
  if (error && !app) return <div className="center" style={{ color: '#ef4444' }}>Error: {error}</div>
  if (!app) return <div className="center">Application not found</div>

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>← Back to List</button>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>
          {app.tracking_number}
          <span className={`badge ${app.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ marginLeft: '12px' }}>
            {app.status}
          </span>
        </h2>

        {error && <div className="error">{error}</div>}

        <div className="detail-section">
          <h3>Applicant Information</h3>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{app.applicant_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{app.applicant_email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Company</span>
            <span className="detail-value">{app.company_name}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Application Details</h3>
          <div className="detail-row">
            <span className="detail-label">Type</span>
            <span className="detail-value">{app.application_type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span className="detail-value">{app.description || '—'}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Timestamps</h3>
          <div className="detail-row">
            <span className="detail-label">Created</span>
            <span className="detail-value">{new Date(app.created_at).toLocaleString()}</span>
          </div>
          {app.submitted_at && (
            <div className="detail-row">
              <span className="detail-label">Submitted</span>
              <span className="detail-value">{new Date(app.submitted_at).toLocaleString()}</span>
            </div>
          )}
          {app.reviewed_at && (
            <div className="detail-row">
              <span className="detail-label">Reviewed</span>
              <span className="detail-value">{new Date(app.reviewed_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {app.reviewer_comment && (
          <div className="detail-section">
            <h3>Reviewer Comment</h3>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid #7c3aed' }}>
              {app.reviewer_comment}
            </div>
          </div>
        )}

        <div className="actions">
          {app.status === 'Draft' && (
            <>
              <button className="primary" onClick={() => navigate(`/applications/${app.tracking_number}/edit`)}>
                Edit
              </button>
              <button className="primary" onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit'}
              </button>
            </>
          )}

          {app.status === 'Submitted' && (
            <button className="primary" onClick={handleStartReview} disabled={actionLoading}>
              {actionLoading ? 'Starting...' : 'Start Review'}
            </button>
          )}

          {app.status === 'Under Review' && (
            <button
              className="primary"
              onClick={() => setShowDecisionForm(!showDecisionForm)}
            >
              Make Decision
            </button>
          )}

          {app.status === 'Need More Information' && (
            <>
              <button className="primary" onClick={() => navigate(`/applications/${app.tracking_number}/edit`)}>
                Edit
              </button>
              <button className="primary" onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Resubmitting...' : 'Resubmit'}
              </button>
            </>
          )}
        </div>

        {showDecisionForm && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
            <h3 style={{ marginBottom: '16px' }}>Reviewer Decision</h3>

            <div className="form-group">
              <label>Decision</label>
              <select
                value={decisionData.decision}
                onChange={(e) => setDecisionData({ ...decisionData, decision: e.target.value })}
              >
                <option value="approved">Approve</option>
                <option value="need_more_info">Need More Information</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div className="form-group">
              <label>Comment {['need_more_info', 'rejected'].includes(decisionData.decision) && '*'}</label>
              <textarea
                value={decisionData.comment}
                onChange={(e) => setDecisionData({ ...decisionData, comment: e.target.value })}
                placeholder="Enter reviewer comment..."
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="primary" onClick={handleDecision} disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Decision'}
              </button>
              <button onClick={() => setShowDecisionForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationDetail
