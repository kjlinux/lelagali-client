<template>
    <footer class="bg-[#4B2E1E] text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- Logo et description -->
                <div class="col-span-1 md:col-span-2">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="w-10 h-10 bg-[#47A547] rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-lg">L</span>
                        </div>
                        <h3 class="text-2xl font-bold">LeLagaLi</h3>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">Votre plateforme de référence pour découvrir et commander les meilleurs plats traditionnels ivoiriens, préparés avec amour par nos restauratrices locales.</p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-facebook text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-instagram text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-twitter text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-whatsapp text-xl"></i>
                        </a>
                    </div>
                </div>

                <!-- Liens rapides -->
                <div>
                    <h4 class="text-lg font-semibold mb-4 text-[#F8C346]">Liens rapides</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Accueil</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Menus du jour</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Nos restauratrices</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">À propos</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

                <!-- Support -->
                <div>
                    <h4 class="text-lg font-semibold mb-4 text-[#F8C346]">Support</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Centre d'aide</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Conditions générales</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Politique de livraison</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Politique de remboursement</a></li>
                    </ul>
                </div>
            </div>

            <!-- Contact info -->
            <div class="border-t border-gray-600 mt-8 pt-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="flex items-center space-x-3">
                        <i class="pi pi-phone text-[#E6782C]"></i>
                        <span class="text-gray-300">+226 07 XX XX XX XX</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <i class="pi pi-envelope text-[#E6782C]"></i>
                        <span class="text-gray-300">contact@lelagali.com</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <i class="pi pi-map-marker text-[#E6782C]"></i>
                        <span class="text-gray-300">Abidjan, Côte d'Ivoire</span>
                    </div>
                </div>
            </div>

            <!-- Copyright -->
            <div class="border-t border-gray-600 mt-8 pt-6 text-center">
                <p class="text-gray-300">
                    © {{ new Date().getFullYear() }} LeLagaLi. Tous droits réservés.
                    <span class="text-[#F8C346]">Fait avec ❤️ By Tanga Group</span>
                </p>
            </div>
        </div>
    </footer>
</template>
