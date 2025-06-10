import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import FontAwesome nếu chưa có
import '@fortawesome/fontawesome-free/css/all.min.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    birthDay: '',
    address: '',
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/email/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('User data fetched:', response.data);
        setUser(response.data);
        setOriginalUser(response.data);
      } catch (err) {
        setError('Failed to load user data.');
        console.error('Fetch error:', err);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!user.id) {
      setError('User ID is missing.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setOriginalUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setEditingField(null);
      setError('');
    } catch (err) {
      setError('Failed to update profile.');
      setSuccess('');
      console.error('Save error:', err);
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/users/change-password`,
        {
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setError('');
    } catch (err) {
      setError('Failed to change password. Please check your current password.');
      setSuccess('');
      console.error('Change password error:', err);
    }
  };

  const startEditing = (field) => {
    console.log('Start editing field:', field);
    setEditingField(field);
  };

  // Debug trạng thái
  console.log('isEditing:', isEditing, 'editingField:', editingField);

  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-center text-white p-6" style={{ backgroundImage: `url('https://wallpaperaccess.com/full/40409.jpg')` }}>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-600 animate-text-glow">
          Profile
        </h1>

        {error && <p className="text-red-400 mb-6 animate-text-reveal text-center">{error}</p>}
        {success && <p className="text-green-400 mb-6 animate-text-reveal text-center">{success}</p>}

        <div className="w-full max-w-md bg-gray-800/80 p-6 rounded-xl shadow-2xl animate-fade-slide-up">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-gray-300">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-gray-300">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={user.firstName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing || editingField !== 'firstName'} // Chỉ bật khi isEditing và editingField khớp
                  className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                />
              </div>
              {isEditing && (
                <button onClick={() => startEditing('firstName')} className="ml-2 text-teal-400 hover:text-teal-600">
                  <i className="fas fa-pen"></i>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-gray-300">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={user.lastName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing || editingField !== 'lastName'}
                  className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                />
              </div>
              {isEditing && (
                <button onClick={() => startEditing('lastName')} className="ml-2 text-teal-400 hover:text-teal-600">
                  <i className="fas fa-pen"></i>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-gray-300">Birthday</label>
                <input
                  type="date"
                  name="birthDay"
                  value={user.birthDay || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing || editingField !== 'birthDay'}
                  className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                />
              </div>
              {isEditing && (
                <button onClick={() => startEditing('birthDay')} className="ml-2 text-teal-400 hover:text-teal-600">
                  <i className="fas fa-pen"></i>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-gray-300">Address</label>
                <input
                  type="text"
                  name="address"
                  value={user.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing || editingField !== 'address'}
                  className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                />
              </div>
              {isEditing && (
                <button onClick={() => startEditing('address')} className="ml-2 text-teal-400 hover:text-teal-600">
                  <i className="fas fa-pen"></i>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="relative px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
                >
                  <span className="relative z-10">Save</span>
                  <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
                </button>
                <button
                  onClick={handleCancel}
                  className="relative px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
                >
                  <span className="relative z-10">Cancel</span>
                  <span className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="relative px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
              >
                <span className="relative z-10">Edit Profile</span>
                <span className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="mt-8 relative px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
        >
          <span className="relative z-10">Change Password</span>
          <span className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
        </button>

        <button
          onClick={() => navigate('/main')}
          className="mt-4 relative px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-110 hover:rotate-2 transition-all duration-500 group overflow-hidden"
        >
          <span className="relative z-10">Back to Main</span>
          <span className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
        </button>

        {showPasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20 animate-fade-in">
            <div className="bg-gray-800/90 p-6 rounded-xl shadow-2xl w-full max-w-md animate-modal-rise">
              <h2 className="text-2xl font-bold mb-4 text-teal-400">Change Password</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col space-y-4">
                <div>
                  <label className="block text-gray-300">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 bg-gray-700/80 text-white rounded-lg shadow-lg focus:ring-4 focus:ring-teal-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-xl hover:from-green-600 hover:to-teal-700 transform hover:scale-110 transition-all duration-500 group overflow-hidden"
                  >
                    <span className="relative z-10">Save</span>
                    <span className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="relative px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-110 transition-all duration-500 group overflow-hidden"
                  >
                    <span className="relative z-10">Cancel</span>
                    <span className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(96, 165, 250, 0.8); }
          50% { text-shadow: 0 0 20px rgba(147, 51, 234, 1); }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes text-reveal {
          0% { opacity: 0; filter: blur(5px); }
          100% { opacity: 1; filter: blur(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modal-rise {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.8s ease-out;
        }
        .animate-text-reveal {
          animation: text-reveal 1s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-modal-rise {
          animation: modal-rise 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;