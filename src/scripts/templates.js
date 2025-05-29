// src/scripts/templates.js

const generateSubscribeButtonTemplate = () => {
    return `
    <div class="push-notification-container">
        <div class="notification-card">
        <div class="notification-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
            </svg>
        </div>
        <div class="notification-content">
            <h3>Dapatkan Notifikasi</h3>
            <p>Aktifkan notifikasi untuk mendapatkan update terbaru dari aplikasi Story App.</p>
        </div>
        <button id="subscribe-button" class="subscribe-btn">
            <span class="btn-text">Aktifkan Notifikasi</span>
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
            </svg>
        </button>
        </div>
    </div>
    `;
};

const generateUnsubscribeButtonTemplate = () => {
    return `
    <div class="push-notification-container">
        <div class="notification-card notification-subscribed">
        <div class="notification-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
            </svg>
        </div>
        <div class="notification-content">
            <h3>Notifikasi Aktif</h3>
            <p>Anda sudah berlangganan push notification.</p>
        </div>
        <button id="unsubscribe-button" class="unsubscribe-btn">
            <span class="btn-text">Berhenti Berlangganan</span>
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
        </button>
        </div>
    </div>
    `;
};

export {
    generateSubscribeButtonTemplate,
    generateUnsubscribeButtonTemplate,
};