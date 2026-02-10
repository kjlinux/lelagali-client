/**
 * Service pour la gestion des commandes
 */

import api from './api';

class CommandeService {
    /**
     * Récupérer toutes les commandes avec filtres
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>}
     */
    async getCommandes(filters = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Filtres
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.type_service) queryParams.append('type_service', filters.type_service);
            if (filters.client_id) queryParams.append('client_id', filters.client_id);
            if (filters.restaurateur_id) queryParams.append('restaurateur_id', filters.restaurateur_id);
            if (filters.date_debut) queryParams.append('date_debut', filters.date_debut);
            if (filters.date_fin) queryParams.append('date_fin', filters.date_fin);

            // Pagination
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.per_page) queryParams.append('per_page', filters.per_page);

            const endpoint = `/app/commandes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await api.get(endpoint);

            if (response.success) {
                return {
                    data: response.data || [],
                    meta: response.meta || {}
                };
            }

            throw new Error('Erreur lors de la récupération des commandes');
        } catch (error) {
            console.error('Get commandes error:', error);
            throw error;
        }
    }

    /**
     * Récupérer une commande par son ID
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<Object>}
     */
    async getCommandeById(commandeId) {
        try {
            const response = await api.get(`/app/commandes/${commandeId}`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Commande non trouvée');
        } catch (error) {
            console.error('Get commande by ID error:', error);
            throw error;
        }
    }

    /**
     * Créer une nouvelle commande
     * @param {Object} commandeData - Données de la commande
     * @returns {Promise<Object>}
     */
    async createCommande(commandeData) {
        try {
            const response = await api.post('/app/commandes', commandeData);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la création de la commande');
        } catch (error) {
            console.error('Create commande error:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour une commande
     * @param {string} commandeId - ID de la commande
     * @param {Object} commandeData - Nouvelles données
     * @returns {Promise<Object>}
     */
    async updateCommande(commandeId, commandeData) {
        try {
            const response = await api.put(`/app/commandes/${commandeId}`, commandeData);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la mise à jour de la commande');
        } catch (error) {
            console.error('Update commande error:', error);
            throw error;
        }
    }

    /**
     * Accepter une commande (restaurateur)
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<Object>}
     */
    async accepterCommande(commandeId) {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/accept`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de l\'acceptation de la commande');
        } catch (error) {
            console.error('Accept commande error:', error);
            throw error;
        }
    }

    /**
     * Marquer une commande comme prête
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<Object>}
     */
    async marquerPrete(commandeId) {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/ready`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors du marquage de la commande');
        } catch (error) {
            console.error('Mark ready error:', error);
            throw error;
        }
    }

    /**
     * Mettre une commande en livraison
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<Object>}
     */
    async mettreEnLivraison(commandeId) {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/deliver`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la mise en livraison');
        } catch (error) {
            console.error('Deliver error:', error);
            throw error;
        }
    }

    /**
     * Marquer une commande comme terminée
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<Object>}
     */
    async terminerCommande(commandeId) {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/complete`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la finalisation de la commande');
        } catch (error) {
            console.error('Complete commande error:', error);
            throw error;
        }
    }

    /**
     * Annuler une commande
     * @param {string} commandeId - ID de la commande
     * @param {string} raison - Raison de l'annulation
     * @returns {Promise<Object>}
     */
    async annulerCommande(commandeId, raison = '') {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/cancel`, { raison });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de l\'annulation de la commande');
        } catch (error) {
            console.error('Cancel commande error:', error);
            throw error;
        }
    }

    /**
     * Marquer une commande comme payée
     * @param {string} commandeId - ID de la commande
     * @param {string} reference - Référence de paiement
     * @param {string} numero - Numéro de paiement
     * @returns {Promise<Object>}
     */
    async marquerPayee(commandeId, reference = '', numero = '') {
        try {
            const response = await api.patch(`/app/commandes/${commandeId}/mark-paid`, {
                reference_paiement: reference,
                numero_paiement: numero
            });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la confirmation du paiement');
        } catch (error) {
            console.error('Mark paid error:', error);
            throw error;
        }
    }

    /**
     * Supprimer une commande
     * @param {string} commandeId - ID de la commande
     * @returns {Promise<void>}
     */
    async deleteCommande(commandeId) {
        try {
            const response = await api.delete(`/app/commandes/${commandeId}`);

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la suppression de la commande');
            }
        } catch (error) {
            console.error('Delete commande error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les statistiques des commandes
     * @returns {Promise<Object>}
     */
    async getStatistics() {
        try {
            const response = await api.get('/app/commandes/stats/dashboard');

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des statistiques');
        } catch (error) {
            console.error('Get statistics error:', error);
            throw error;
        }
    }

    /**
     * Recherche avancée de commandes
     * @param {Object} searchCriteria - Critères de recherche
     * @returns {Promise<Object>}
     */
    async searchCommandes(searchCriteria) {
        try {
            const response = await api.post('/app/search/commandes', searchCriteria);

            if (response.success) {
                return {
                    data: response.data || [],
                    meta: response.meta || {}
                };
            }

            throw new Error('Erreur lors de la recherche');
        } catch (error) {
            console.error('Search commandes error:', error);
            throw error;
        }
    }

    /**
     * Récupérer le rapport des ventes
     * @param {string} dateDebut - Date de début
     * @param {string} dateFin - Date de fin
     * @param {string} restaurateurId - ID du restaurateur (optionnel)
     * @returns {Promise<Object>}
     */
    async getSalesReport(dateDebut, dateFin, restaurateurId = null) {
        try {
            const params = new URLSearchParams({
                date_debut: dateDebut,
                date_fin: dateFin
            });

            if (restaurateurId) {
                params.append('restaurateur_id', restaurateurId);
            }

            const response = await api.get(`/app/reports/sales?${params.toString()}`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la génération du rapport');
        } catch (error) {
            console.error('Get sales report error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les plats les plus vendus
     * @param {Object} filters - Filtres (date_debut, date_fin, restaurateur_id, limit)
     * @returns {Promise<Array>}
     */
    async getBestsellers(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.date_debut) params.append('date_debut', filters.date_debut);
            if (filters.date_fin) params.append('date_fin', filters.date_fin);
            if (filters.restaurateur_id) params.append('restaurateur_id', filters.restaurateur_id);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await api.get(`/app/reports/bestsellers?${params.toString()}`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des bestsellers');
        } catch (error) {
            console.error('Get bestsellers error:', error);
            throw error;
        }
    }
}

// Instance singleton
const commandeService = new CommandeService();

export default commandeService;
