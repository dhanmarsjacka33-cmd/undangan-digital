// ===== ELEMEN =====
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

// ===== LIGHTBOX GALERI =====
function bukaLightbox(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox').classList.add('show');
}
function tutupLightbox() {
    document.getElementById('lightbox').classList.remove('show');
}

// ===== LOGIKA FIREBASE (RSVP & BUKU TAMU) =====
// Menunggu script module Firebase di index.html selesai dimuat
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.firebaseApp) {
            console.error("Firebase belum siap. Pastikan config sudah diisi di index.html.");
            return;
        }

        const { db, storage, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, ref, uploadBytes, getDownloadURL } = window.firebaseApp;
        const daftarUcapan = document.getElementById('daftarUcapan');

        // 1. RENDER UCAPAN REAL-TIME
        function renderUcapanRealtime() {
            const q = query(collection(db, 'ucapan'), orderBy('timestamp', 'desc'));
            onSnapshot(q, (snapshot) => {
                if (snapshot.empty) {
                    daftarUcapan.innerHTML = '<p style="text-align:center; color:var(--text-light);">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
                    return;
                }
                daftarUcapan.innerHTML = '';
                snapshot.forEach((doc) => {
                    const u = doc.data();
                    const item = document.createElement('div');
                    item.className = 'ucapan-item';
                    item.innerHTML = `
                        <strong>${u.nama}</strong>
                        <p>${u.pesan || '<em>Tidak ada pesan</em>'}</p>
                        <span class="hadir-badge">${u.hadir}${u.jumlah > 1 ? ` • ${u.jumlah} orang` : ''}</span>
                        <small style="display:block; margin-top:0.5rem; color:#888;">${u.waktu}</small>
                    `;
                    daftarUcapan.appendChild(item);
                });
            });
        }
        renderUcapanRealtime();

        // 2. FORM BUKU TAMU (UPLOAD FOTO)
        const formBukuTamu = document.getElementById('formBukuTamu');
        if (formBukuTamu) {
            formBukuTamu.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nama = document.getElementById('bt-nama').value;
                const pesan = document.getElementById('bt-pesan').value;
                const file = document.getElementById('bt-foto').files[0];
                const status = document.getElementById('statusUpload');

                status.textContent = 'Mengirim...';

                try {
                    let fotoURL = '';
                    if (file) {
                        const storageRef = ref(storage, `buku-tamu/${Date.now()}_${file.name}`);
                        const snapshot = await uploadBytes(storageRef, file);
                        fotoURL = await getDownloadURL(snapshot.ref);
                    }

                    await addDoc(collection(db, 'ucapan'), {
                        nama, pesan, fotoURL, hadir: "Hadir", jumlah: 1,
                        timestamp: serverTimestamp(),
                        waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                    });

                    status.textContent = 'Terima kasih! Buku tamu terkirim.';
                    formBukuTamu.reset();
                } catch (error) {
                    console.error("Error: ", error);
                    status.textContent = 'Gagal mengirim. Coba lagi.';
                }
            });
        }

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
                document.getElementById('ucapan').scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error("Error RSVP: ", error);
                alert("Gagal mengirim konfirmasi. Periksa koneksi internet Anda.");
            }
        });

    }, 1000); // Jeda 1 detik memastikan SDK Firebase termuat
});