// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css'; // Custom styling
import LogoutButton from '../components/LogoutButton';
import { toast } from 'react-toastify';


const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', specialization: '' });

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (error) {
      toast.error('Error fetching doctors:', error);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', form);
      setForm({ name: '', email: '', specialization: '' });
      toast.success('Doctor added successfully');
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding doctor');
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (err) {
      alert('Error deleting doctor');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      <LogoutButton />

      <form onSubmit={handleAddDoctor} className="admin-form">
        <input
          type="text"
          placeholder="Doctor Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Doctor Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Specialization"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          required
        />
        <button type="submit">Add Doctor</button>
      </form>

      <h3>All Doctors</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc._id}>
              <td>{doc.name}</td>
              <td>{doc.email}</td>
              <td>{doc.specialization}</td>
              <td>
                <button onClick={() => deleteDoctor(doc._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
