<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goTo = (route) => {
    router.push(route);
};
</script>

<template>
    <footer class="bg-[#4B2E1E] text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Logo et description -->
                <div class="md:col-span-1">
                    <div class="flex items-center space-x-3 mb-4">
                        <img src="/pic.jpg" alt="Logo LeLagaLi" class="w-12 h-12 object-cover rounded-full" />
                        <h3 class="text-2xl font-bold">LeLagaLi</h3>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">Votre plateforme de référence pour découvrir et commander les meilleurs plats traditionnels burkinabés, préparés avec amour par nos restauratrices locales.</p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-facebook text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-instagram text-xl"></i>
                        </a>
                        <a href="https://wa.me/22607000000" class="text-gray-300 hover:text-[#F8C346] transition-colors">
                            <i class="pi pi-whatsapp text-xl"></i>
                        </a>
                    </div>
                </div>

                <!-- Liens rapides -->
                <div>
                    <h4 class="text-lg font-semibold mb-4 text-[#F8C346]">Liens rapides</h4>
                    <ul class="space-y-2">
                        <li><a @click.prevent="goTo('/')" href="/" class="text-gray-300 hover:text-white transition-colors cursor-pointer">Accueil</a></li>
                        <li><a @click.prevent="goTo('/a-propos')" href="/a-propos" class="text-gray-300 hover:text-white transition-colors cursor-pointer">À propos</a></li>
                        <li><a @click.prevent="goTo('/support')" href="/support" class="text-gray-300 hover:text-white transition-colors cursor-pointer">Support</a></li>
                        <li><a @click.prevent="goTo('/centre-aide')" href="/centre-aide" class="text-gray-300 hover:text-white transition-colors cursor-pointer">Centre d'aide</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div>
                    <h4 class="text-lg font-semibold mb-4 text-[#F8C346]">Contact</h4>
                    <ul class="space-y-3">
                        <li class="flex items-start space-x-3">
                            <i class="pi pi-phone text-[#E6782C] mt-1"></i>
                            <span class="text-gray-300">070 00 00 01</span>
                        </li>
                        <li class="flex items-start space-x-3">
                            <i class="pi pi-envelope text-[#E6782C] mt-1"></i>
                            <span class="text-gray-300">contact@lelagali.bf</span>
                        </li>
                        <li class="flex items-start space-x-3">
                            <i class="pi pi-map-marker text-[#E6782C] mt-1"></i>
                            <span class="text-gray-300">Ouagadougou, Burkina Faso</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Copyright -->
            <div class="border-t border-gray-600 mt-8 pt-6 text-center">
                <p class="text-gray-300">
                    © {{ new Date().getFullYear() }} LeLagaLi. Tous droits réservés.
                    <span class="text-[#F8C346]">Fait avec ❤️ au Burkina Faso</span>
                </p>
            </div>
        </div>
    </footer>
</template>
