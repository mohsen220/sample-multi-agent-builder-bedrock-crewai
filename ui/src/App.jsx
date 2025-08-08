import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgentsPage from './components/agents-page';
import MissionsPage from './components/missions-page';
import ExamplesPage from './components/examples-page';
import AgentPage from './components/agent-page';
import MissionPage from './components/mission-page';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AgentsPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/missions/:id" element={<MissionPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

export default App;
