// src/scripts/app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import {
  isServiceWorkerAvailable,
  isPushNotificationSupported,
} from '../utils';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    
    if (!pushNotificationTools) {
      console.warn('Push notification tools container not found');
      return;
    }

    // Check if push notifications are supported
    if (!isPushNotificationSupported()) {
      pushNotificationTools.innerHTML = `
        <div class="notification-not-supported">
          <p>Push notifications tidak didukung di browser ini.</p>
        </div>
      `;
      return;
    }

    console.log('Setting up push notification...');
    
    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      console.log('Is subscribed:', isSubscribed);

      if (isSubscribed) {
        console.log('Showing unsubscribe button...');
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        
        const unsubscribeButton = document.getElementById('unsubscribe-button');
        if (unsubscribeButton) {
          console.log('Adding event listener to unsubscribe button');
          
          unsubscribeButton.addEventListener('click', async () => {
            console.log('=== UNSUBSCRIBE BUTTON CLICKED ===');
            
            try {
              // Show loading state
              unsubscribeButton.innerHTML = `
                <span class="btn-text">Sedang Memproses...</span>
                <div class="loading-spinner"></div>
              `;
              unsubscribeButton.disabled = true;
              
              // PENTING: Call unsubscribe function
              console.log('About to call unsubscribe() function...');
              await unsubscribe();
              console.log('Unsubscribe function completed successfully');
              
            } catch (error) {
              console.error('Error during unsubscription:', error);
              
              // Reset button on error
              unsubscribeButton.innerHTML = `
                <span class="btn-text">Berhenti Berlangganan</span>
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              `;
              unsubscribeButton.disabled = false;
              
              alert('Terjadi kesalahan saat berhenti berlangganan. Silakan coba lagi.');
            } finally {
              // Always refresh the push notification setup after unsubscribe attempt
              console.log('Refreshing push notification setup after unsubscribe...');
              setTimeout(async () => {
                await this.#setupPushNotification();
              }, 1000);
            }
          });
        }
        
        return;
      }

      console.log('Showing subscribe button...');
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      
      const subscribeButton = document.getElementById('subscribe-button');
      if (subscribeButton) {
        subscribeButton.addEventListener('click', async () => {
          try {
            console.log('Subscribe button clicked');
            
            // Show loading state
            subscribeButton.innerHTML = `
              <span class="btn-text">Sedang Memproses...</span>
              <div class="loading-spinner"></div>
            `;
            subscribeButton.disabled = true;
            
            // Call the subscribe function
            await subscribe();
            
          } catch (error) {
            console.error('Error during subscription:', error);
            alert('Terjadi kesalahan saat berlangganan notifikasi. Silakan coba lagi.');
          } finally {
            // Always refresh the push notification setup
            console.log('Refreshing push notification setup after subscribe...');
            setTimeout(async () => {
              await this.#setupPushNotification();
            }, 1000);
          }
        });
      }
    } catch (error) {
      console.error('Error in setupPushNotification:', error);
      pushNotificationTools.innerHTML = `
        <div class="notification-not-supported">
          <p>Terjadi kesalahan saat menyiapkan notifikasi.</p>
        </div>
      `;
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<p>Halaman tidak ditemukan</p>';
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        
        // Setup push notification after page render
        if (isServiceWorkerAvailable()) {
          await this.#setupPushNotification();
        }
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      
      // Setup push notification after page render
      if (isServiceWorkerAvailable()) {
        await this.#setupPushNotification();
      }
    }
  }
}

export default App;