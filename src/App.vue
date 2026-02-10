<script setup>
// App.vue - Composant racine qui contient le router-view
</script>

<template>
    <router-view />
</template>

<style>
/* Styles globaux pour respecter la charte graphique */
:root {
    --lelagali-green: #47a547;
    --lelagali-orange: #e6782c;
    --lelagali-beige: #fdf6ec;
    --lelagali-brown: #4b2e1e;
    --lelagali-yellow: #f8c346;
}

.p-button-success {
    background-color: var(--lelagali-green) !important;
    border-color: var(--lelagali-green) !important;
}

.p-button-warning {
    background-color: var(--lelagali-orange) !important;
    border-color: var(--lelagali-orange) !important;
}

.p-toast .p-toast-message {
    margin: 0 0 1rem 0;
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.p-toast .p-toast-message.p-toast-message-success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-left: 4px solid #10b981;
    color: #065f46;
}

.p-toast .p-toast-message.p-toast-message-success .p-toast-message-icon,
.p-toast .p-toast-message.p-toast-message-success .p-toast-icon-close {
    color: #059669;
}

.p-toast .p-toast-message.p-toast-message-info {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-left: 4px solid #3b82f6;
    color: #1e40af;
}

.p-toast .p-toast-message.p-toast-message-info .p-toast-message-icon,
.p-toast .p-toast-message.p-toast-message-info .p-toast-icon-close {
    color: #2563eb;
}

.p-toast .p-toast-message.p-toast-message-warn {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-left: 4px solid #f59e0b;
    color: #92400e;
}

.p-toast .p-toast-message.p-toast-message-warn .p-toast-message-icon,
.p-toast .p-toast-message.p-toast-message-warn .p-toast-icon-close {
    color: #d97706;
}

.p-toast .p-toast-message.p-toast-message-error {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-left: 4px solid #ef4444;
    color: #991b1b;
}

.p-toast .p-toast-message.p-toast-message-error .p-toast-message-icon,
.p-toast .p-toast-message.p-toast-message-error .p-toast-icon-close {
    color: #dc2626;
}

.p-toast .p-toast-message .p-toast-summary {
    font-weight: 600;
    font-size: 0.95rem;
}

.p-toast .p-toast-message .p-toast-detail {
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

/* Personnalisation du Paginator */
.p-paginator {
    background: white;
    color: var(--lelagali-brown);
    border: 1px solid #e5e7eb;
}

.p-paginator .p-paginator-pages .p-paginator-page {
    color: var(--lelagali-brown);
    border: 1px solid transparent;
    min-width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.25rem;
    border-radius: 0.5rem;
}

.p-paginator .p-paginator-pages .p-paginator-page:hover {
    background-color: var(--lelagali-beige);
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
    background-color: var(--lelagali-green);
    color: white;
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-first,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-last {
    color: var(--lelagali-brown);
    border: 1px solid #e5e7eb;
    min-width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.25rem;
    border-radius: 0.5rem;
}

.p-paginator .p-paginator-first:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover,
.p-paginator .p-paginator-last:hover {
    background-color: var(--lelagali-beige);
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-current {
    color: var(--lelagali-brown);
    font-weight: 600;
}

:root {
    --lelagali-green: #47a547;
    --lelagali-green-50: #f2f8f2;
    --lelagali-green-100: #e4f2e4;
    --lelagali-green-200: #c9e4c9;
    --lelagali-green-300: #aed7ae;
    --lelagali-green-400: #93c993;
    --lelagali-green-500: #47a547;
    --lelagali-green-600: #3a843a;
    --lelagali-green-700: #2d632d;
    --lelagali-green-800: #204220;
    --lelagali-green-900: #132113;
    --lelagali-green-950: #060f06;
}

.p-button-success {
    background-color: var(--lelagali-green) !important;
    border-color: var(--lelagali-green) !important;
}

.p-button-success:hover {
    background-color: var(--lelagali-green-600) !important;
    border-color: var(--lelagali-green-600) !important;
}

.text-lelagali-green {
    color: var(--lelagali-green);
}

.bg-lelagali-green {
    background-color: var(--lelagali-green);
}

.border-lelagali-green {
    border-color: var(--lelagali-green);
}
</style>
