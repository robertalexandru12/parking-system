import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdministratorsStyle.css';
import './DashboardStyle.css';

const Administrators = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [admins, setAdmins] = useState([]); // Lista de administratori
    const [editAdmin, setEditAdmin] = useState(null); // Stare pentru editare
    const [newAdmin, setNewAdmin] = useState({ email: '', username: '', firstname: '', lastname: '', password: '' }); // Stare pentru adăugare
    const [showEditModal, setShowEditModal] = useState(false); // Modal pentru editare
    const [showAddModal, setShowAddModal] = useState(false); // Modal pentru adăugare
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal pentru confirmare ștergere
    const [adminToDelete, setAdminToDelete] = useState(null); // Administratorul de șters
    const [loading, setLoading] = useState(true); // Stare pentru încărcare
    const [errors, setErrors] = useState({}); // Stare pentru mesaje de eroare
    const [currentPage, setCurrentPage] = useState(1); // Pagina curentă
    const [adminsPerPage] = useState(6); // Numărul de administratori pe pagină

    const editModalRef = useRef(null);
    const addModalRef = useRef(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/admin-auth/admins');
                if (!response.ok) {
                    throw new Error('Eroare la preluarea administratorilor');
                }
                const data = await response.json();
                setAdmins(data);
            } catch (error) {
                console.error('Eroare:', error);
                toast.error('Eroare la preluarea administratorilor');
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);


    const handleDeleteClick = (admin) => {
        setAdminToDelete(admin); 
        setShowDeleteModal(true);
    };

    // Confirmă ștergerea
    const handleConfirmDelete = async () => {
        if (!adminToDelete) return; 

        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin-auth/admins/delete/${adminToDelete.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Eroare la ștergerea administratorului');
            }
            setAdmins(admins.filter(admin => admin.id !== adminToDelete.id)); 
            toast.success('Administratorul a fost șters cu succes!'); 
        } catch (error) {
            console.error('Eroare:', error);
            toast.error('Eroare la ștergerea administratorului'); 
        } finally {
            setShowDeleteModal(false); 
            setAdminToDelete(null);
        }
    };


    const handleEdit = (admin) => {
        setEditAdmin(admin);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const newErrors = {};
        if (!editAdmin.email) newErrors.email = 'Email este obligatoriu';
        if (!editAdmin.username) newErrors.username = 'Username este obligatoriu';
        if (!editAdmin.firstname) newErrors.firstname = 'First Name este obligatoriu';
        if (!editAdmin.lastname) newErrors.lastname = 'Last Name este obligatoriu';
        if (!editAdmin.password) newErrors.password = 'Password este obligatoriu';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin-auth/admins/${editAdmin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editAdmin),
            });
            if (!response.ok) {
                throw new Error('Eroare la actualizarea administratorului');
            }
            setAdmins(admins.map(admin => admin.id === editAdmin.id ? editAdmin : admin));
            setShowEditModal(false);
            toast.success('Administratorul a fost actualizat cu succes!');
        } catch (error) {
            console.error('Eroare:', error);
            toast.error('Eroare la actualizarea administratorului');
        }
    };

    const handleAddAdmin = async () => {
        const newErrors = {};
        if (!newAdmin.email) newErrors.email = 'Email este obligatoriu';
        if (!newAdmin.username) newErrors.username = 'Username este obligatoriu';
        if (!newAdmin.firstname) newErrors.firstname = 'First Name este obligatoriu';
        if (!newAdmin.lastname) newErrors.lastname = 'Last Name este obligatoriu';
        if (!newAdmin.password) newErrors.password = 'Password este obligatoriu';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        let tempAdmin;

        try {
            const response = await fetch('http://localhost:8080/api/v1/admin-auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAdmin),
            });

            if (!response.ok) {
                throw new Error('Eroare la adăugarea administratorului');
            }

            const data = await response.json();
            tempAdmin = { ...newAdmin, id: data.id };
            setAdmins([...admins, tempAdmin]);
            setNewAdmin({ email: '', username: '', firstname: '', lastname: '', password: '' });
            setShowAddModal(false);
            toast.success('Administratorul a fost adăugat cu succes!');
        } catch (error) {
            setShowAddModal(false);
            console.error('Eroare:', error);
            if (tempAdmin) {
                setAdmins(admins.filter(admin => admin.id !== tempAdmin.id));
            }
            toast.error('Eroare la adăugarea administratorului');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEditModal && editModalRef.current && !editModalRef.current.contains(event.target)) {
                setShowEditModal(false);
            }
            if (showAddModal && addModalRef.current && !addModalRef.current.contains(event.target)) {
                setShowAddModal(false);
            }
            if (showDeleteModal && addModalRef.current && !addModalRef.current.contains(event.target)) {
                setShowDeleteModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEditModal, showAddModal, showDeleteModal]);

    const indexOfLastAdmin = currentPage * adminsPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
    const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="d-flex vh-100">

            <ToastContainer />

            <Navbar />

            <div className="flex-grow-1 p-4">
                <h2>Gestioneaza administratorii</h2>
                <p>Bun venit în pagina de administrare a administratorilor parcarii</p>

                <button className="btn btn-primary mb-3" onClick={() => setShowAddModal(true)}>
                    Adaugă Administrator
                </button>

                <div className="mt-4">
                    <h3>Lista Administratori</h3>
                    {loading ? (
                        <p>Se încarcă...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAdmins.map(admin => (
                                        <tr key={admin.id}>
                                            <td>{admin.id}</td>
                                            <td>{admin.email}</td>
                                            <td>{admin.username}</td>
                                            <td>{admin.firstname}</td>
                                            <td>{admin.lastname}</td>
                                            <td>
                                                <button className="btn btn-sm me-2" onClick={() => handleEdit(admin)}>
                                                    <img 
                                                        src="/images/edit.png" 
                                                        alt="Edit" 
                                                        style={{ width: '24px', height: '24px' }} 
                                                    />
                                                </button>
                                                <button className="btn btn-sm" onClick={() => handleDeleteClick(admin)}>
                                                    <img 
                                                        src="/images/delete.png" 
                                                        alt="Delete" 
                                                        style={{ width: '24px', height: '24px' }} 
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="pagination">
                        {Array.from({ length: Math.ceil(admins.length / adminsPerPage) }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {showEditModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content" ref={editModalRef}>
                            <h3>Modifică Administrator</h3>
                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={editAdmin.email}
                                    onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                                />
                                {errors.email && <div className="text-danger">{errors.email}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editAdmin.username}
                                    onChange={(e) => setEditAdmin({ ...editAdmin, username: e.target.value })}
                                />
                                {errors.username && <div className="text-danger">{errors.username}</div>}
                            </div>
                            <div className="mb-3">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editAdmin.firstname}
                                    onChange={(e) => setEditAdmin({ ...editAdmin, firstname: e.target.value })}
                                />
                                {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editAdmin.lastname}
                                    onChange={(e) => setEditAdmin({ ...editAdmin, lastname: e.target.value })}
                                />
                                {errors.lastname && <div className="text-danger">{errors.lastname}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={editAdmin.password}
                                    onChange={(e) => setEditAdmin({ ...editAdmin, password: e.target.value })}
                                />
                                {errors.password && <div className="text-danger">{errors.password}</div>}
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-success" onClick={handleSaveEdit}>
                                    Salvează
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Închide
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content" ref={addModalRef}>
                            <h3>Adaugă Administrator Nou</h3>
                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                />
                                {errors.email && <div className="text-danger">{errors.email}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                />
                                {errors.username && <div className="text-danger">{errors.username}</div>}
                            </div>
                            <div className="mb-3">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newAdmin.firstname}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, firstname: e.target.value })}
                                />
                                {errors.firstname && <div className="text-danger">{errors.firstname}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newAdmin.lastname}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, lastname: e.target.value })}
                                />
                                {errors.lastname && <div className="text-danger">{errors.lastname}</div>}
                            </div>
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                />
                                {errors.password && <div className="text-danger">{errors.password}</div>}
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-primary" onClick={handleAddAdmin}>
                                    Adaugă
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Închide
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content" ref={addModalRef}>
                            <h3>Confirmă ștergerea</h3>
                            <p>Ești sigur că vrei să ștergi administratorul <strong>{adminToDelete?.username}</strong>?</p>
                            <div className="modal-actions">
                                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                                    Șterge
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Administrators;