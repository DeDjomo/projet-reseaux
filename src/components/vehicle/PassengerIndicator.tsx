'use client';

import React from 'react';
import { FiUser } from 'react-icons/fi';
import styles from './PassengerIndicator.module.css';

interface PassengerIndicatorProps {
    current: number;
    capacity: number;
}

const PassengerIndicator: React.FC<PassengerIndicatorProps> = ({
    current,
    capacity
}) => {
    const percentage = (current / capacity) * 100;

    const getColor = () => {
        if (percentage >= 100) return '#ef4444'; // Rouge - Plein
        if (percentage >= 75) return '#f59e0b'; // Orange
        return '#22c55e'; // Vert
    };

    return (
        <div className={styles.container}>
            <div className={styles.seatsGrid}>
                {Array.from({ length: capacity }).map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.seat} ${index < current ? styles.occupied : ''}`}
                    >
                        <FiUser />
                    </div>
                ))}
            </div>

            <div className={styles.info}>
                <p className={styles.count} style={{ color: getColor() }}>
                    {current} / {capacity}
                </p>
                <p className={styles.label}>Passagers</p>
            </div>
        </div>
    );
};

export default PassengerIndicator;
