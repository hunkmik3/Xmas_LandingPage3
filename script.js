// Snow effect for mobile + auto change overlay image by date

document.addEventListener('DOMContentLoaded', function() {
    const snowContainer = document.getElementById('snow-container');
    const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❉'];
    
    // Number of snowflakes based on screen size (optimized for mobile)
    const getSnowflakeCount = () => {
        const width = window.innerWidth;
        if (width < 480) return 30; // Small mobile
        if (width < 768) return 50; // Large mobile
        return 70; // Tablet and above
    };
    
    let snowflakeCount = getSnowflakeCount();
    
    // Create snowflakes
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Random starting position
        snowflake.style.left = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 0.8 + 0.5; // 0.5em to 1.3em
        snowflake.style.fontSize = size + 'em';
        
        // Random animation duration (falling speed)
        const duration = Math.random() * 3 + 5; // 5s to 8s
        snowflake.style.animation = `snowfall ${duration}s linear infinite`;
        
        // Random delay
        snowflake.style.animationDelay = Math.random() * 2 + 's';
        
        // Random opacity
        snowflake.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 to 1
        
        snowContainer.appendChild(snowflake);
        
        // Remove snowflake after animation completes
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.remove();
            }
        }, (duration + 2) * 1000);
    }
    
    // Initialize snowflakes
    function initSnow() {
        // Clear existing snowflakes
        snowContainer.innerHTML = '';
        
        // Create initial snowflakes
        for (let i = 0; i < snowflakeCount; i++) {
            setTimeout(() => {
                createSnowflake();
            }, i * 100);
        }
        
        // Continuously create new snowflakes
        setInterval(() => {
            if (snowContainer.children.length < snowflakeCount) {
                createSnowflake();
            }
        }, 500);
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            snowflakeCount = getSnowflakeCount();
            initSnow();
        }, 250);
    });
    
    // Start snow effect
    initSnow();

    // ===== Change overlay image based on date =====
    const overlayImg = document.querySelector('.banner-overlay');
    if (overlayImg) {
        const now = new Date();
        let imgSrc = 'images/1.png'; // default

        // Chỉ áp dụng cho tháng 12 năm 2025
        if (now.getFullYear() === 2025 && now.getMonth() === 11) { // 11 = December
            const day = now.getDate();

            if (day >= 1 && day <= 6) {
                // Từ 1–6/12: luôn là hình 1.png
                imgSrc = 'images/1.png';
            } else if (day >= 7 && day <= 20) {
                // Từ 7–20/12: ngày 7 -> 2.png, ngày 8 -> 3.png, ... ngày 20 -> 15.png
                const index = day - 5; // 7-5=2, 8-5=3, ...
                imgSrc = `images/${index}.png`;
            } else if (day >= 21 && day <= 24) {
                // Từ 21–24/12: vẫn hiển thị 15.png
                imgSrc = 'images/15.png';
            }
        }

        // Gán ảnh theo ngày trước
        overlayImg.src = imgSrc;

        // ===== KIỂM TRA QUÀ QUA API (Google Apps Script mới) =====
        // Web app URL đang trả JSON: {"giftsLeft":..., "updatedAt": "..."}
        const GIFTS_API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLg0M3qBzaUCG2wi7MzCtjLNHb1Q6f88P5qkoTeJGivOzdxX5jfJRRHnPdIGGFStHAP8KN5b1-jqfBKFLRapa5KCB55EAvIpKA3F82h4sENhTRgbrZpOT7Ru56HvuBrBUDwh3knS563UxBkEM3W_m4iSCyiqEYonvxI70zIkKxKOnAO76XhHWyadltUP7jgoQAK8tzkppmT5SomAbLMgsEC4RXQsWrpWZg8pZRRPpoacX6Yo1I7N6IxeM8qB6spYumz-4E4gctV4OXNNQFW8nourinz0U-LGFABqSrHtNnX6xBaZTj4&lib=MAkIPrzFL1XZAS9O_aKOYZPw6We1Ifjug';

        async function checkGiftsAndUpdate() {
            if (!GIFTS_API_URL || GIFTS_API_URL.startsWith('PASTE_')) return;

            document.body.classList.add('loading-gifts');

            try {
                // Thêm cache-busting param để tránh cache
                const url = GIFTS_API_URL + (GIFTS_API_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
                const res = await fetch(url, { cache: 'no-store' });
                const data = await res.json();

                const giftsLeft = Number(data.giftsLeft ?? 0);

                // Cập nhật thanh trạng thái thời gian hiện tại + số quà còn lại
                const statusEl = document.getElementById('gift-status');
                if (statusEl) {
                    const nowText = new Date().toLocaleString('vi-VN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    statusEl.textContent = `${nowText} - Quà còn lại: ${isNaN(giftsLeft) ? 'Không xác định' : giftsLeft}`;
                }

                if (!isNaN(giftsLeft) && giftsLeft <= 0) {
                    overlayImg.src = 'images/hetqua.png';
                    overlayImg.classList.add('banner-overlay--full');
                    document.body.classList.add('sold-out');
                }
            } catch (e) {
                console.error('Cannot read gifts from API:', e);
            } finally {
                document.body.classList.remove('loading-gifts');
            }
        }

        // Gọi 1 lần khi load
        checkGiftsAndUpdate();
        // Nếu muốn cập nhật liên tục, có thể mở dòng dưới (mỗi 60s kiểm tra lại)
        // setInterval(checkGiftsAndUpdate, 60000);
    }
});
