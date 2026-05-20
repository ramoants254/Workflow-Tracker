import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ListApplications from './pages/ListApplications'
import CreateApplication from './pages/CreateApplication'
import ApplicationDetail from './pages/ApplicationDetail'
import EditApplication from './pages/EditApplication'
import './App.css'

function App() {
  return (
    <Router>
      <header className="header">
        <div className="container">
          <h1>Workflow Tracker</h1>
          <p>Application Management System</p>
          <nav style={{ marginTop: '16px' }}>
            <Link to="/" style={{ marginRight: '16px' }}>Applications</Link>
            <Link to="/new">New Application</Link>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<ListApplications />} />
          <Route path="/new" element={<CreateApplication />} />
          <Route path="/applications/:trackingNumber" element={<ApplicationDetail />} />
          <Route path="/applications/:trackingNumber/edit" element={<EditApplication />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
