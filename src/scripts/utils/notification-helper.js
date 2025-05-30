import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
return 'Notification' in window;
}

export function isNotificationGranted() {
return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
}

if (isNotificationGranted()) {
    return true;
}

const status = await Notification.requestPermission();

if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
}

if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
}

return true;
}

export async function getPushSubscription() {
try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
    return null;
    }
    
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
} catch (error) {
    return null;
}
}

export async function isCurrentPushSubscriptionAvailable() {
const subscription = await getPushSubscription();
const isAvailable = !!subscription;
return isAvailable;
}

export function generateSubscribeOptions() {
return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
};
}

export async function subscribe() {
const successSubscribeMessage = 'Berhasil berlangganan push notification!';
const failureSubscribeMessage = 'Gagal berlangganan push notification. Silakan coba lagi.';

if (!(await requestNotificationPermission())) {
    console.log('Permission not granted, aborting subscribe');
    return;
}

if (await isCurrentPushSubscriptionAvailable()) {
    console.log('Already subscribed, aborting');
    alert('Sudah berlangganan push notification.');
    return;
}

let pushSubscription;

try {
    const registration = await navigator.serviceWorker.getRegistration();
    console.log('Service worker registration:', registration);
    
    if (!registration) {
    console.error('No service worker registration found');
    alert('Service Worker belum terdaftar. Silakan refresh halaman dan coba lagi.');
    return;
    }
    
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
    alert(failureSubscribeMessage + ' (API Error)');

    await pushSubscription.unsubscribe();

    return;
    }

    alert(successSubscribeMessage);
} catch (error) {
    alert(failureSubscribeMessage + ' (Error: ' + error.message + ')');
}
}

export async function unsubscribe() {
const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

try {
    const pushSubscription = await getPushSubscription();
    
    if (!pushSubscription) {
    alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
    return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log('Subscription details:', { endpoint: endpoint.substring(0, 50) + '...', keys });
    
    console.log('Step 1: Unsubscribing from API...');
    const response = await unsubscribePushNotification({ endpoint });
    console.log('API unsubscribe response:', response);
    
    if (!response.ok) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: API response not ok:', response);
    return;
    }
    
    console.log('Step 2: Unsubscribing from push manager...');
    
    const unsubscribed = await pushSubscription.unsubscribe();
    console.log('Push manager unsubscribe result:', unsubscribed);
    
    if (!unsubscribed) {
    console.error('Failed to unsubscribe from push manager, rolling back API subscription...');
    alert(failureUnsubscribeMessage);
    
    try {
        await subscribePushNotification({ endpoint, keys });
        console.log('Rollback completed');
    } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
    }
    return;
    }
    
    console.log('Step 3: Verifying unsubscription...');
    const verifySubscription = await getPushSubscription();
    console.log('Verification - subscription after unsubscribe:', verifySubscription);
    
    if (verifySubscription) {
    console.error('Unsubscribe verification failed - subscription still exists');
    alert(failureUnsubscribeMessage);
    return;
    }
    
    console.log('=== UNSUBSCRIBE SUCCESSFUL ===');
    alert(successUnsubscribeMessage);
    
} catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
}
}