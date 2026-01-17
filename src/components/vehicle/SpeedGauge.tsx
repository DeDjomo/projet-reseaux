'use client';

import React from 'react';
import styles from './SpeedGauge.module.css';

interface SpeedGaugeProps {
    speed: number;
    maxSpeed?: number;
}

const SpeedGauge: React.FC<SpeedGaugeProps> = ({ speed, maxSpeed = 180 }) => {
    const percentage = Math.min((speed / maxSpeed) * 100, 100);
    const angle = -90 + (percentage * 180) / 100;

    const getColor = () => {
        if (speed === 0) return '#94a3b8'; // Gris
        if (speed < 50) return '#22c55e'; // Vert
        if (speed < 90) return '#3b82f6'; // Bleu
        if (speed < 120) return '#f59e0b'; // Orange
        return '#ef4444'; // Rouge
    };

    return (
        <div className={styles.container}>
            <div className={styles.gauge}>
                <svg viewBox="0 0 200 120" className={styles.svg}>
                    {/* Fond du gauge (arc gris) */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Arc de progression */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${percentage * 2.51}, 1000`}
                        className={styles.progressArc}
                    />

                    {/* Aiguille */}
                    <g transform={`rotate(${angle}, 100, 100)`}>
                        <line
                            x1="100"
                            y1="100"
                            x2="100"
                            y2="40"
                            stroke={getColor()}
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <circle cx="100" cy="100" r="6" fill={getColor()} />
                    </g>

                    {/* Marqueurs de vitesse */}
                    <text x="20" y="110" className={styles.marker}>0</text>
                    <text x="95" y="25" className={styles.marker}>{maxSpeed / 2}</text>
                    <text x="172" y="110" className={styles.marker}>{maxSpeed}</text>
                </svg>

                {/* Affichage digital de la vitesse */}
                <div className={styles.display}>
                    <span className={styles.speed}>{speed}</span>
                    <span className={styles.unit}>km/h</span>
                </div>
            </div>
            <p className={styles.label}>Vitesse actuelle</p>
        </div>
    );
};

export default SpeedGauge;
