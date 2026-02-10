/**
 * Service pour les données de référence
 * Quartiers, Moyens de paiement, etc.
 */

import api from './api';

class ReferenceService {
    /**
     * Récupérer tous les quartiers
     * @returns {Promise<Array>}
     */
    async getQuartiers() {
        try {
            const response = await api.get('/app/quartiers', { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des quartiers');
        } catch (error) {
            console.error('Get quartiers error:', error);
            throw error;
        }
    }

    /**
     * Récupérer tous les moyens de paiement
     * @returns {Promise<Array>}
     */
    async getMoyensPaiement() {
        try {
            const response = await api.get('/app/moyens-paiement', { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des moyens de paiement');
        } catch (error) {
            console.error('Get moyens paiement error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les tarifs de livraison
     * @param {string} restaurateurId - ID du restaurateur (optionnel)
     * @param {string} quartierId - ID du quartier (optionnel)
     * @returns {Promise<Array>}
     */
    async getTarifsLivraison(restaurateurId = null, quartierId = null) {
        try {
            const params = new URLSearchParams();

            if (restaurateurId) params.append('restaurateur_id', restaurateurId);
            if (quartierId) params.append('quartier_id', quartierId);

            const endpoint = `/app/tarif-livraisons${params.toString() ? '?' + params.toString() : ''}`;
            const response = await api.get(endpoint, { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des tarifs de livraison');
        } catch (error) {
            console.error('Get tarifs livraison error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les moyens de paiement d'un restaurateur
     * @param {string} restaurateurId - ID du restaurateur
     * @returns {Promise<Array>}
     */
    async getRestaurateurMoyensPaiement(restaurateurId) {
        try {
            const response = await api.get(`/app/restaurateur-moyen-paiements?restaurateur_id=${restaurateurId}`, { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des moyens de paiement du restaurateur');
        } catch (error) {
            console.error('Get restaurateur moyens paiement error:', error);
            throw error;
        }
    }
}

// Instance singleton
const referenceService = new ReferenceService();

export default referenceService;
