import { useState, useEffect } from 'react';

export default function StaffRosterQueue() {
    const doctorId = 1;

    const [queueData, setQueueData] = useState({
        activeToken: null,
        activePatientId: null,
        nextInLineToken: null,
        totalWaiting: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleNextPatient = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/queue/call-next/${doctorId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                setError('Failed to update queue');
                return;
            }

            const refreshResponse = await fetch(`http://localhost:8080/api/queue/${doctorId}`);
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setQueueData(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadQueueData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/queue/${doctorId}`);
                if (!response.ok) {
                    setError('Failed to fetch queue data');
                    return;
                }
                const data = await response.json();
                setQueueData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        };

        loadQueueData();
        const interval = setInterval(loadQueueData, 5000);
        return () => clearInterval(interval);
    }, [doctorId]);

    // 🎨 UI Styling Objects (Plain CSS equivalent to match CareFlow Pro)
    const containerStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginTop: '16px'
    };

    const headerStyle = {
        margin: '0 0 20px 0',
        color: 'var(--primary-dark)',
        fontSize: '18px',
        fontWeight: '600'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
    };

    const cardStyle = (bgColor, borderColor) => ({
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
    });

    const labelStyle = (color) => ({
        margin: 0,
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: color
    });

    const valueStyle = (color) => ({
        margin: '8px 0 0 0',
        fontSize: '28px',
        fontWeight: '700',
        color: color
    });

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end'
    };

    const buttonStyle = {
        backgroundColor: queueData.totalWaiting === 0 ? '#cbd5e1' : '#0284c7',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontWeight: '600',
        cursor: queueData.totalWaiting === 0 ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s'
    };

    return (
        <div style={containerStyle}>
            <h3 style={headerStyle}>📊 Patient Flow & Queue Management (M4)</h3>

            {error && (
                <div style={{ padding: '12px', marginBottom: '16px', color: '#b91c1c', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '14px' }}>
                    Error: {error}
                </div>
            )}

            {/* Live Metrics Grid */}
            <div style={gridStyle}>
                <div style={cardStyle('#eff6ff', '#bfdbfe')}>
                    <p style={labelStyle('#2563eb')}>Current Active Token</p>
                    <p style={valueStyle('#1e3a8a')}>
                        {queueData.activeToken ? `#${queueData.activeToken}` : 'None'}
                    </p>
                </div>

                <div style={cardStyle('#f0fdf4', '#bbf7d0')}>
                    <p style={labelStyle('#16a34a')}>Next In Line</p>
                    <p style={valueStyle('#14532d')}>
                        {queueData.nextInLineToken ? `#${queueData.nextInLineToken}` : 'None'}
                    </p>
                </div>

                <div style={cardStyle('#fefce8', '#fef08a')}>
                    <p style={labelStyle('#ca8a04')}>Patients Waiting</p>
                    <p style={valueStyle('#713f12')}>
                        {queueData.totalWaiting}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={buttonContainerStyle}>
                <button
                    onClick={handleNextPatient}
                    disabled={loading || queueData.totalWaiting === 0}
                    style={buttonStyle}
                >
                    {loading ? 'Calling...' : 'Call Next Patient ➡️'}
                </button>
            </div>
        </div>
    );
}