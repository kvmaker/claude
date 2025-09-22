class AudioPlayer {
    constructor() {
        this.audioElement = document.getElementById('audioElement');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playlistElement = document.getElementById('playlist');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        
        this.playlist = [];
        this.currentTrackIndex = -1;
        this.displayedItems = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadPlaylist();
        this.setupEventListeners();
        this.renderPlaylist();
    }
    
    async loadPlaylist() {
        try {
            const response = await fetch('audio.txt');
            const text = await response.text();
            const lines = text.trim().split('\n');
            
            this.playlist = lines.map(line => {
                const [name, url, timestamp] = line.split('｜');
                return {
                    name: name.trim(),
                    url: url.trim(),
                    timestamp: new Date(timestamp.trim())
                };
            }).sort((a, b) => b.timestamp - a.timestamp);
            
        } catch (error) {
            console.error('加载播放列表失败:', error);
            this.playlist = [];
        }
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.loadMoreBtn.addEventListener('click', () => this.loadMoreItems());
        
        this.audioElement.addEventListener('play', () => {
            this.playPauseBtn.textContent = '暂停';
            this.playPauseBtn.classList.add('pause');
        });
        
        this.audioElement.addEventListener('pause', () => {
            this.playPauseBtn.textContent = '播放';
            this.playPauseBtn.classList.remove('pause');
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.playNext();
        });
    }
    
    renderPlaylist() {
        this.playlistElement.innerHTML = '';
        const itemsToShow = Math.min(this.displayedItems + 5, this.playlist.length);
        
        for (let i = 0; i < itemsToShow; i++) {
            const item = this.playlist[i];
            const itemElement = document.createElement('div');
            itemElement.className = 'playlist-item';
            if (i === this.currentTrackIndex) {
                itemElement.classList.add('playing');
            }
            
            itemElement.innerHTML = `
                <span class="audio-name">${item.name}</span>
                <span class="audio-time">${this.formatDate(item.timestamp)}</span>
            `;
            
            itemElement.addEventListener('click', () => this.playTrack(i));
            this.playlistElement.appendChild(itemElement);
        }
        
        this.displayedItems = itemsToShow;
        this.updateLoadMoreButton();
    }
    
    loadMoreItems() {
        this.renderPlaylist();
    }
    
    updateLoadMoreButton() {
        if (this.displayedItems >= this.playlist.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
        }
    }
    
    playTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audioElement.src = track.url;
        this.audioElement.play().catch(error => {
            console.error('播放失败:', error);
        });
        
        this.updatePlaylistUI();
    }
    
    togglePlayPause() {
        if (this.audioElement.paused) {
            if (this.currentTrackIndex === -1 && this.playlist.length > 0) {
                this.playTrack(0);
            } else {
                this.audioElement.play();
            }
        } else {
            this.audioElement.pause();
        }
    }
    
    playNext() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.playTrack(this.currentTrackIndex + 1);
        }
    }
    
    updatePlaylistUI() {
        const items = this.playlistElement.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            item.classList.remove('playing');
            if (index === this.currentTrackIndex) {
                item.classList.add('playing');
            }
        });
    }
    
    formatDate(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});