// ===== ELEMEN =====
// ===== FUNGSI NOTIFIKASI TOAST =====
function tampilkanToast(pesan) {
    const toast = document.getElementById("toast");
    if(toast) {
        toast.textContent = pesan;
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }
}

const envelopeWrapper = document.getElementById('envelopeWrapper');
const envelope = document.getElementById('envelope');
const bukaBtn = document.getElementById('bukaUndangan');
const musik = document.getElementById('musikLatar');
const tombolMusik = document.getElementById('tombolMusik');
const musikIkon = document.getElementById('musikIkon');
const nav = document.getElementById('nav');

// ===== FITUR BUKA AMPLOP =====
bukaBtn.addEventListener('click', () => {
    // 1. Animasi tutup amplop berputar ke atas
    envelope.classList.add('open');
    
    // 2. Tunggu setengah detik, lalu hilangkan seluruh wrapper amplop
    setTimeout(() => {
        envelopeWrapper.classList.add('hidden');
        
        // 3. Munculkan tombol musik & navigasi
        tombolMusik.classList.add('show');
        nav.classList.add('show');
        
        // 4. Putar musik otomatis
        musik.play().then(() => {
            tombolMusik.classList.add('playing');
            musikIkon.textContent = '🔇';
        }).catch(() => {
            musikIkon.textContent = '🎵'; // Jika browser blokir autoplay
        });
    }, 800); // Sesuaikan dengan durasi animasi CSS
});

// ===== KONTROL MUSIK =====
function kontrolMusik() {
    if (musik.paused) {
        musik.play();
        tombolMusik.classList.add('playing');
        musikIkon.textContent = '🔇';
    } else {
        musik.pause();
        tombolMusik.classList.remove('playing');
        musikIkon.textContent = '🎵';
    }
}

// ===== COUNTDOWN (Target: 09 November 2026) =====
const tanggalAcara = new Date('2026-11-09T09:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const diff = tanggalAcara - now;

    if (diff < 0) {
        document.getElementById('countdown').innerHTML = '<p style="color:var(--primary-dark); font-weight:bold;">Alhamdulillah, acara telah berlangsung 🎉</p>';
        return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById('hari').textContent  = String(d).padStart(2, '0');
    document.getElementById('jam').textContent   = String(h).padStart(2, '0');
    document.getElementById('menit').textContent = String(m).padStart(2, '0');
    document.getElementById('detik').textContent = String(s).padStart(2, '0');

    // Progress Bar
    const tanggalMulai = new Date('2026-01-01T00:00:00').getTime(); 
    const totalDurasi = tanggalAcara - tanggalMulai;
    const progress = ((now - tanggalMulai) / totalDurasi) * 100;
    const progressBar = document.getElementById('progressBar');
    if(progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== NAMA TAMU PERSONALISASI (URL ?to=Nama) =====
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to');
if (namaTamu) {
    const elemenTamu = document.getElementById('tamuPersonal');
    elemenTamu.textContent = `Kepada: ${decodeURIComponent(namaTamu)}`;
    elemenTamu.classList.add('active'); // Tampilkan elemen jika ada nama
}

// ===== SALIN REKENING =====
function salinTeks(teks, btn) {
    navigator.clipboard.writeText(teks).then(() => {
        const original = btn.textContent;
        btn.textContent = '✓ Tersalin!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => alert('Gagal menyalin. Silakan salin manual: ' + teks));
}

// (Fungsi Lightbox dihapus karena Galeri sudah dihilangkan)

// ===== ANIMASI FADE-IN SAAT SCROLL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.section, .countdown-section').forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
});

// ===== LOGIKA FIREBASE (RSVP & BUKU TAMU) =====
// Menunggu script module Firebase di index.html selesai dimuat
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.firebaseApp) {
            console.error("Firebase belum siap. Pastikan config sudah diisi di index.html.");
            return;
        }

        const { db, collection, addDoc, serverTimestamp } = window.firebaseApp;

        // 3. FORM RSVP
        document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nama   = document.getElementById('rsvp-nama').value.trim();
            const hadir  = document.getElementById('rsvp-hadir').value;
            const jumlah = document.getElementById('rsvp-jumlah').value;
            const pesan  = document.getElementById('rsvp-pesan').value.trim();

            if (!nama || !hadir) {
                alert('Mohon lengkapi nama dan kehadiran.');
                return;
            }

            try {
                await addDoc(collection(db, 'ucapan'), {
                    nama, hadir, jumlah, pesan,
                    timestamp: serverTimestamp(),
                    waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                });
                
                e.target.reset();
                tampilkanToast('Konfirmasi kehadiran berhasil dikirim!');
            } catch (error) {
                console.error("Error RSVP: ", error);
                alert("Gagal mengirim konfirmasi. Periksa koneksi internet Anda.");
            }
        });

    }, 1000); // Jeda 1 detik memastikan SDK Firebase termuat
});