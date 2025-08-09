import './MissionReportPage.css';
import { useParams } from 'react-router-dom';

function MissionReportPage() {
  const { id } = useParams();

  return (
    <div className="mission-report-page">
      <h1>Mission Report: {id}</h1>

// 🔧 MOCK DATA: Replace this with API response once backend is connected
      <section className="mission-info">
        <p><strong>Drone ID:</strong> 1</p>
        <p><strong>Base ID:</strong> B_001</p>
        <p><strong>Route ID:</strong> R_001_N</p>
        <p><strong>Start:</strong> 01/08/25 09:00</p>
        <p><strong>End:</strong> 01/08/25 09:25</p>
        <p><strong>RTB Reason:</strong> Battery low</p>
        <p><strong>Weather (Start):</strong> Clear</p>
        <p><strong>Weather (End):</strong> Cloudy</p>
      </section>

// 🔧 MOCK TABLE DATA: Replace with API-driven rows later
      <h2>Collected Items</h2>
      <table>
        <thead>
          <tr>
            <th>Object ID</th>
            <th>Weight</th>
            <th>Item Type</th>
            <th>Action Taken</th>
            <th>Classification</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1828189132</td>
            <td>1.2kg</td>
            <td>Plastic</td>
            <td>Collected</td>
            <td>AI - Confirmed</td>
          </tr>
          <tr>
            <td>1828189133</td>
            <td>0.7kg</td>
            <td>Paper</td>
            <td>Collected</td>
            <td>Manual Override</td>
          </tr>
          <tr>
            <td>1828189134</td>
            <td>2.0kg</td>
            <td>Tyre</td>
            <td>Skipped</td>
            <td>AI - Ignored</td>
          </tr>
        </tbody>
      </table>

      <div className="mission-actions">
        <button>Export CSV</button>
        <button>Export PDF</button>
      </div>
    </div>
  );
}

export default MissionReportPage;
