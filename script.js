// Konfigurasi
const CONFIG = {
    WEDDING_DATE: 'March 15, 2026 10:00:00',
    BANK_INFO: {
        bank: 'BCA',
        account: '1234 5678 90',
        name: 'Rony'
    },
    STORAGE_KEYS: {
        RSVPS: 'weddingRSVPs',
        VISITORS: 'weddingVisitors'
    }
};

// Inisialisasi variabel global
const weddingDate = new Date(CONFIG.WEDDING_DATE).getTime();
let confettiInterval;

// DOM Elements
const coverCard = document.getElementById('coverCard');
const fullInvitation = document.getElementById('fullInvitation');
const openBtn = document.getElementById('openInvitation');
const backButton = document.getElementById('backButton');
const submitRsvpBtn = document.getElementById('submitRsvp');
const shareButton = document.getElementById('shareButton');

// Fungsi untuk membuat confetti
function createConfetti() {
    const colors = ['#8d6e63', '#bcaaa4', '#d7ccc8', '#5d4037'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Fungsi untuk memulai confetti berkelanjutan
function startConfetti() {
    confettiInterval = setInterval(createConfetti, 300);
    setTimeout(() => {
        clearInterval(confettiInterval);
    }, 3000);
}

// Fungsi untuk update countdown
function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = 
            '<h3 style="color: #8d6e63; text-align: center;">Acara telah berlangsung!</h3>';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Fungsi untuk generate QR Code
function generateQRCode() {
    const qrData = `Bank: ${CONFIG.BANK_INFO.bank}\nAccount: ${CONFIG.BANK_INFO.account}\nName: ${CONFIG.BANK_INFO.name}\nMessage: Wedding Gift`;
    
    QRCode.toCanvas(document.getElementById('qrcode'), qrData, {
        width: 150,
        height: 150,
        margin: 1,
        color: {
            dark: '#5d4037',
            light: '#ffffff'
        }
    }, function(error) {
        if (error) {
            console.error('QR Code generation error:', error);
            // Fallback jika QR Code gagal
            document.getElementById('qrcode').innerHTML = 
                `<div style="text-align: center; padding: 20px;">
                    <p><strong>${CONFIG.BANK_INFO.bank}</strong></p>
                    <p>${CONFIG.BANK_INFO.account}</p>
                    <p>a.n ${CONFIG.BANK_INFO.name}</p>
                </div>`;
        }
    });
}

// Fungsi untuk mengirim RSVP
function submitRSVP() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const attendance = document.getElementById('attendance').value;
    const message = document.getElementById('message').value.trim();

    // Validasi
    if (!name || !phone || !attendance) {
        showAlert('Harap lengkapi semua data yang diperlukan', 'warning');
        return;
    }

    if (!/^[0-9+\-\s()]{10,}$/.test(phone)) {
        showAlert('Nomor WhatsApp tidak valid', 'warning');
        return;
    }

    // Simpan data RSVP
    const rsvpData = {
        id: Date.now(),
        name,
        phone,
        attendance,
        message,
        timestamp: new Date().toISOString()
    };

    const existingRSVPs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RSVPS)) || [];
    existingRSVPs.push(rsvpData);
    localStorage.setItem(CONFIG.STORAGE_KEYS.RSVPS, JSON.stringify(existingRSVPs));

    // Reset form
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('attendance').value = '';
    document.getElementById('message').value = '';

    // Tampilkan konfirmasi
    showAlert(
        `Terima kasih ${name}!\nKonfirmasi kehadiran Anda telah tercatat.\nKami akan mengirimkan reminder via WhatsApp.`,
        'success'
    );

    // Kirim notifikasi (simulasi)
    sendRSVPNotification(rsvpData);
}

// Fungsi untuk menampilkan alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div>${message.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Simulasi pengiriman notifikasi
function sendRSVPNotification(rsvpData) {
    // Simpan ke log (untuk development)
    console.log('RSVP Submitted:', rsvpData);
    
    // Di production, ini akan mengirim data ke server/API
    // Contoh: fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(rsvpData) })
}

// Fungsi untuk play sound
function playSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio tidak tersedia');
    }
}

// Fungsi untuk membuka undangan
function openInvitation() {
    // Efek tombol
    openBtn.style.animation = 'none';
    openBtn.style.transform = 'scale(0.95)';
    
    // Play sound
    playSound();
    
    // Start confetti
    startConfetti();
    
    // Animasi transisi
    setTimeout(() => {
        coverCard.classList.remove('show');
        setTimeout(() => {
            coverCard.style.display = 'none';
            fullInvitation.style.display = 'block';
            setTimeout(() => {
                fullInvitation.classList.add('show');
                document.body.classList.add('opened');
                
                // Generate QR Code
                generateQRCode();
                
                // Start countdown
                updateCountdown();
                setInterval(updateCountdown, 1000);
                
                // Scroll ke atas
                window.scrollTo(0, 0);
                
                // Track event
                trackEvent('open_invitation');
            }, 50);
        }, 500);
    }, 300);
}

// Fungsi untuk kembali ke halaman utama
function goBack() {
    fullInvitation.classList.remove('show');
    setTimeout(() => {
        fullInvitation.style.display = 'none';
        coverCard.style.display = 'block';
        setTimeout(() => {
            coverCard.classList.add('show');
            document.body.classList.remove('opened');
            window.scrollTo(0, 0);
        }, 50);
    }, 500);
}

// Fungsi untuk share ke media sosial
function shareInvitation() {
    const shareData = {
        title: 'Undangan Pernikahan Rony & Istri Komputer',
        text: 'Saya diundang ke pernikahan Rony & Istri Komputer. Lihat undangannya!',
        url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData)
            .then(() => {
                trackEvent('share_success');
            })
            .catch(error => {
                console.log('Error sharing:', error);
                fallbackShare();
            });
    } else {
        fallbackShare();
    }
}

// Fallback share untuk browser yang tidak support Web Share API
function fallbackShare() {
    const text = encodeURIComponent('Saya diundang ke pernikahan Rony & Istri Komputer! Lihat undangannya di: ');
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${text}${url}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    trackEvent('share_fallback');
}

// Track event untuk analytics sederhana
function trackEvent(eventName, data = {}) {
    const analytics = JSON.parse(localStorage.getItem('weddingAnalytics')) || [];
    analytics.push({
        event: eventName,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    });
    localStorage.setItem('weddingAnalytics', JSON.stringify(analytics));
}

// Inisialisasi saat halaman dimuat
function init() {
    // Tampilkan kartu dengan animasi
    setTimeout(() => {
        coverCard.classList.add('show');
    }, 100);

    // Inisialisasi storage
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.RSVPS)) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.RSVPS, JSON.stringify([]));
    }

    // Track visitor
    const visitors = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.VISITORS)) || [];
    const visitor = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    visitors.push(visitor);
    localStorage.setItem(CONFIG.STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
    
    trackEvent('page_visit');
}

// Event Listeners
openBtn.addEventListener('click', openInvitation);
backButton.addEventListener('click', goBack);
submitRsvpBtn.addEventListener('click', submitRSVP);
shareButton.addEventListener('click', shareInvitation);

// Efek hover pada kartu
if (coverCard) {
    coverCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 20px 50px rgba(141, 110, 99, 0.2)';
    });
    
    coverCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 15px 40px rgba(141, 110, 99, 0.15)';
    });
}

// Tambahkan style untuk animasi alert
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// PWA manifest (opsional untuk instalasi)
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// Inisialisasi aplikasi
window.addEventListener('DOMContentLoaded', init);