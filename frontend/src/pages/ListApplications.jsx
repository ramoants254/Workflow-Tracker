import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchApplications } from '../api'

function ListApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApplications()
        setApps(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="center"><div className="spinner"></div> Loading...</div>
  if (error) return <div className="center" style={{ color: '#ef4444' }}>Error: {error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Applications</h2>
        <Link to="/new"><button className="primary">+ New Application</button></Link>
      </div>

      {apps.length === 0 ? (
        <div className="center">No applications yet</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Applicant Name</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.tracking_number}>
                  <td>
                    <Link to={`/applications/${app.tracking_number}`}>{app.tracking_number}</Link>
                  </td>
                  <td>{app.applicant_name}</td>
                  <td>{app.company_name}</td>
                  <td>{app.application_type}</td>
                  <td>
                    <span className={`badge ${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListApplications
