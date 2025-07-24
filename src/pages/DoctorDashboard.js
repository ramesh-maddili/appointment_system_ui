// src/pages/DoctorDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './DoctorDashboard.css';
import LogoutButton from '../components/LogoutButton';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newSlot, setNewSlot] = useState('');

  //  Fetch logged-in doctor's profile
  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get('/doctors/profile');
      console.log('Doctor Profile:', res.data);
      setDoctorProfile(res.data);
    } catch (err) {
      console.error('Error fetching doctor profile:', err.response?.data || err.message);
    }
  };

  //  Fetch slots created by doctor
  const fetchSlots = async () => {
    try {
      const res = await api.get('/slots');
      setSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots:', err.response?.data || err.message);
    }
  };

  //  Fetch appointments for doctor
  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err.response?.data || err.message);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot) return;

    try {
      await api.post('/slots', { datetime: newSlot });
      setNewSlot('');
      fetchSlots();
    } catch (err) {
      console.error('Add slot failed:', err.response?.data || err.message);
      toast.success(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const deleteSlot = async (_id) => {
    try {
      const { data: { message } } = await api.delete(`/slots/${_id}`);
      alert(message || 'Slot deleted successfully');
      fetchSlots();
    } catch (err) {
      toast.error('Failed to delete slot', err.response?.data?.message || 'Server error');
      console.error('Delete slot failed:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
    fetchSlots();
    fetchAppointments();
  }, []);

  return (
    <div className="doctor-container">
      <h2>Doctor Dashboard</h2>
      <LogoutButton />

      {/*  Doctor Profile Display */}
      {doctorProfile ? (
        <div className="doctor-profile">
          <h3>Your Profile</h3>
          <p><strong>Name:</strong> {doctorProfile.name}</p>
          <p><strong>Email:</strong> {doctorProfile.email}</p>
          <p><strong>Specialization:</strong> {doctorProfile.specialization}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      <form onSubmit={handleAddSlot} className="slot-form">
        <input
          type="datetime-local"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
        />
        <button type="submit">Add Slot</button>
      </form>

      <h3>Your Available Slots</h3>
      <ul className="slot-list">
        {slots.map((slot) => (
          <li key={slot._id}>
            {new Date(slot.datetime).toLocaleString()}
            <button onClick={() => deleteSlot(slot._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Your Appointments</h3>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{appt.patient?.name || 'N/A'}</td>
              <td>{appt.slot?.datetime ? new Date(appt.slot.datetime).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorDashboard;
