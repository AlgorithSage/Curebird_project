import React, { useState } from 'react';
import DoctorAuth from './DoctorAuth';
import DoctorDashboard from './DoctorDashboard';

export default function DoctorPortal({ user, isNewDoctor }) {
    const [view, setView] = useState('login'); // 'login' | 'signup'

    // If user is logged in as doctor and verified, show dashboard
    if (user && !isNewDoctor) {
        return <DoctorDashboard user={user} />;
    }

    // Otherwise show Auth (Login or Profile Setup if isNewDoctor)
    return (
        <DoctorAuth initialUser={isNewDoctor ? user : null} />
    );
}
