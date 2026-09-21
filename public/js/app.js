// Logika Interaksi Utama Aplikasi Kahut Bank

document.addEventListener('DOMContentLoaded', () => {
    console.log('Kahut Bank App Ready');
});

// Fungsi simulasi proses transfer uang
function simulasiTransfer(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    // Ubah tombol jadi status loading
    submitBtn.disabled = true;
    submitBtn.innerText = 'Memproses...';

    setTimeout(() => {
        alert(' Transfer Berhasil!\nTransaksi Anda telah berhasil diproses oleh Kahut Bank.');
        
        // Reset form & tutup modal
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        closeTransferModal();
    }, 1200);
}

// Menutup modal jika area gelap di luar modal diklik
window.onclick = function(event) {
    const modal = document.getElementById('transferModal');
    if (event.target === modal) {
        closeTransferModal();
    }
};
