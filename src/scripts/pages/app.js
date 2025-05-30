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

    if (!isPushNotificationSupported()) {
      pushNotificationTools.innerHTML = `
        <div class="notification-not-supported">
          <p>Push notifications tidak didukung di browser ini.</p>
        </div>
      `;
      return;
    }
    
    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      if (isSubscribed) {
        pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
        
        const unsubscribeButton = document.getElementById('unsubscribe-button');
        if (unsubscribeButton) {
          
          unsubscribeButton.addEventListener('click', async () => {
            
            try {
              unsubscribeButton.innerHTML = `
                <span class="btn-text">Sedang Memproses...</span>
                <div class="loading-spinner"></div>
              `;
              unsubscribeButton.disabled = true;
              
              await unsubscribe();
              
            } catch (error) {
              
              unsubscribeButton.innerHTML = `
                <span class="btn-text">Berhenti Berlangganan</span>
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              `;
              unsubscribeButton.disabled = false;
              
              alert('Terjadi kesalahan saat berhenti berlangganan. Silakan coba lagi.');
            } finally {
              setTimeout(async () => {
                await this.#setupPushNotification();
              }, 1000);
            }
          });
        }
        
        return;
      }

      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      
      const subscribeButton = document.getElementById('subscribe-button');
      if (subscribeButton) {
        subscribeButton.addEventListener('click', async () => {
          try {
            
            subscribeButton.innerHTML = `
              <span class="btn-text">Sedang Memproses...</span>
              <div class="loading-spinner"></div>
            `;
            subscribeButton.disabled = true;
            
            await subscribe();
            
          } catch (error) {
            console.error('Error during subscription:', error);
            alert('Terjadi kesalahan saat berlangganan notifikasi. Silakan coba lagi.');
          } finally {
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
        
        if (isServiceWorkerAvailable()) {
          await this.#setupPushNotification();
        }
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      
      if (isServiceWorkerAvailable()) {
        await this.#setupPushNotification();
      }
    }
  }
}

export default App;