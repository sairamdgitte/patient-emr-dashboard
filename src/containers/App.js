import React, { Component } from 'react';
import { Header, Sidebar, Footer } from '../components/Shell';
import Worklist from '../components/Worklist';
import PatientView from '../components/PatientView';
import AdmitPatientModal from '../components/AdmitPatientModal';
import { enrichPatients, enrichSinglePatient } from '../components/data';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      patients: [],
      view: 'worklist',
      active: 'worklist',
      selectedId: null,
      loading: true,
      showAdmit: false,
    };
  }

  componentDidMount() {
    fetch(process.env.PUBLIC_URL + '/enhanced_patients.json')
      .then(response => response.json())
      .then(raw => {
        const patients = enrichPatients(raw);
        this.setState({
          patients,
          selectedId: patients[0]?.id || null,
          loading: false,
        });
      })
      .catch(error => {
        console.error('Failed to load enhanced_patients.json:', error);
        this.setState({ loading: false });
      });
  }

  goWorklist = () => {
    this.setState({ view: 'worklist', active: 'worklist' });
  };

  openPatient = (id) => {
    this.setState({ selectedId: id, view: 'patient', active: 'worklist' });
  };

  handleNavChange = (key) => {
    this.setState({ active: key });
    if (key === 'worklist') this.setState({ view: 'worklist' });
  };

  handleAdmitPatient = (newRawPatient) => {
    const enriched = enrichSinglePatient(newRawPatient, this.state.patients.length);
    this.setState(prev => ({
      patients: [enriched, ...prev.patients],
      showAdmit: false,
      selectedId: enriched.id,
    }));
  };

  handleDeletePatient = (id) => {
    this.setState(prev => {
      const updated = prev.patients.filter(p => p.id !== id);
      return {
        patients: updated,
        // If we deleted the selected patient, select the first one
        selectedId: prev.selectedId === id ? (updated[0]?.id || null) : prev.selectedId,
        // If we were viewing the deleted patient, go back to worklist
        view: prev.selectedId === id && prev.view === 'patient' ? 'worklist' : prev.view,
      };
    });
  };

  render() {
    const { patients, view, active, selectedId, loading, showAdmit } = this.state;
    const selected = patients.find(p => p.id === selectedId) || patients[0];
    const breadcrumbs = view === 'worklist'
      ? ['Ward 7B', 'My Patients']
      : ['Ward 7B', 'My Patients', selected?.name || ''];

    if (loading) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'var(--sans)', color: 'var(--text-3)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ marginBottom: 16 }} />
            <div>Loading clinical workspace…</div>
          </div>
        </div>
      );
    }

    return (
      <div className="app">
        <Header breadcrumbs={breadcrumbs} notifs={3} />
        <Sidebar active={active} onChange={this.handleNavChange} counts={{ patients: patients.length }} />
        <main className="main">
          {view === 'worklist' && (
            <Worklist
              patients={patients}
              selectedId={selectedId}
              onSelect={(id) => this.setState({ selectedId: id })}
              onOpen={this.openPatient}
              onAdmit={() => this.setState({ showAdmit: true })}
              onDelete={this.handleDeletePatient}
            />
          )}
          {view === 'patient' && selected && (
            <PatientView p={selected} onBack={this.goWorklist} />
          )}
        </main>
        <Footer />

        {showAdmit && (
          <AdmitPatientModal
            onClose={() => this.setState({ showAdmit: false })}
            onAdmit={this.handleAdmitPatient}
          />
        )}
      </div>
    );
  }
}

export default App;
