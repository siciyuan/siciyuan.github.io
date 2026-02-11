
// 特效管理模块
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
        const ripple = document.createElement("div");
        const rect = event.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        ripple.classList.add('ripple');
        
        event.target.style.position = 'relative';
        event.target.style.overflow = 'hidden';
        event.target.appendChild(ripple);
        
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
        element.className = 'absolute text-xl font-bold opacity-0 animate-float';
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
            element.style.transform = 'translateY(-20px) rotate(5deg)';
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
