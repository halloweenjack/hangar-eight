// Instagram Graph API クライアント（instagram-gallery.vercel.app経由）
class InstagramFeed {
  constructor(config) {
    this.containerId = config.containerId || 'instafeed';
    this.limit = config.limit || 6;
    this.account = config.account || 'hangar_eight';
    this.fallbackImages = config.fallbackImages || [];
    this.apiBase = 'https://instagram-gallery.vercel.app/api/instagram';
  }

  async fetchFeed() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const response = await fetch(`${this.apiBase}?account=${this.account}&limit=${this.limit}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const items = await response.json();

      if (!Array.isArray(items) || items.length === 0) {
        this.showFallback();
        return;
      }

      this.render(items.slice(0, this.limit));
    } catch (error) {
      console.error('Instagram feed error:', error);
      this.showFallback();
    }
  }

  render(items) {
    const container = document.getElementById(this.containerId);
    container.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card fade-in-element';

      const mediaUrl = item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url;
      const caption = item.caption || '';
      const date = new Date(item.timestamp).toLocaleString('ja-JP', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      card.innerHTML = `
        <span class="photo">
          <a href="${item.permalink}" target="_blank" rel="noopener noreferrer">
            <img src="${mediaUrl}" alt="${this.escapeHtml(caption.substring(0, 100))}" loading="lazy">
          </a>
        </span>
        <p class="date">${date}</p>
        <p class="text">${this.escapeHtml(caption)}</p>
      `;

      container.appendChild(card);
    });

    this.applyAnimations();
  }

  showFallback() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.fallbackImages.length > 0) {
      container.innerHTML = '';
      this.fallbackImages.slice(0, this.limit).forEach(image => {
        const card = document.createElement('div');
        card.className = 'card fade-in-element';
        card.innerHTML = `
          <span class="photo">
            <a href="${image.link || 'https://www.instagram.com/hangar_eight/'}" target="_blank" rel="noopener noreferrer">
              <img src="${image.src}" alt="${this.escapeHtml(image.caption)}">
            </a>
          </span>
          <p class="date">${image.date}</p>
          <p class="text">${this.escapeHtml(image.caption)}</p>
        `;
        container.appendChild(card);
      });
      this.applyAnimations();
    } else {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#666;">
          <p>Instagramの投稿を読み込めませんでした</p>
          <p><a href="https://www.instagram.com/hangar_eight/" target="_blank" style="color:#E4405F;">Instagramで直接ご覧ください</a></p>
        </div>
      `;
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  applyAnimations() {
    if (typeof initializeVisibilityHandlers === 'function') {
      initializeVisibilityHandlers();
    }
  }
}

// フォールバック用の静的画像データ
const fallbackInstagramImages = [
  { src: 'img/service_01.jpg', caption: '大山食堂"心"のランチ', date: '', link: 'https://www.instagram.com/hangar_eight/' },
  { src: 'img/service_02.jpg', caption: 'Bagdad cafeでのひととき', date: '', link: 'https://www.instagram.com/hangar_eight/' },
  { src: 'img/service_03.jpg', caption: 'Espace Hangarでのイベント', date: '', link: 'https://www.instagram.com/hangar_eight/' },
  { src: 'img/service_04.jpg', caption: 'Automobile club de Monaca', date: '', link: 'https://www.instagram.com/hangar_eight/' },
  { src: 'img/service_05.jpg', caption: 'Casa do Desafinadoの音楽イベント', date: '', link: 'https://www.instagram.com/hangar_eight/' },
  { src: 'img/service_06.jpg', caption: 'Studio Kougai笄スタジオ', date: '', link: 'https://www.instagram.com/hangar_eight/' }
];
