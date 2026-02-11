
// 主应用入口
const { createApp, onMounted, reactive, computed, defineAsyncComponent } = Vue;

// 全局配置
let globalConfig = {};

// 异步加载组件
const MusicPlayer = {
    template: `
        <div class="player-container">
            <div class="floating-player glass-card p-4">
                <div class="container mx-auto max-w-6xl">
                    <div class="flex flex-col md:flex-row items-center justify-between">
                        <!-- 当前播放 -->
                        <div class="flex items-center space-x-4 mb-4 md:mb-0">
                            <img 
                                :src="currentTrack.cover" 
                                alt="专辑封面"
                                class="w-12 h-12 rounded-lg"
                            >
                            <div>
                                <h4 class="font-medium">{{ currentTrack.title }}</h4>
                                <p class="text-sm opacity-80">{{ currentTrack.artist }}</p>
                            </div>
                        </div>
                        
                        <!-- 播放控制 -->
                        <div class="flex items-center space-x-6">
                            <button @click="prevTrack" class="hover:text-white/80">
                                <i class="fas fa-step-backward text-lg"></i>
                            </button>
                            <button @click="togglePlay" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <i v-if="isPlaying" class="fas fa-pause"></i>
                                <i v-else class="fas fa-play"></i>
                            </button>
                            <button @click="nextTrack" class="hover:text-white/80">
                                <i class="fas fa-step-forward text-lg"></i>
                            </button>
                            
                            <!-- 播放列表 -->
                            <div class="relative">
                                <button @click="showPlaylist = !showPlaylist" class="flex items-center space-x-2 hover:text-white/80">
                                    <i class="fas fa-list"></i>
                                    <span>播放列表</span>
                                </button>
                                
                                <!-- 播放列表下拉 -->
                                <div 
                                    v-if="showPlaylist" 
                                    class="absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto glass-card rounded-xl p-2"
                                >
                                    <div 
                                        v-for="(track, index) in playlist" 
                                        :key="track.id"
                                        @click="playTrack(index)"
                                        class="p-3 rounded-lg hover:bg-white/20 cursor-pointer flex items-center space-x-3"
                                        :class="{'bg-white/20': index === currentTrackIndex}"
                                    >
                                        <img :src="track.cover" class="w-10 h-10 rounded" alt="封面">
                                        <div class="flex-1">
                                            <h4 class="font-medium text-sm">{{ track.title }}</h4>
                                            <p class="text-xs opacity-80">{{ track.artist }}</p>
                                        </div>
                                        <i v-if="index === currentTrackIndex && isPlaying" class="fas fa-volume-up"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 进度条 -->
                        <div class="hidden md:block w-64">
                            <div class="flex items-center space-x-4">
                                <span class="text-sm">{{ formatTime(currentTime) }}</span>
                                <div class="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        class="h-full bg-white/70 rounded-full"
                                        :style="{width: progress + '%'}"
                                    ></div>
                                </div>
                                <span class="text-sm">{{ formatTime(duration) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        playlist: Array
    },
    data() {
        return {
            player: null,
            isPlaying: false,
            currentTrackIndex: 0,
            currentTime: 0,
            duration: 0,
            showPlaylist: false
        };
    },
    computed: {
        currentTrack() {
            return this.playlist[this.currentTrackIndex] || {};
        },
        progress() {
            return (this.currentTime / (this.duration || 1)) * 100;
        }
    },
    mounted() {
        // 初始化播放器
        this.player = new MusicPlayerManager();
        this.player.init(this.playlist);
        
        // 设置进度更新回调
        this.player.onProgressUpdate = (data) => {
            this.currentTime = data.currentTime;
            this.duration = data.duration;
        };
    },
    methods: {
        togglePlay() {
            if (this.player) {
                this.player.togglePlay();
                this.isPlaying = this.player.isPlaying;
            }
        },
        prevTrack() {
            if (this.player) {
                this.player.prev();
                this.updateCurrentTrackIndex();
                this.isPlaying = this.player.isPlaying;
            }
        },
        nextTrack() {
            if (this.player) {
                this.player.next();
                this.updateCurrentTrackIndex();
                this.isPlaying = this.player.isPlaying;
            }
        },
        playTrack(index) {
            if (this.player && this.playlist[index]) {
                this.player.playTrack(this.playlist[index]);
                this.currentTrackIndex = index;
                this.isPlaying = this.player.isPlaying;
                this.showPlaylist = false;
            }
        },
        updateCurrentTrackIndex() {
            if (this.player.currentTrack) {
                this.currentTrackIndex = this.playlist.findIndex(track => track.id === this.player.currentTrack.id);
            }
        },
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    }
};

// 主应用
createApp({
    components: {
        MusicPlayer
    },
    setup() {
        const config = reactive({});
        const themeManager = new ThemeManager();
        const effectsManager = new EffectsManager();
        
        // 加载配置
        const loadConfig = async () => {
            try {
                const response = await fetch('config.json');
                const data = await response.json();
                
                // 合并配置
                Object.assign(config, data);
                
                // 设置页面标题
                if (data.site?.title) {
                    document.title = data.site.title;
                }
                
                // 设置favicon
                if (data.site?.favicon) {
                    document.getElementById('favicon').href = data.site.favicon;
                }
                
                // 初始化主题
                if (data.settings?.defaultTheme) {
                    themeManager.init(data.themes, data.settings.defaultTheme);
                }
                
                // 初始化粒子效果
                if (data.settings?.enableParticles) {
                    setTimeout(() => themeManager.initParticles(), 100);
                }
                
                // 初始化特效
                if (data.settings?.enableClickEffects && data.coreValues) {
                    effectsManager.init(data.coreValues, config.themes, themeManager.currentTheme);
                }
                
            } catch (error) {
                console.error('加载配置失败:', error);
                // 使用默认配置
                Object.assign(config, {
                    profile: { name: '个人主页', bio: '加载配置失败', about: '请检查config.json文件' }
                });
            }
        };
        
        onMounted(() => {
            loadConfig();
        });
        
        return {
            config,
            themeManager
        };
    }
}).mount('#app');