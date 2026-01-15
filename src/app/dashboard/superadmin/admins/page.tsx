"use client";

import { useEffect, useState } from 'react';
import { Users, Search, Filter, Trash2, Eye, X, AlertTriangle, Key, Shield, Mail, Phone } from 'lucide-react';
import { adminApi } from '@/services';
import { Admin, AdminRole } from '@/types';
import toast from 'react-hot-toast';

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminRole | 'ALL'>('ALL');
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<Admin | null>(null);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState<Admin | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const data = await adminApi.getAll();
            setAdmins(data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch =
            admin.adminFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.adminLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'ALL' || admin.adminRole === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleDelete = async (adminId: number) => {
        try {
            await adminApi.delete(adminId);
            setAdmins(prev => prev.filter(a => a.adminId !== adminId));
            setShowDeleteModal(null);
            toast.success('Administrateur supprimé');
        } catch (error) {
            console.error('Failed to delete admin:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleResetPassword = async () => {
        if (!showResetPasswordModal || !newPassword) return;

        setResetLoading(true);
        try {
            await adminApi.resetPassword(showResetPasswordModal.adminId, { newPassword });
            toast.success('Mot de passe réinitialisé');
            setShowResetPasswordModal(null);
            setNewPassword('');
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error('Erreur lors de la réinitialisation');
        } finally {
            setResetLoading(false);
        }
    };

    const getRoleColor = (role?: AdminRole) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'ADMIN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'MANAGER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getRoleLabel = (role?: AdminRole) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'Super Admin';
            case 'ADMIN': return 'Admin';
            case 'MANAGER': return 'Manager';
            default: return role || '-';
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Users className="text-purple-500" />
                        Administrateurs
                    </h1>
                    <p className="text-text-muted mt-1">
                        Gérez tous les administrateurs de la plateforme ({admins.length})
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-glass rounded-lg bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-text-muted" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as AdminRole | 'ALL')}
                        className="px-3 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">Tous les rôles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-glass">
                        <thead className="bg-glass/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Administrateur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase">Créé le</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-sub uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass">
                            {filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        Aucun administrateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map(admin => (
                                    <tr key={admin.adminId} className="hover:bg-glass/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple-500">
                                                        {admin.adminFirstName?.[0]}{admin.adminLastName?.[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text-main">
                                                        {admin.adminFirstName} {admin.adminLastName}
                                                    </p>
                                                    <p className="text-sm text-text-muted">{admin.adminPhoneNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub">
                                            {admin.adminEmail}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.adminRole)}`}>
                                                {getRoleLabel(admin.adminRole)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isActive
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {admin.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub text-sm">
                                            {formatDate(admin.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedAdmin(admin)}
                                                    className="p-1.5 rounded hover:bg-glass text-text-muted hover:text-text-main transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowResetPasswordModal(admin)}
                                                    className="p-1.5 rounded hover:bg-glass text-text-muted hover:text-orange-500 transition-colors"
                                                    title="Réinitialiser mot de passe"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal(admin)}
                                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedAdmin && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-glass flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-main">Détails de l'administrateur</h2>
                            <button onClick={() => setSelectedAdmin(null)} className="p-1 hover:bg-glass rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-glass">
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-xl font-bold text-purple-500">
                                        {selectedAdmin.adminFirstName?.[0]}{selectedAdmin.adminLastName?.[0]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-text-main">
                                        {selectedAdmin.adminFirstName} {selectedAdmin.adminLastName}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedAdmin.adminRole)}`}>
                                        {getRoleLabel(selectedAdmin.adminRole)}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-text-muted" />
                                    <div>
                                        <p className="text-sm text-text-muted">Email</p>
                                        <p className="font-medium text-text-main">{selectedAdmin.adminEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-text-muted" />
                                    <div>
                                        <p className="text-sm text-text-muted">Téléphone</p>
                                        <p className="font-medium text-text-main">{selectedAdmin.adminPhoneNumber || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Adresse</p>
                                    <p className="font-medium text-text-main">{selectedAdmin.personalAddress || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Ville</p>
                                    <p className="font-medium text-text-main">{selectedAdmin.personalCity || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">NIU</p>
                                    <p className="font-medium text-text-main">{selectedAdmin.niu || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted">Dernière connexion</p>
                                    <p className="font-medium text-text-main">{formatDate(selectedAdmin.lastLogin)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-text-main mb-2">Supprimer l'administrateur ?</h2>
                            <p className="text-text-muted mb-4">
                                Cette action supprimera définitivement le compte de {showDeleteModal.adminFirstName} {showDeleteModal.adminLastName}.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteModal.adminId)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-lg border border-glass shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-glass flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-text-main flex items-center gap-2">
                                <Key size={20} />
                                Réinitialiser le mot de passe
                            </h2>
                            <button onClick={() => setShowResetPasswordModal(null)} className="p-1 hover:bg-glass rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-text-muted">
                                Définir un nouveau mot de passe pour {showResetPasswordModal.adminFirstName} {showResetPasswordModal.adminLastName}
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-glass rounded-lg bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Minimum 8 caractères"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowResetPasswordModal(null)}
                                    className="flex-1 px-4 py-2 border border-glass rounded-lg text-text-main hover:bg-glass transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={resetLoading || newPassword.length < 8}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {resetLoading ? 'En cours...' : 'Réinitialiser'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
