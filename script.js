// --- Kontrol Musik Latar ---
var musik = document.getElementById("musikLatar");
var tombol = document.getElementById("tombolMusik");

function kontrolMusik() {
    if (musik.paused) {
        musik.play();
        tombol.innerHTML = "🔇 Jeda Musik";
    } else {
        musik.pause();
        tombol.innerHTML = "🔊 Putar Musik";
    }
}

// --- (Opsional) Hitung Mundur ---
// Anda bisa menambahkan kode countdown di sini nanti.
// Contoh sederhana:
// const tanggalAcara = new Date("Dec 21, 2024 09:00:00").getTime();
// ... logika untuk menghitung selisih waktu ...
