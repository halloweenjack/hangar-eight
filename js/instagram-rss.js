// Instagram RSS Feed implementation using RSS-Bridge and rss-parser
class InstagramRSSFeed {
  constructor(config) {
    this.username = config.username || 'hjd909';
    this.containerId = config.containerId || 'instafeed';
    // より多くの投稿を取得（複数ソース活用）
    this.limit = config.limit || 12;
    this.corsProxy = config.corsProxy || 'https://api.allorigins.win/raw?url=';
    this.rssBridge = config.rssBridge || 'https://rss-bridge.org/bridge01/';
    this.fallbackImages = config.fallbackImages || [];
    this.retryCount = 0;
    this.maxRetries = 2;
  }

  // Instagram RSS取得方法を最適化（hjd909用）
  generateInstagramUrls() {
    // hjd909専用の複数RSS-Bridgeサービス
    return [
      // 最新のRSS-Bridgeサービス（hjd909アカウント用）
      `${this.corsProxy}${encodeURIComponent(`https://rss-bridge.github.io/rss-bridge/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Atom`)}`,
      `${this.corsProxy}${encodeURIComponent(`https://bridge.suumitsu.eu/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Atom`)}`,
      `${this.corsProxy}${encodeURIComponent(`https://rssbridge.flossboxin.org.in/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Atom`)}`,
      `${this.corsProxy}${encodeURIComponent(`https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Atom`)}`,
      // 代替プロキシサービス
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Atom`)}`,
      // 追加のRSSソース（より多くの投稿を取得）
      `${this.corsProxy}${encodeURIComponent(`https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&context=Username&u=${this.username}&format=Json`)}`
    ];
  }

  // RSS-BridgeでInstagram RSSフィードのURLを生成（互換性のため残す）
  generateRSSUrl() {
    return this.generateInstagramUrls()[1]; // RSS-Bridgeのメインサービス
  }

  // 代替RSS-Bridgeサービスを試行
  getAlternativeRSSUrls() {
    return this.generateInstagramUrls().slice(1); // JSON API以外のすべて
  }

  // Instagramフィードを取得
  async fetchFeed() {
    this.showLoader();
    
    try {
      console.log(`Fetching Instagram data for: ${this.username}`);
      
      // 複数のInstagram取得方法を試行
      let feedData = null;
      const urls = this.generateInstagramUrls();
      
      for (const url of urls) {
        console.log(`Trying URL: ${url}`);
        
        if (url.includes('__a=1') || url.includes('web_profile_info')) {
          // Instagram JSON APIを試行
          feedData = await this.tryFetchInstagramJSON(url);
        } else {
          // RSS-Bridgeを試行
          feedData = await this.tryFetchRSS(url);
        }
        
        if (feedData && feedData.items && feedData.items.length > 0) {
          console.log(`Success with ${feedData.items.length} items`);
          break;
        }
      }

      if (feedData && feedData.items && feedData.items.length > 0) {
        // 画像とコメントの両方が有効な投稿のみフィルタリング
        this.filterAndRenderValidPosts(feedData.items);
      } else {
        console.log('No Instagram data found, using fallback');
        this.showFallback();
      }
    } catch (error) {
      console.error('Instagram Feed Error:', error);
      this.showFallback();
    }
  }

