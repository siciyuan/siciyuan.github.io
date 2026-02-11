
// 主题管理模块
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


