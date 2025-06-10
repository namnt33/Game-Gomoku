import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserTab = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8080/api/users/${editingUser.id}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u.id === editingUser.id ? response.data : u)));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border p-3 font-semibold">Email</th>
              <th className="border p-3 font-semibold">First Name</th>
              <th className="border p-3 font-semibold">Last Name</th>
              <th className="border p-3 font-semibold">Birthday</th>
              <th className="border p-3 font-semibold">Address</th>
              <th className="border p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <td className="border p-3">{user.email}</td>
                    <td className="border p-3">
                      <input
                        value={editingUser.firstName}
                        onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        value={editingUser.lastName}
                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        type="date"
                        value={editingUser.birthDay}
                        onChange={(e) => setEditingUser({ ...editingUser, birthDay: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        value={editingUser.address}
                        onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </td>
                    <td className="border p-3 flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-all duration-300 hover:shadow-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-all duration-300 hover:shadow-md"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-3">{user.email}</td>
                    <td className="border p-3">{user.firstName}</td>
                    <td className="border p-3">{user.lastName}</td>
                    <td className="border p-3">{user.birthDay}</td>
                    <td className="border p-3">{user.address}</td>
                    <td className="border p-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTab;