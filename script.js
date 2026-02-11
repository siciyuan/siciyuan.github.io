// script.js - 主应用文件
const { createApp, reactive, onMounted, onBeforeUnmount } = Vue;

// 全局配置
let globalConfig = {};

// 主题管理器
class ThemeManager {
    constructor() {
        this.themes = [];
        this.currentTheme = null;
    }
    
    init(themes, defaultTheme = 'water') {
        this.themes = themes;
        this.changeTheme(defaultTheme);
    }
    
    changeTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        
        this.currentTheme = theme;
        
        // 更新页面样式
        document.body.style.backgroundColor = theme.bg;
        document.body.style.color = theme.text;
        
        // 保存到localStorage
        localStorage.setItem('selectedTheme', themeId);
        
        // 更新粒子颜色
        this.updateParticles(theme.color);
    }
    
    updateParticles(color) {
        if (window.particlesJS && document.getElementById('particles-bg')) {
            particlesJS("particles-bg", {
                particles: {
                    number: { value: 60 },
                    color: { value: color },
                    shape: { type: "circle" },
                    opacity: { value: 0.5 },
                    size: { value: 3 },
                    move: { 
                        enable: true,
                        speed: 2,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out"
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: false }
                    }
                }
            });
        }
    }
    
    initParticles() {
        if (window.particlesJS && document.getElementById('particles-bg') && this.currentTheme) {
            this.updateParticles(this.currentTheme.color);
        } else if (window.particlesJS) {
            // 延迟初始化
            setTimeout(() => this.initParticles(), 100);
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// 特效管理器
class EffectsManager {
    constructor() {
        this.coreValues = [];
        this.themes = [];
        this.currentTheme = null;
    }
    
    init(coreValues, themes, currentTheme) {
        this.coreValues = coreValues;
        this.themes = themes;
        this.currentTheme = currentTheme;
        
        // 添加点击事件监听
        document.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleClick(event) {
        this.createRippleEffect(event);
        this.createCoreValueEffect(event);
    }
    
    createRippleEffect(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || 
            target.closest('button') || target.closest('a')) {
            return;
        }
        
        const ripple = document.createElement("div");
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add('ripple');
        
        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    createCoreValueEffect(event) {
        const container = document.getElementById('core-values-container');
        if (!container || this.coreValues.length === 0) return;
        
        const value = this.coreValues[Math.floor(Math.random() * this.coreValues.length)];
        const element = document.createElement('div');
        
        element.textContent = value;
        element.className = 'absolute text-xl font-bold opacity-0';
        element.style.left = event.clientX + 'px';
        element.style.top = event.clientY + 'px';
        
        // 使用当前主题颜色
        if (this.currentTheme) {
            element.style.color = this.currentTheme.color;
        }
        
        container.appendChild(element);
        
        // 添加浮动动画
        this.animateFloat(element);
    }
    
    animateFloat(element) {
        // 淡入
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) rotate(0deg)';
        }, 10);
        
        // 随机浮动
        const floatX = (Math.random() - 0.5) * 100;
        const floatY = -100 - Math.random() * 50;
        const rotation = (Math.random() - 0.5) * 20;
        
        // 动画
        element.animate([
            { 
                opacity: 1,
                transform: 'translateY(0) rotate(0deg)'
            },
            { 
                opacity: 0,
                transform: `translate(${floatX}px, ${floatY}px) rotate(${rotation}deg)`
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        // 移除元素
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 2000);
    }
    
    updateTheme(theme) {
        this.currentTheme = theme;
    }
}

// Vue 音乐播放器组件
const MusicPlayerComponent = {
    template: `
        <div class="player-container" v-if="config.settings?.enableMusicPlayer && config.playlist">
            <div class="floating-player glass-card p-4">
                <div class="container mx-auto max-w-6xl">
                    <div class="flex flex-col md:flex-row items-center justify-between">
                        <!-- 当前播放 -->
                        <div class="flex items-center space-x-4 mb-4 md:mb-0 flex-1 min-w-0">
                            <img 
                                :src="currentTrack.cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'" 
                                alt="专辑封面"
                                class="w-12 h-12 rounded-lg flex-shrink-0"
                            >
                            <div class="min-w-0">
                                <h4 class="font-medium truncate">{{ currentTrack.title || '无标题' }}</h4>
                                <p class="text-sm opacity-80 truncate">{{ currentTrack.artist || '未知艺术家' }}</p>
                            </div>
                        </div>
                        
                        <!-- 播放控制 -->
                        <div class="flex items-center space-x-4 mx-4">
                            <button @click="prev" class="p-2 hover:bg-white/10 rounded-full transition-colors" title="上一首">
                                <i class="fas fa-step-backward"></i>
                            </button>
                            
                            <button @click="togglePlay" class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" title="播放/暂停">
                                <i v-if="playing" class="fas fa-pause"></i>
                                <i v-else class="fas fa-play pl-0.5"></i>
                            </button>
                            
                            <button @click="next" class="p-2 hover:bg-white/10 rounded-full transition-colors" title="下一首">
                                <i class="fas fa-step-forward"></i>
                            </button>
                        </div>
                        
                        <!-- 进度和音量 -->
                        <div class="hidden md:flex items-center space-x-4 flex-1">
                            <!-- 时间显示 -->
                            <span class="text-sm text-nowrap w-12 text-right">{{ formatTime(currentTime) }}</span>
                            
                            <!-- 进度条 -->
                            <div class="flex-1 relative group cursor-pointer" @click="seekToPosition">
                                <div class="h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        class="h-full bg-white/70 rounded-full transition-all duration-300"
                                        :style="{width: progress + '%'}"
                                    ></div>
                                </div>
                                <div class="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div 
                                        class="absolute h-4 rounded-full"
                                        :style="{left: progress + '%'}"
                                    >
                                        <div class="w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <span class="text-sm text-nowrap w-12">{{ formatTime(duration) }}</span>
                            
                            <!-- 音量 -->
                            <div class="flex items-center space-x-2 w-24">
                                <i class="fas fa-volume-up text-sm"></i>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    v-model="volume" 
                                    @input="updateVolume"
                                    class="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                        </div>
                        
                        <!-- 播放列表按钮 -->
                        <div class="relative">
                            <button @click="showPlaylist = !showPlaylist" 
                                    class="px-3 py-2 rounded-lg glass-card hover:bg-white/20 transition-colors flex items-center space-x-2" 
                                    title="播放列表">
                                <i class="fas fa-list"></i>
                                <span>{{ config.playlist.length }} 首</span>
                            </button>
                            
                            <!-- 播放列表下拉 -->
                            <div v-if="showPlaylist" 
                                 class="absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto glass-card rounded-xl p-3 shadow-xl"
                                 @click.stop>
                                <div class="space-y-2">
                                    <div 
                                        v-for="(track, index) in config.playlist" 
                                        :key="track.id"
                                        @click="playTrack(index)"
                                        class="p-3 rounded-lg hover:bg-white/20 cursor-pointer flex items-center space-x-3 transition-colors"
                                        :class="{'bg-white/20': index === currentIndex}"
                                    >
                                        <img :src="track.cover" class="w-10 h-10 rounded flex-shrink-0" alt="封面">
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-medium text-sm truncate">{{ track.title }}</h4>
                                            <p class="text-xs opacity-80 truncate">{{ track.artist }}</p>
                                        </div>
                                        <i v-if="index === currentIndex && playing" class="fas fa-volume-up text-green-400"></i>
                                        <i v-else-if="index === currentIndex" class="fas fa-pause text-yellow-400"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 移动端进度条 -->
                    <div class="mt-4 md:hidden">
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-nowrap">{{ formatTime(currentTime) }}</span>
                            <div class="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer" @click="seekToPosition">
                                <div 
                                    class="h-full bg-white/70 rounded-full"
                                    :style="{width: progress + '%'}"
                                ></div>
                            </div>
                            <span class="text-sm text-nowrap">{{ formatTime(duration) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    props: {
        config: Object
    },
    
    data() {
        return {
            player: null,
            playing: false,
            currentTime: 0,
            duration: 0,
            volume: 70,
            showPlaylist: false
        };
    },
    
    computed: {
        currentTrack() {
            if (!this.player) return {};
            return this.player.getCurrentTrack() || this.config.playlist[0] || {};
        },
        
        currentIndex() {
            if (!this.player) return 0;
            return this.player.currentTrackIndex;
        },
        
        progress() {
            if (!this.player) return 0;
            return this.player.getProgress();
        }
    },
    
    methods: {
        // 初始化播放器
        initPlayer() {
            if (this.config.playlist && this.config.playlist.length > 0) {
                this.player = new AudioPlayer(this.config);
                
                // 监听进度更新
                this.player.onProgress((data) => {
                    this.currentTime = data.currentTime;
                    this.duration = data.duration;
                });
                
                // 监听曲目变化
                this.player.onTrackChange((track) => {
                    console.log('切换到曲目:', track.title);
                });
                
                // 监听播放状态变化
                this.player.onPlayStateChange((isPlaying) => {
                    this.playing = isPlaying;
                });
                
                // 设置初始音量
                this.player.setVolume(this.volume / 100);
                
                // 加载并播放第一首
                this.player.loadTrack(0);
            }
        },
        
        // 切换播放/暂停
        togglePlay() {
            if (this.player) {
                this.player.toggle();
            }
        },
        
        // 播放指定曲目
        playTrack(index) {
            if (this.player) {
                this.player.loadTrack(index);
                this.player.play();
            }
        },
        
        // 上一首
        prev() {
            if (this.player) {
                this.player.prev();
            }
        },
        
        // 下一首
        next() {
            if (this.player) {
                this.player.next();
            }
        },
        
        // 格式化时间
        formatTime(seconds) {
            if (!this.player) return '0:00';
            return this.player.formatTime(seconds);
        },
        
        // 更新音量
        updateVolume() {
            if (this.player) {
                this.player.setVolume(this.volume / 100);
            }
        },
        
        // 跳转到点击位置
        seekToPosition(event) {
            if (!this.player || this.duration <= 0) return;
            
            const progressBar = event.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            
            this.player.seekByPercentage(percentage);
        }
    },
    
    mounted() {
        this.initPlayer();
        
        // 点击外部关闭播放列表
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.relative')) {
                this.showPlaylist = false;
            }
        });
    },
    
    beforeUnmount() {
        if (this.player) {
            this.player.destroy();
        }
    }
};

// 主应用
createApp({
    components: {
        MusicPlayer: MusicPlayerComponent
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
                    const favicon = document.getElementById('favicon');
                    if (favicon) {
                        favicon.href = data.site.favicon;
                    }
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
                    effectsManager.init(data.coreValues, data.themes, themeManager.currentTheme);
                }
                
            } catch (error) {
                console.error('加载配置失败:', error);
                // 使用默认配置
                Object.assign(config, {
                    profile: { 
                        name: '个人主页', 
                        bio: '加载配置失败', 
                        about: '请检查config.json文件配置',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    },
                    contacts: [],
                    friendLinks: [],
                    quickLinks: [],
                    playlist: [],
                    themes: [],
                    settings: { enableMusicPlayer: false },
                    footer: { copyright: '配置加载失败' }
                });
            }
        };
        
        onMounted(() => {
            loadConfig();
        });
        
        onBeforeUnmount(() => {
            // 清理资源
            if (effectsManager) {
                document.removeEventListener('click', effectsManager.handleClick);
            }
        });
        
        return {
            config,
            themeManager
        };
    }
}).mount('#app');