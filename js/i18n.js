// Simple i18n implementation
const i18n = {
    currentLang: 'en',
    
    translations: {
        en: {
            // Header & Navigation
            login: 'Login',
            signUp: 'Sign Up',
            freeBonus: 'Free Bonus',
            myInfo: 'My Info',
            gameProvider: 'Game Provider',
            contactUs: 'Contact Us',
            logout: 'LOGOUT',
            
            // Game Categories
            home: 'Home',
            liveArena: 'Live Arena',
            sports: 'Sports',
            slots: 'Slots',
            table: 'Table',
            casino: 'Casino',
            arcade: 'Arcade',
            fishing: 'Fishing',
            search: 'Search',
            
            // Game Sections
            hotTable: 'HOT TABLE',
            newGames: 'New Games',
            localGame: 'Local Game',
            jackpot: 'Jackpot',
            leaderBoard: 'Leader Board',
            raceWin: 'Race Win',
            
            // Game Actions
            playNow: 'Play Now',
            loadingGame: 'Loading Game...',
            cashIn: 'CASH IN',
            cashOut: 'CASH OUT',
            
            // Bonus & Events
            totalBonus: 'TOTAL BONUS',
            comingSoon: 'Coming Soon',
            redeemed: 'Redeemed',
            challenge: 'Challenge',
            
            // Welcome Message
            welcomeMessage: 'Welcome to ALO789'
        },
        vn: {
            // Header & Navigation
            login: 'Đăng nhập',
            signUp: 'Đăng ký',
            freeBonus: 'Thưởng miễn phí',
            myInfo: 'Thông tin của tôi',
            gameProvider: 'Nhà cung cấp',
            contactUs: 'Liên hệ',
            logout: 'ĐĂNG XUẤT',
            
            // Game Categories
            home: 'Trang chủ',
            liveArena: 'Đấu trường trực tiếp',
            sports: 'Thể thao',
            slots: 'Máy đánh bạc',
            table: 'Bàn chơi',
            casino: 'Sòng bạc',
            arcade: 'Trò chơi điện tử',
            fishing: 'Bắn cá',
            search: 'Tìm kiếm',
            
            // Game Sections
            hotTable: 'BÀN HOT',
            newGames: 'Trò chơi mới',
            localGame: 'Trò chơi địa phương',
            jackpot: 'Giải độc đắc',
            leaderBoard: 'Bảng xếp hạng',
            raceWin: 'Đua thắng',
            
            // Game Actions
            playNow: 'Chơi ngay',
            loadingGame: 'Đang tải trò chơi...',
            cashIn: 'NẠP TIỀN',
            cashOut: 'RÚT TIỀN',
            
            // Bonus & Events
            totalBonus: 'TỔNG THƯỞNG',
            comingSoon: 'Sắp ra mắt',
            redeemed: 'Đã nhận',
            challenge: 'Thử thách',
            
            // Welcome Message
            welcomeMessage: 'Chào mừng đến với ALO789'
        }
    },
    
    init(lang = 'en') {
        this.currentLang = lang;
        this.updateTexts();
    },
    
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },
    
    switchLanguage(lang) {
        this.currentLang = lang;
        this.updateTexts();
        this.updateFlag(lang);
        localStorage.setItem('selectedLang', lang);
        
        // Close dropdown by removing any show class or inline display
        const dropdown = document.querySelector('.lang-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            dropdown.style.display = '';
        }
    },
    
    updateFlag(lang) {
        const flagImg = document.querySelector('#language .img-flag');
        const flagText = document.querySelector('#language span');
        
        if (lang === 'vn') {
            flagImg.src = 'https://land2.mpsimg.com/theme/images/src-common/FLAG-img/flag-vn.webp';
            flagText.textContent = 'VN';
        } else {
            flagImg.src = 'images/FLAG-img-flag-gb.webp';
            flagText.textContent = 'EN';
        }
    },
    
    updateTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
    }
};

// Initialize with saved language or default to English
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLang') || 'en';
    i18n.init(savedLang);
    i18n.updateFlag(savedLang);
});