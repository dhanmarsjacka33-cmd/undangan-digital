// ===== ELEMEN =====
const cover = document.getElementById('cover');
const bukaBtn = document.getElementById('bukaUndangan');
const musik = document.getElementById('musikLatar');
const tombolMusik = document.getElementById('tombolMusik');
const musikIkon = document.getElementById('musikIkon');
const nav = document.getElementById('nav');

// ===== COVER → BUKA UNDANGAN =====
bukaBtn.addEventListener('click', () => {
    cover.classList.add('hidden');
    tombolMusik.classList.add('show');
    nav.classList.add('show');
    musik.play().then(() => {
        tombolMusik.classList.add('playing');
        musikIkon.textContent = '🔇';
    }).catch(() => {
        musikIkon.textContent = '🎵';
    });
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

// ===== COUNTDOWN =====
// ⚠️ GANTI tanggal acara: format YYYY-MM-DDTHH:MM:SS
const tanggalAcara = new Date('2024-12-21T09:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const diff = tanggalAcara - now;

    if (diff < 0) {
        document.getElementById('countdown').innerHTML =
            '<p style="color:var(--primary-dark);font-size:1.1rem;">Alhamdulillah, acara telah berlangsung 🎉</p>';
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
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== SALIN TEKS =====
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

// ===== LIGHTBOX =====
function bukaLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('show');
}
function tutupLightbox() {
    document.getElementById('lightbox').classList.remove('show');
}

// ===== RSVP =====
// ⚠️ Ganti nomor WA di bawah (awali 62, tanpa 0). Kosongkan ('') untuk nonaktifkan.
const WA_NOMOR = '6281234567890';

document.getElementById('rsvpForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nama   = document.getElementById('rsvp-nama').value.trim();
    const hadir  = document.getElementById('rsvp-hadir').value;
    const jumlah = document.getElementById('rsvp-jumlah').value;
    const pesan  = document.getElementById('rsvp-pesan').value.trim();

    if (!nama || !hadir) {
        alert('Mohon lengkapi nama dan kehadiran.');
        return;
    }

    // Simpan lokal
    const ucapan = JSON.parse(localStorage.getItem('ucapan') || '[]');
    ucapan.unshift({
        nama, hadir, jumlah, pesan,
        waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    });
    localStorage.setItem('ucapan', JSON.stringify(ucapan));

    // Kirim via WhatsApp (jika nomor diisi)
    if (WA_NOMOR) {
        const text = encodeURIComponent(
            `*Konfirmasi Kehadiran*\n\n` +
            `Nama    : ${nama}\n` +
            `Hadir   : ${hadir}\n` +
            `Jumlah  : ${jumlah} orang\n` +
            `Pesan   : ${pesan || '-'}`
        );
        window.open(`https://wa.me/${WA_NOMOR}?text=${text}`, '_blank');
    }

    e.target.reset();
    renderUcapan();
    document.getElementById('ucapan').scrollIntoView({ behavior: 'smooth' });
});

// ===== RENDER UCAPAN =====
function renderUcapan() {
    const daftar = document.getElementById('daftarUcapan');
    const ucapan = JSON.parse(localStorage.getItem('ucapan') || '[]');

    if (ucapan.length === 0) {
        daftar.innerHTML =
            '<p style="text-align:center;color:var(--text-light);">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
        return;
    }
    daftar.innerHTML = ucapan.map(u => `
        <div class="ucapan-item">
            <strong>${escapeHtml(u.nama)}</strong>
            <p>${escapeHtml(u.pesan) || '<em>Tidak ada pesan</em>'}</p>
            <span class="hadir-badge">${escapeHtml(u.hadir)}${u.jumlah > 1 ? ` • ${u.jumlah} orang` : ''}</span>
            <small>${escapeHtml(u.waktu)}</small>
        </div>
    `).join('');
}
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}
renderUcapan();

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.section, .countdown-section');
revealEls.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('active'); });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));