  // Instagram JSON APIを試行
  async tryFetchInstagramJSON(url) {
    try {
      console.log(`Trying Instagram JSON API: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonText = await response.text();
      console.log('Instagram JSON received, length:', jsonText.length);
      return this.parseInstagramJSON(jsonText);
    } catch (error) {
      console.warn(`Instagram JSON fetch failed:`, error.message);
      return null;
    }
  }

  // 個別のRSS取得を試行
  async tryFetchRSS(url) {
    try {
      console.log(`Trying RSS URL: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      console.log('RSS XML received, length:', xmlText.length);
      return this.parseRSSXML(xmlText);
    } catch (error) {
      console.warn(`RSS fetch failed:`, error.message);
      return null;
    }
  }

  // Instagram JSONデータをパース
  parseInstagramJSON(jsonText) {
    try {
      console.log('Parsing Instagram JSON...');
      const data = JSON.parse(jsonText);
      const items = [];

      // Instagram APIの異なる構造に対応
      let posts = null;
      
      if (data.graphql && data.graphql.user && data.graphql.user.edge_owner_to_timeline_media) {
        // __a=1 APIの構造
        posts = data.graphql.user.edge_owner_to_timeline_media.edges;
      } else if (data.data && data.data.user && data.data.user.edge_owner_to_timeline_media) {
        // web_profile_info APIの構造
        posts = data.data.user.edge_owner_to_timeline_media.edges;
      }

      if (posts && posts.length > 0) {
        posts.forEach((post, index) => {
          const node = post.node;
          const caption = node.edge_media_to_caption.edges[0]?.node.text || `Hangar Eight - Post ${index + 1}`;
          const item = {
            title: caption,
            link: `https://www.instagram.com/p/${node.shortcode}/`,
            pubDate: new Date(node.taken_at_timestamp * 1000).toISOString(),
            content: caption,
            imageUrl: node.display_url,
            description: this.extractDescription(caption)
          };
          items.push(item);
          console.log(`Post ${index + 1}: ${node.shortcode}, Caption: ${caption.substring(0, 50)}...`);
        });

        console.log(`Parsed ${items.length} Instagram posts`);
        return { items };
      }

      console.log('No posts found in Instagram JSON');
      return null;
    } catch (error) {
      console.error('Instagram JSON parsing error:', error);
      return null;
    }
  }

  // XMLからRSSデータをパース
  parseRSSXML(xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Atomフィード（RSS-Bridgeの出力）をパース
      const entries = xmlDoc.querySelectorAll('entry');
      const items = [];

      entries.forEach((entry, index) => {
        const title = entry.querySelector('title')?.textContent || '';
        const link = entry.querySelector('link')?.getAttribute('href') || '';
        const published = entry.querySelector('published')?.textContent || '';
        const content = entry.querySelector('content')?.textContent || '';
        
        // 画像URLを抽出
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        if (imageUrl || title) {
          const pubDate = new Date(published);
          const item = {
            title: title,
            link: link,
            pubDate: published,
            content: content,
            imageUrl: imageUrl,
            description: this.extractDescription(content)
          };
          items.push(item);
          
          // 投稿の詳細ログ
          console.log(`RSS Post ${index + 1}:`);
          console.log(`  Date: ${pubDate.toLocaleDateString('ja-JP')} ${pubDate.toLocaleTimeString('ja-JP')}`);
          console.log(`  Title: ${title.substring(0, 50)}...`);
          console.log(`  Link: ${link}`);
        }
      });

      return { items };
    } catch (error) {
      console.error('RSS parsing error:', error);
      return null;
    }
  }

  // コンテンツから説明文を抽出
  extractDescription(content) {
    // HTMLタグを除去してテキストのみ抽出
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // 最初の100文字程度を返す
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  }

  // 画像とコメントの両方が有効な投稿をフィルタリングして表示
  async filterAndRenderValidPosts(allItems) {
    console.log(`Filtering ${allItems.length} posts for valid image and content...`);
    const validPosts = [];
    
    for (let i = 0; i < allItems.length && validPosts.length < this.limit; i++) {
      const item = allItems[i];
      
      // コメント/テキストの有効性チェック
      const hasValidContent = item.title && item.title.trim().length > 0 && 
                             item.description && item.description.trim().length > 0;
      
      if (hasValidContent && item.imageUrl) {
        // 画像の取得可否をチェック
        const imageAccessible = await this.checkImageAccess(item.imageUrl);
        
        if (imageAccessible) {
          console.log(`✓ Post ${i + 1}: Valid content and accessible image`);
          validPosts.push(item);
        } else {
          console.log(`✗ Post ${i + 1}: Content valid but image inaccessible`);
        }
      } else {
        console.log(`✗ Post ${i + 1}: Invalid content or missing image URL`);
      }
    }
    
    if (validPosts.length > 0) {
      console.log(`Found ${validPosts.length} valid posts, rendering...`);
      this.renderFeed(validPosts);
    } else {
      console.log('No valid posts found, showing fallback');
      this.showFallback();
    }
  }

