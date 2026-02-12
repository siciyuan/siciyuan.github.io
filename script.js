
// 主应用入口
const { createApp, onMounted, reactive, computed, defineAsyncComponent } = Vue;

// 全局配置
let globalConfig = {};

// 异步加载组件
const MusicPlayer = {
    template: `
        <!-- 桌面端播放器 -->
        <div class="player-container hidden md:block">
            <div class="floating-player glass-card p-4 rounded-xl shadow-lg transform transition-all duration-500 hover:scale-[1.02]">
                <div class="container mx-auto max-w-6xl">
                    <!-- 第一行：当前播放信息和播放列表按钮 -->
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-4 flex-1">
                            <div class="relative">
                                <img 
                                    :src="currentTrack.cover" 
                                    alt="专辑封面"
                                    class="w-12 h-12 rounded-lg shadow-md transform transition-transform duration-500 hover:scale-110"
                                    :class="{ 'rotate-12': isPlaying }"
                                >
                                <div v-if="isPlaying" class="absolute inset-0 bg-black/20 rounded-lg animate-pulse"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-sm truncate transition-colors duration-300 hover:text-white">{{ currentTrack.title }}</h4>
                                <p class="text-xs opacity-80 truncate">{{ currentTrack.artist }}</p>
                            </div>
                        </div>
                        <div class="relative ml-3">
                            <button @click="showPlaylist = !showPlaylist" class="flex items-center space-x-1 hover:text-white/80 p-2 rounded-full transition-all duration-300 hover:bg-white/10">
                                <i class="fas fa-list text-sm"></i>
                                <span class="hidden sm:inline text-xs">播放列表</span>
                            </button>
                            
                            <!-- 播放列表下拉 -->
                            <div 
                                v-if="showPlaylist" 
                                class="absolute bottom-full right-0 mb-3 w-64 sm:w-72 max-h-80 overflow-y-auto glass-card rounded-xl p-3 shadow-xl transform transition-all duration-300 scale-95 opacity-0" 
                                :class="{ 'scale-100 opacity-100': showPlaylist }"
                            >
                                <div 
                                    v-for="(track, index) in playlist" 
                                    :key="track.id"
                                    @click="playTrack(index)"
                                    class="p-3 rounded-lg hover:bg-white/20 cursor-pointer flex items-center space-x-3 transition-all duration-300 hover:translate-x-2"
                                    :class="{'bg-white/20': index === currentTrackIndex}"
                                >
                                    <img :src="track.cover" class="w-10 h-10 rounded shadow-sm" alt="封面">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-sm truncate">{{ track.title }}</h4>
                                        <p class="text-xs opacity-80 truncate">{{ track.artist }}</p>
                                    </div>
                                    <i v-if="index === currentTrackIndex && isPlaying" class="fas fa-volume-up animate-pulse"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第二行：播放控制和进度条 -->
                    <div class="flex items-center justify-between">
                        <!-- 播放控制 -->
                        <div class="flex items-center space-x-4">
                            <button @click="prevTrack" class="hover:text-white/80 p-2 rounded-full transition-all duration-300 hover:bg-white/10">
                                <i class="fas fa-step-backward text-sm"></i>
                            </button>
                            <button @click="togglePlay" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md transition-all duration-500 hover:bg-white/30 hover:scale-110">
                                <i v-if="isPlaying" class="fas fa-pause text-sm"></i>
                                <i v-else class="fas fa-play text-sm"></i>
                            </button>
                            <button @click="nextTrack" class="hover:text-white/80 p-2 rounded-full transition-all duration-300 hover:bg-white/10">
                                <i class="fas fa-step-forward text-sm"></i>
                            </button>
                        </div>
                        
                        <!-- 进度条 -->
                        <div class="flex-1 mx-6">
                            <div class="flex items-center space-x-2">
                                <span class="text-xs">{{ formatTime(currentTime) }}</span>
                                <div class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative">
                                    <div 
                                        class="h-full bg-white/70 rounded-full transition-all duration-300 ease-out"
                                        :style="{width: progress + '%'}"
                                    ></div>
                                    <div 
                                        class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2 transition-all duration-300 ease-out"
                                        :style="{left: progress + '%'}"
                                    ></div>
                                </div>
                                <span class="text-xs">{{ formatTime(duration) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 手机端悬浮球播放器 -->
        <div class="md:hidden">
            <!-- 悬浮球 -->
            <div 
                class="fixed bottom-8 right-8 z-50 transform transition-all duration-500 ease-out" 
                :class="{'scale-100 opacity-100': showMobilePlayer, 'scale-0 opacity-0': !showMobilePlayer}"
            >
                <!-- 展开的播放器 -->
                <div class="glass-card rounded-2xl p-5 shadow-xl w-80 transform transition-all duration-500 hover:scale-[1.02]">
                    <!-- 当前播放信息 -->
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="relative">
                            <img 
                                :src="currentTrack.cover" 
                                alt="专辑封面"
                                class="w-14 h-14 rounded-lg shadow-md"
                                :class="{ 'rotate-12': isPlaying }"
                            >
                            <div v-if="isPlaying" class="absolute inset-0 bg-black/20 rounded-lg animate-pulse"></div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-sm truncate">{{ currentTrack.title }}</h4>
                            <p class="text-xs opacity-80 truncate">{{ currentTrack.artist }}</p>
                        </div>
                    </div>
                    
                    <!-- 播放控制 -->
                    <div class="flex items-center justify-between mb-4">
                        <button @click="prevTrack" class="hover:text-white/80 p-3 rounded-full transition-all duration-300 hover:bg-white/10">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button @click="togglePlay" class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-md transition-all duration-500 hover:bg-white/30 hover:scale-110">
                            <i v-if="isPlaying" class="fas fa-pause"></i>
                            <i v-else class="fas fa-play"></i>
                        </button>
                        <button @click="nextTrack" class="hover:text-white/80 p-3 rounded-full transition-all duration-300 hover:bg-white/10">
                            <i class="fas fa-step-forward"></i>
                        </button>
                    </div>
                    
                    <!-- 进度条 -->
                    <div class="mb-4">
                        <div class="flex items-center space-x-2">
                            <span class="text-xs">{{ formatTime(currentTime) }}</span>
                            <div class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    class="h-full bg-white/70 rounded-full transition-all duration-300 ease-out"
                                    :style="{width: progress + '%'}"
                                ></div>
                            </div>
                            <span class="text-xs">{{ formatTime(duration) }}</span>
                        </div>
                    </div>
                    
                    <!-- 播放列表按钮 -->
                    <div class="text-center">
                        <button @click="showPlaylist = !showPlaylist" class="text-sm hover:text-white/80 py-2 px-4 rounded-full transition-all duration-300 hover:bg-white/10">
                            <i class="fas fa-list mr-1"></i> 播放列表
                        </button>
                    </div>
                    
                    <!-- 播放列表 -->
                    <div 
                        v-if="showPlaylist" 
                        class="mt-4 max-h-48 overflow-y-auto glass-card rounded-lg p-3 transform transition-all duration-300 scale-95 opacity-0" 
                        :class="{ 'scale-100 opacity-100': showPlaylist }"
                    >
                        <div 
                            v-for="(track, index) in playlist" 
                            :key="track.id"
                            @click="playTrack(index)"
                            class="p-3 rounded-lg hover:bg-white/20 cursor-pointer flex items-center space-x-3 transition-all duration-300 hover:translate-x-2"
                            :class="{'bg-white/20': index === currentTrackIndex}"
                        >
                            <img :src="track.cover" class="w-9 h-9 rounded shadow-sm" alt="封面">
                            <div class="flex-1">
                                <h4 class="font-medium text-xs truncate">{{ track.title }}</h4>
                                <p class="text-xs opacity-80 truncate">{{ track.artist }}</p>
                            </div>
                            <i v-if="index === currentTrackIndex && isPlaying" class="fas fa-volume-up text-xs animate-pulse"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 悬浮球按钮 -->
            <button 
                @click="showMobilePlayer = !showMobilePlayer"
                class="fixed bottom-8 right-8 z-40 glass-card w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 hover:bg-white/20"
            >
                <i v-if="isPlaying" class="fas fa-pause text-lg"></i>
                <i v-else class="fas fa-play text-lg"></i>
            </button>
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
            showPlaylist: false,
            showMobilePlayer: false
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
            
            // 滚动动画逻辑
            const handleScroll = () => {
                const elements = document.querySelectorAll('.scroll-reveal');
                elements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const elementVisible = 150;
                    if (elementTop < window.innerHeight - elementVisible) {
                        element.classList.add('active');
                    }
                });
            };
            
            window.addEventListener('scroll', handleScroll);
            // 初始加载时触发一次
            handleScroll();
        });
        
        return {
            config,
            themeManager
        };
    }
}).mount('#app');