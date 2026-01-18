import { useState, useEffect } from 'react';
import api from '../api/axios';

function ImpactView() {
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchState = async () => {
        try {
            const response = await api.get('/impact/state');
            setState(response.data);
        } catch (error) {
            console.error("Failed to fetch impact state", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    const handleGrow = async () => {
        try {
            const response = await api.post('/impact/grow');
            setState(response.data);
        } catch (error) {
            console.error("Failed to grow forest", error);
        }
    };

    if (loading) return <div className="loading">Initializing Ecosystem... 🌳</div>;
    if (!state) return <div className="error">Ecosystem connection lost.</div>;

    return (
        <div className="impact-container fade-in">
            <header className="dashboard-header" style={{ marginBottom: '24px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Your Digital Forest 🌳</h1>
                    <p className="subtitle" style={{ opacity: 0.6 }}>Every 60 minutes of focus plants symbolic life.</p>
                </div>
                <button className="btn-primary" onClick={handleGrow} style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                    ✨ Nurture Forest
                </button>
            </header>

            <div className="impact-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card glass-card stat-card" style={{ textAlign: 'center', borderBottom: '3px solid var(--secondary)' }}>
                    <div className="xp-label">TOTAL TREES</div>
                    <h2 style={{ fontSize: '36px', margin: '4px 0', color: 'var(--secondary)' }}>{state.total_impact_points}</h2>
                    <p style={{ fontSize: '12px', opacity: 0.6 }}>Life Created</p>
                </div>
                <div className="card glass-card stat-card" style={{ textAlign: 'center', borderBottom: '3px solid #60a5fa' }}>
                    <div className="xp-label">CO2 OFFSET</div>
                    <h2 style={{ fontSize: '36px', margin: '4px 0', color: '#60a5fa' }}>{state.co2_offset_symbolic}kg</h2>
                    <p style={{ fontSize: '12px', opacity: 0.6 }}>Symbolic Impact</p>
                </div>
                <div className="card glass-card stat-card" style={{ textAlign: 'center', borderBottom: '3px solid #fbbf24' }}>
                    <div className="xp-label">GROVE STATUS</div>
                    <h2 style={{ fontSize: '36px', margin: '4px 0', color: '#fbbf24' }}>{state.total_impact_points > 10 ? 'Lush' : 'Sprouting'}</h2>
                    <p style={{ fontSize: '12px', opacity: 0.6 }}>Health Level</p>
                </div>
            </div>

            {/* Premium Forest Scene */}
            <div className="forest-scene" style={{
                height: '500px',
                perspective: '1200px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '32px',
                background: 'linear-gradient(to bottom, #020617 0%, #1a2e1a 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Sky Layer */}
                <div className="sky-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}></div>

                {/* Ground Plane (3D) */}
                <div className="forest-floor" style={{
                    position: 'absolute',
                    bottom: '-150px',
                    left: '-10%',
                    width: '120%',
                    height: '450px',
                    background: 'radial-gradient(ellipse at center, #1a2e1a 0%, #060d06 80%)',
                    transform: 'rotateX(65deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)',
                    zIndex: 1
                }}></div>

                {/* Tree Container (Depth Sorted) */}
                <div className="tree-layer" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2,
                    pointerEvents: 'none'
                }}>
                    {state.trees.length > 0 ? state.trees.map((tree, i) => {
                        const leftPos = (tree.id * 89) % 85 + 5;
                        const topPos = 45 + (tree.id * 31) % 45;
                        const zIndex = Math.floor(topPos);

                        return (
                            <div key={tree.id} className={`tree-item stage-${tree.stage} floating`} style={{
                                position: 'absolute',
                                left: `${leftPos}%`,
                                top: `${topPos}%`,
                                zIndex: zIndex,
                                fontSize: tree.stage === 'seed' ? '16px' :
                                    tree.stage === 'sprout' ? '32px' :
                                        tree.stage === 'sapling' ? '48px' : '72px',
                                transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                transform: `translate(-50%, -100%) scale(${0.7 + (topPos / 100) * 0.6})`,
                                filter: `drop-shadow(0 0 20px ${tree.stage === 'tree' ? 'rgba(16, 185, 129, 0.4)' : 'transparent'})`,
                                pointerEvents: 'auto',
                                cursor: 'help'
                            }} title={`Tree #${tree.id} - ${tree.stage}`}>
                                {tree.stage === 'seed' ? '🫘' :
                                    tree.stage === 'sprout' ? '🌱' :
                                        tree.stage === 'sapling' ? '🌿' :
                                            (tree.id % 2 === 0 ? '🌳' : '🌲')}
                            </div>
                        );
                    }) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}>
                            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🌌</div>
                            <p style={{ fontSize: '18px' }}>Your universe is waiting for its first seed.</p>
                        </div>
                    )}
                </div>

                {/* Fireflies (Particles) */}
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="firefly" style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '3px',
                        height: '3px',
                        background: '#fbbf24',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24',
                        animation: `float ${3 + Math.random() * 5}s infinite alternate`,
                        animationDelay: `${Math.random() * 5}s`,
                        zIndex: 5,
                        opacity: 0.6
                    }}></div>
                ))}
            </div>

            <div className="card glass-card" style={{ marginTop: '32px', borderLeft: '4px solid var(--secondary)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', opacity: 0.9 }}>
                    <strong>🌿 The Ecosystem Loop:</strong> Your study discipline directly funds this digital grove.
                    In a future release, these milestones will trigger real-world donations to global reforestation projects.
                    Every minute of focus makes the world a bit greener.
                </p>
            </div>
        </div>
    );
}

export default ImpactView;
