// src/pages/PatientDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './PatientDashboard.css';
import LogoutButton from '../components/LogoutButton';
import { toast } from 'react-toastify';
import axios from 'axios';

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);
  //const [appointments, setAppointments] = useState([]);

const fetchPatientProfile = async () => {
  try {
    const res = await api.get('/patients/profile'); // call your backend API
    setPatientProfile(res.data);
  } catch (err) {
    console.error('Error fetching patient profile:', err.response?.data || err.message);
  }
};
// Fetch appointments for the patient
const token = localStorage.getItem('token');

  
  const cancelAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Appointment cancelled successfully');
      
    } catch (err) {
      console.error('Cancel appointment error:', err);
      alert('Failed to cancel appointment');
    }
  };

  // Fetch list of all doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors'); // use patient-safe endpoint
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to fetch doctors');
      console.error(err);
    }
  };

  // Fetch available slots for selected doctor
  const fetchSlots = async (doctorId) => {
    try {
      setLoadingSlots(true);
      const res = await api.get(`/slots?doctorId=${doctorId}`);
      // Sort slots by datetime
      const sortedSlots = res.data.sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
      );
      setAvailableSlots(sortedSlots);
    } catch (err) {
      toast.error('Error fetching slots');
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch current user's appointments
  const fetchMyAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setMyAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
      console.error(err);
    }
  };

  // Handle booking a slot
  const handleBook = async (slotId) => {
    try {
      await api.post('/appointments', { slotId });
      toast.success('Appointment booked successfully!');
      fetchSlots(selectedDoctorId);
      fetchMyAppointments();
    } catch (err) {
      toast.error('Booking failed');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
    fetchPatientProfile();
    
  }, []);

  return (
    <div className="patient-container">
      <h2>Patient Dashboard</h2>
      <LogoutButton />
    {patientProfile ? (
  <div className="patient-profile">
    <h3>Your Profile</h3>
    <p><strong>Name:</strong> {patientProfile.name}</p>
    <p><strong>Email:</strong> {patientProfile.email}</p>
    <p><strong>Role:</strong> {patientProfile.role}</p>
  </div>
) : (
  <p>Loading profile...</p>
)}

      {/* Doctor selection dropdown */}
      <div className="form-group">
        <label htmlFor="doctorSelect">Choose a Doctor:</label>
        <select
          id="doctorSelect"
          value={selectedDoctorId}
          onChange={(e) => {
            const doctorId = e.target.value;
            setSelectedDoctorId(doctorId);
            if (doctorId) fetchSlots(doctorId);
            else setAvailableSlots([]);
          }}
        >
          <option value="">-- Select a Doctor --</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Available Slots */}
      {selectedDoctorId && (
        <>
          <h3>Available Slots</h3>
          {loadingSlots ? (
            <p>Loading slots...</p>
          ) : availableSlots.length === 0 ? (
            <p>No available slots for this doctor.</p>
          ) : (
            <ul className="slot-list">
              {availableSlots.map((slot) => (
                <li key={slot._id} className="slot-item">
                  <span>{new Date(slot.datetime).toLocaleString()}</span>
                  <button
                    onClick={() => handleBook(slot._id)}
                    disabled={slot.isBooked}
                    className={slot.isBooked ? 'booked' : ''}
                  >
                    {slot.isBooked ? 'Booked' : 'Book'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Appointment History */}
      <h3>My Appointments</h3>
      {myAppointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
    {myAppointments
      .filter((appt) => appt.slot && appt.slot.datetime)
      .sort((a, b) => new Date(a.slot.datetime) - new Date(b.slot.datetime))
      .map((appt) => (
        <tr key={appt._id}>
          <td>{appt.doctor?.name || 'N/A'}</td>
          <td>{new Date(appt.slot.datetime).toLocaleString()}</td>
          <td>
            <button
              onClick={() => cancelAppointment(appt._id)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </td>
        </tr>
      ))}
  </tbody>

        </table>
      )}
    </div>
  );
};

export default PatientDashboard;
