
// 音乐播放器模块
class MusicPlayerManager {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.currentTrack = null;
        this.playlist = [];
        this.isPlaying = false;
    }
    
    init(playlist) {
        this.playlist = playlist;
        this.createAudioElement();
    }
    
    createAudioElement() {
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
        
        // 添加事件监听
        this.audioElement.addEventListener('ended', () => this.next());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
    }
    
    playTrack(track) {
        if (!track?.audio) {
            console.warn('音频文件未配置');
            return;
        }
        
        this.currentTrack = track;
        this.audioElement.src = track.audio;
        this.audioElement.play().catch(e => {
            console.error('播放失败:', e);
        });
        
        this.isPlaying = true;
    }
    
    togglePlay() {
        if (!this.currentTrack) {
            this.playTrack(this.playlist[0]);
            return;
        }
        
        if (this.isPlaying) {
            this.audioElement.pause();
        } else {
            this.audioElement.play();
        }
        
        this.isPlaying = !this.isPlaying;
    }
    
    next() {
        if (!this.playlist.length) return;
        
        const currentIndex = this.playlist.findIndex(track => track.id === this.currentTrack?.id);
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        
        this.playTrack(this.playlist[nextIndex]);
    }
    
    prev() {
        if (!this.playlist.length) return;
        
        const currentIndex = this.playlist.findIndex(track => track.id === this.currentTrack?.id);
        const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
        
        this.playTrack(this.playlist[prevIndex]);
    }
    
    updateProgress() {
        // 更新进度条逻辑
        if (this.onProgressUpdate) {
            this.onProgressUpdate({
                currentTime: this.audioElement.currentTime,
                duration: this.audioElement.duration
            });
        }
    }
    
    getCurrentTime() {
        return this.audioElement ? this.audioElement.currentTime : 0;
    }
    
    getDuration() {
        return this.audioElement ? this.audioElement.duration : 0;
    }
    
    setVolume(volume) {
        if (this.audioElement) {
            this.audioElement.volume = Math.max(0, Math.min(1, volume));
        }
    }
}
