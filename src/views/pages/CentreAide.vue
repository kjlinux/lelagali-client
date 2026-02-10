<template>
    <div class="min-h-screen bg-[#FDF6EC]">
        <div class="max-w-4xl mx-auto px-4 py-12">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-[#4B2E1E] mb-4">Centre d'Aide</h1>
                <div class="w-24 h-1 bg-[#47A547] mx-auto mb-6"></div>
                <p class="text-lg text-gray-700">Tout ce que vous devez savoir pour utiliser LeLagaLi</p>
            </div>

            <!-- Content -->
            <div class="space-y-6">
                <!-- Pour les Clients -->
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-[#47A547] mb-6 flex items-center">
                        <i class="pi pi-user mr-3"></i>
                        Guide Client
                    </h2>

                    <div class="space-y-6">
                        <!-- Inscription -->
                        <div>
                            <h3 class="text-xl font-semibold text-[#4B2E1E] mb-3">1. Créer un compte</h3>
                            <ol class="list-decimal list-inside space-y-2 text-gray-700 pl-4">
                                <li>Cliquez sur "Se connecter" en haut à droite</li>
                                <li>Choisissez "Créer un compte"</li>
                                <li>Remplissez vos informations (nom, téléphone, email)</li>
                                <li>Choisissez un mot de passe sécurisé</li>
                                <li>Validez votre inscription</li>
                            </ol>
                        </div>

                        <!-- Commander -->
                        <div>
                            <h3 class="text-xl font-semibold text-[#4B2E1E] mb-3">2. Passer une commande</h3>
                            <ol class="list-decimal list-inside space-y-2 text-gray-700 pl-4">
                                <li>Parcourez les menus du jour disponibles</li>
                                <li>Utilisez les filtres (quartier, prix) pour affiner votre recherche</li>
                                <li>Cliquez sur un plat pour voir les détails</li>
                                <li>Ajoutez le plat à votre panier</li>
                                <li>Vérifiez votre panier et cliquez sur "Commander"</li>
                                <li>Choisissez le mode de récupération (livraison ou retrait)</li>
                                <li>Sélectionnez votre moyen de paiement</li>
                                <li>Confirmez votre commande</li>
                            </ol>
                        </div>

                        <!-- Suivi -->
                        <div>
                            <h3 class="text-xl font-semibold text-[#4B2E1E] mb-3">3. Suivre votre commande</h3>
                            <ul class="list-disc list-inside space-y-2 text-gray-700 pl-4">
                                <li>Cliquez sur "Mes commandes" dans le menu</li>
                                <li>Visualisez l'état de vos commandes en cours</li>
                                <li>Statuts disponibles: En préparation, Prête, En livraison, Livrée</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Paiements -->
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-[#47A547] mb-6 flex items-center">
                        <i class="pi pi-wallet mr-3"></i>
                        Moyens de Paiement
                    </h2>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-[#FDF6EC] p-4 rounded-lg">
                            <h3 class="font-semibold text-[#4B2E1E] mb-2 flex items-center">
                                <i class="pi pi-mobile mr-2 text-[#47A547]"></i>
                                Mobile Money
                            </h3>
                            <p class="text-gray-700 text-sm">Orange Money, Moov Money - Paiement instantané et sécurisé</p>
                        </div>
                        <div class="bg-[#FDF6EC] p-4 rounded-lg">
                            <h3 class="font-semibold text-[#4B2E1E] mb-2 flex items-center">
                                <i class="pi pi-credit-card mr-2 text-[#47A547]"></i>
                                Wave
                            </h3>
                            <p class="text-gray-700 text-sm">Paiement via Wave - Sans frais supplémentaires</p>
                        </div>
                        <div class="bg-[#FDF6EC] p-4 rounded-lg">
                            <h3 class="font-semibold text-[#4B2E1E] mb-2 flex items-center">
                                <i class="pi pi-money-bill mr-2 text-[#47A547]"></i>
                                Espèces (Livraison)
                            </h3>
                            <p class="text-gray-700 text-sm">Payez en espèces lors de la livraison</p>
                        </div>
                        <div class="bg-[#FDF6EC] p-4 rounded-lg">
                            <h3 class="font-semibold text-[#4B2E1E] mb-2 flex items-center">
                                <i class="pi pi-shopping-bag mr-2 text-[#47A547]"></i>
                                Espèces (Retrait)
                            </h3>
                            <p class="text-gray-700 text-sm">Payez en espèces lors du retrait</p>
                        </div>
                    </div>
                </div>

                <!-- Livraison -->
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-[#47A547] mb-6 flex items-center">
                        <i class="pi pi-truck mr-3"></i>
                        Livraison et Retrait
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-[#4B2E1E] mb-2">Livraison à domicile</h3>
                            <ul class="list-disc list-inside space-y-1 text-gray-700 pl-4">
                                <li>Disponible dans certains quartiers de Ouagadougou</li>
                                <li>Frais de livraison variables selon la distance</li>
                                <li>Délai moyen: 30-60 minutes</li>
                                <li>Suivi en temps réel de votre commande</li>
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-semibold text-[#4B2E1E] mb-2">Retrait sur place</h3>
                            <ul class="list-disc list-inside space-y-1 text-gray-700 pl-4">
                                <li>Récupérez votre commande directement chez la restauratrice</li>
                                <li>Pas de frais de livraison</li>
                                <li>Vous serez notifié quand votre commande est prête</li>
                                <li>Adresse fournie lors de la confirmation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Politiques -->
                <div class="bg-white rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-[#47A547] mb-6 flex items-center">
                        <i class="pi pi-shield mr-3"></i>
                        Politiques et Règlement
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-[#4B2E1E] mb-2">Annulation</h3>
                            <p class="text-gray-700">Les commandes peuvent être annulées gratuitement avant le début de la préparation. Une fois la préparation commencée, l'annulation n'est plus possible.</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-[#4B2E1E] mb-2">Remboursement</h3>
                            <p class="text-gray-700">En cas de problème avec votre commande (non-livraison, erreur), contactez notre support. Les remboursements sont traités sous 3-7 jours ouvrables.</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-[#4B2E1E] mb-2">Protection des données</h3>
                            <p class="text-gray-700">Vos données personnelles sont protégées conformément à la réglementation burkinabé en matière de protection des données. Elles ne sont jamais partagées avec des tiers sans votre consentement.</p>
                        </div>
                    </div>
                </div>

                <!-- Contact -->
                <div class="bg-gradient-to-r from-[#47A547] to-[#E6782C] text-white p-8 rounded-lg text-center">
                    <h2 class="text-2xl font-bold mb-4">Besoin d'aide supplémentaire?</h2>
                    <p class="mb-6">Notre équipe est disponible pour répondre à toutes vos questions</p>
                    <a href="/support" class="inline-block bg-white text-[#47A547] px-8 py-3 rounded-lg font-semibold hover:bg-[#FDF6EC] transition-colors">
                        Contacter le support
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Page centre d'aide
</script>