  // 画像のアクセス可否をチェック
  async checkImageAccess(imageUrl) {
    if (!imageUrl || !imageUrl.includes('instagram.com')) {
      return false;
    }
    
    try {
      // プロキシサービス経由で画像アクセスをテスト
      const proxies = [
        'https://images.weserv.nl/?url=',
        'https://wsrv.nl/?url='
      ];
      
      for (const proxy of proxies) {
        try {
          const testUrl = proxy + encodeURIComponent(imageUrl);
          const response = await fetch(testUrl, { 
            method: 'HEAD',
            timeout: 3000 
          });
          
          if (response.ok && response.status === 200) {
            console.log(`  Image accessible via ${proxy}`);
            return true;
          }
        } catch (e) {
          // 次のプロキシを試行
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.log(`  Image access check failed: ${error.message}`);
      return false;
    }
  }

  // フィードをレンダリング
  renderFeed(items) {
    const container = document.getElementById(this.containerId);
    container.innerHTML = '';

    items.forEach((item, index) => {
      const card = this.createFeedCard(item, index);
      container.appendChild(card);
    });

    this.hideLoader();
    this.applyAnimations();
  }

  // 混合フィード（Instagram + フォールバック）をレンダリング
  renderMixedFeed(items) {
    const container = document.getElementById(this.containerId);
    container.innerHTML = '';

    items.forEach((item, index) => {
      const card = item.isFallback ? this.createStaticCard(item) : this.createFeedCard(item);
      container.appendChild(card);
    });

    this.hideLoader();
    this.applyAnimations();
  }

  // フォールバック項目を作成
  createFallbackItems(count, startIndex) {
    const fallbackItems = [];
    for (let i = 0; i < count; i++) {
      const fallbackIndex = (startIndex + i) % this.fallbackImages.length;
      const fallback = this.fallbackImages[fallbackIndex];
      fallbackItems.push({
        ...fallback,
        isFallback: true
      });
    }
    return fallbackItems;
  }

  // フィードカードを作成
  createFeedCard(item, index = 0) {
    const card = document.createElement('div');
    card.className = 'card';

    const pubDate = new Date(item.pubDate).toLocaleString('ja-JP', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Instagram画像のCORS問題を回避するため、コンテキストに応じたローカル画像を使用
    const proxiedImageUrl = this.getProxiedImageUrl(item.imageUrl, index, item);
    
    // フォールバック画像を投稿順に固定（1から8まで循環）
    const fallbackIndex = (index % 8) + 1;

    card.innerHTML = `
      <span class="photo">
        <a href="${item.link}" target="_blank">
          <img title="${item.description}" src="${proxiedImageUrl}" alt="${item.description}" loading="lazy">
        </a>
        <div class="icon"></div>
      </span>
      <p class="date">${pubDate}</p>
      <p class="text">${item.description}</p>
    `;

    return card;
  }

  // コメント内容に基づいて適切なローカル画像を選択
  getContextualImage(item, index) {
    const content = (item.title + ' ' + item.content + ' ' + item.description).toLowerCase();
    
    // キーワードに基づいて適切な画像を選択
    if (content.includes('lunch') || content.includes('ランチ') || content.includes('course')) {
      return 'img/service_01.jpg'; // 料理画像
    } else if (content.includes('cafe') || content.includes('カフェ') || content.includes('drink')) {
      return 'img/service_02.jpg'; // カフェ画像
    } else if (content.includes('event') || content.includes('イベント') || content.includes('meeting')) {
      return 'img/service_03.jpg'; // イベント画像
    } else if (content.includes('car') || content.includes('車') || content.includes('クルマ')) {
      return 'img/service_04.jpg'; // 車関連画像
    } else if (content.includes('music') || content.includes('音楽') || content.includes('live')) {
      return 'img/service_05.jpg'; // 音楽画像
    } else if (content.includes('studio') || content.includes('スタジオ') || content.includes('撮影')) {
      return 'img/service_06.jpg'; // スタジオ画像
    } else if (content.includes('camp') || content.includes('キャンプ')) {
      return 'img/service_07.jpg'; // キャンプ画像
    } else if (content.includes('garage') || content.includes('ガレージ') || content.includes('workshop')) {
      return 'img/service_08.jpg'; // ガレージ画像
    }
    
    // マッチしない場合は順番に割り当て
    return `img/service_0${(index % 8) + 1}.jpg`;
  }

  // Instagram画像をプロキシ経由で取得
  getProxiedImageUrl(originalUrl, index = 0, item = null) {
    if (originalUrl && (originalUrl.includes('cdninstagram.com') || originalUrl.includes('instagram.com'))) {
      // 動作確認済みのプロキシサービスを使用
      const proxies = [
        'https://images.weserv.nl/?url=',
        'https://wsrv.nl/?url='
      ];
      
      const proxyIndex = index % proxies.length;
      const selectedProxy = proxies[proxyIndex];
      
      return selectedProxy + encodeURIComponent(originalUrl);
    }
    return originalUrl || `img/service_0${(index % 8) + 1}.jpg`;
  }

  // ローダーを表示
  showLoader() {
    const container = document.getElementById(this.containerId);
    const loader = container.querySelector('.loader');
    if (loader) {
      loader.classList.add('active');
    }
  }

  // ローダーを非表示
  hideLoader() {
    const container = document.getElementById(this.containerId);
    const loader = container.querySelector('.loader');
    if (loader) {
      loader.classList.remove('active');
    }
  }

  // フォールバック表示（静的コンテンツ）
  showFallback() {
    const container = document.getElementById(this.containerId);
    
    if (this.fallbackImages.length > 0) {
      this.renderStaticImages();
    } else {
      container.innerHTML = `
        <div class="fallback-message">
          <p>Instagramの投稿を読み込めませんでした</p>
          <p><a href="https://www.instagram.com/hangar_eight/" target="_blank">Instagramで直接ご覧ください</a></p>
        </div>
      `;
    }
    
    this.hideLoader();
  }

  // 静的画像を表示
  renderStaticImages() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = '';

    this.fallbackImages.slice(0, this.limit).forEach(image => {
      const card = this.createStaticCard(image);
      container.appendChild(card);
    });

    this.applyAnimations();
  }

  // 静的カードを作成
  createStaticCard(image) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <span class="photo">
        <a href="${image.link || 'https://www.instagram.com/hangar_eight/'}" target="_blank">
          <img title="${image.caption}" src="${image.src}" alt="${image.caption}">
        </a>
        <div class="icon"></div>
      </span>
      <p class="date">${image.date}</p>
      <p class="text">${image.caption}</p>
    `;

    return card;
  }

  // アニメーションを適用
  applyAnimations() {
    const container = document.getElementById(this.containerId);
    container.querySelectorAll('.card').forEach(card => {
      card.classList.add('fade-in-element');
    });

    // 既存のvisibilityハンドラーを呼び出し
    if (typeof initializeVisibilityHandlers === 'function') {
      initializeVisibilityHandlers();
    }
  }

  // 再試行
  retry() {
    this.retryCount = 0;
    this.fetchFeed();
  }
}

// フォールバック用の静的画像データ
const fallbackInstagramImages = [
  {
    src: 'img/service_01.jpg',
    caption: 'Hangar Eightの最新の様子をお楽しみください',
    date: '2025年7月5日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_02.jpg',
    caption: 'Bagdad cafeでの一時をお過ごしください',
    date: '2025年7月4日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_03.jpg',
    caption: 'Espace Hangarでのイベントの様子',
    date: '2025年7月3日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_04.jpg',
    caption: 'Automobile club de Monacaの広大な敷地',
    date: '2025年7月2日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_05.jpg',
    caption: 'Casa do Desafinadoでの音楽イベント',
    date: '2025年7月1日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_06.jpg',
    caption: 'Studio Kougai笄スタジオでの撮影',
    date: '2025年6月30日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_07.jpg',
    caption: 'Camp davidでのキャンプ体験',
    date: '2025年6月29日',
    link: 'https://www.instagram.com/hangar_eight/'
  },
  {
    src: 'img/service_08.jpg',
    caption: 'atelier SiFoでの作業風景',
    date: '2025年6月28日',
    link: 'https://www.instagram.com/hangar_eight/'
  }
];

// スタイルを追加
const rssStyle = document.createElement('style');
rssStyle.textContent = `
  .fallback-message {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .fallback-message p {
    margin: 10px 0;
    font-size: 1.4rem;
  }

  .fallback-message a {
    color: #E4405F;
    text-decoration: none;
  }

  .fallback-message a:hover {
    text-decoration: underline;
  }

  .loader.active {
    display: block;
    width: 40px;
    height: 40px;
    margin: 40px auto;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #E4405F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(rssStyle);