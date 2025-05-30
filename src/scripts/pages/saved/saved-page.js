import SavedPresenter from './saved-presenter.js';

export default class SavedPage {
#presenter;

async render() {
    return `
    <section class="container stories">
        <div class="stories__header">
        <h1 class="stories__title">Cerita Tersimpan</h1>
        </div>
        <div id="saved-stories-list" class="stories__list">
        <div class="loader"></div>
        </div>
    </section>
    `;
}

async afterRender() {
    this.#presenter = new SavedPresenter({
    view: this,
    });

    await this.#presenter.loadSavedStories();
}

formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
    });
}

truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

showSavedStories(stories) {
    const container = document.getElementById('saved-stories-list');
    container.innerHTML = '';

    if (stories.length === 0) {
    container.innerHTML = '<p>Belum ada cerita yang disimpan</p>';
    return;
    }

    stories.forEach((story) => {
    const formattedDate = this.formatDate(story.createdAt);
    const truncatedDescription = this.truncateText(story.description, 100);

    container.innerHTML += `
        <article class="story-item">
        <div class="story-item__thumbnail">
            <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-item__image">
        </div>
        <div class="story-item__content">
            <h2 class="story-item__title">${story.name}</h2>
            <p class="story-item__date">${formattedDate}</p>
            <p class="story-item__description">${truncatedDescription}</p>
            <a href="#/detail/${story.id}" class="story-item__button">Baca Selengkapnya</a>
        </div>
        </article>
    `;
    });
}

showError(message) {
    const container = document.getElementById('saved-stories-list');
    container.innerHTML = `<p>${message}</p>`;
}

logError(error) {
    console.error(error);
}
}
