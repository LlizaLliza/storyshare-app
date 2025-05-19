export default class AboutPage {
  async render() {
    return `
      <section class="container about">
        <h1 class="about__title">Tentang StoryApp</h1>
        <div class="about__content">
          <p>StoryApp adalah aplikasi berbagi cerita yang memungkinkan pengguna untuk berbagi pengalaman mereka dengan dunia. Aplikasi ini dibuat sebagai submission untuk kelas Dicoding (Belajar Pengembangan Web Intermediate).</p>
          
          <div class="about__features">
            <h2>Fitur Utama:</h2>
            <ul>
              <li>Berbagi cerita dengan gambar</li>
              <li>Menunjukkan lokasi cerita melalui peta digital</li>
              <li>Mengambil foto dengan kamera</li>
            </ul>
          </div>
          
          <div class="about__tech">
            <h2>Teknologi yang Digunakan:</h2>
            <ul>
              <li>Single Page Application (SPA) dengan JavaScript murni</li>
              <li>Webpack sebagai module bundler</li>
              <li>Leaflet untuk peta digital</li>
              <li>Web API (Camera, Geolocation)</li>
              <li>REST API untuk manajemen data</li>
            </ul>
          </div>
          
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}