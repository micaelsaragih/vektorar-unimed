# VektorAR — Platform Edukasi Matematika Vektor 3D

VektorAR adalah aplikasi interaktif berbasis **WebAR (Web Augmented Reality)** dan **Three.js** yang dirancang khusus untuk pendidikan matematika di Universitas Negeri Medan (UNIMED). Aplikasi ini memungkinkan mahasiswa dan dosen untuk memvisualisasikan, membuat, dan berinteraksi dengan operasi vektor dalam ruang 3 dimensi dan dunia nyata.

## 🎯 Tujuan Edukasi
Matematika vektor sering kali sulit dipahami karena sifatnya yang abstrak. VektorAR mengubah konsep abstrak menjadi interaksi fisik:
- **Visualisasi Spasial:** Menampilkan vektor dalam 3D untuk pemahaman ruang yang lebih baik.
- **Eksperimen Interaktif:** Mahasiswa dapat mengubah koordinat secara real-time dan melihat perubahan arah secara instan.
- **Mode Pembelajaran (Tutorial):** Memecah operasi kompleks (seperti Cross Product) menjadi langkah-langkah visual dengan penjelasan teks yang mudah dipahami.
- **Augmented Reality:** Membawa laboratorium matematika langsung ke atas meja siswa menggunakan teknologi WebXR.

## ✨ Fitur Utama
1. **Dynamic Vector Input System:** Input koordinat vektor (x,y,z) secara real-time dengan validasi matematika.
2. **Sistem Operasi Lengkap:** Mendukung Penjumlahan, Pengurangan, Perkalian Skalar, Dot Product, dan Cross Product.
3. **Tutorial Mode:** Panduan visual step-by-step dengan penjelasan dinamis untuk setiap operasi matematika.
4. **Immersive WebAR:** Deteksi otomatis perangkat seluler. Jika didukung, aplikasi dapat menempatkan sistem vektor 3D di dunia nyata (ARCore/ARKit).
5. **Academic UI/UX:** Antarmuka responsif dengan desain *glassmorphism*, branding UNIMED, HUD (Heads-Up Display), dan optimasi sentuhan (touch-action) untuk perangkat mobile.

## 🏗️ Arsitektur Proyek
Aplikasi ini dibangun menggunakan pola desain modular (ES6 Modules) untuk menjaga skalabilitas dan performa:
- \`src/core/\`: Inisialisasi \`Engine.js\` (Three.js WebGL Renderer, Camera, Render Loop).
- \`src/math/\`: Logika murni matematika (\`VectorMath.js\`, \`VectorOperations.js\`, \`OperationManager.js\`).
- \`src/vectors/\`: Manajemen objek 3D (\`Vector3D.js\`, \`VectorFactory.js\`, \`DashedLine.js\`).
- \`src/education/\`: Sistem panduan edukasi (\`TutorialManager.js\`).
- \`src/input/\`: Sistem interaksi pengguna (\`VectorInputPanel.js\`).
- \`src/ui/\`: Antarmuka HTML/CSS overlay (\`ControlPanel.js\`, \`ExplanationPanel.js\`, \`HUD.js\`).
- \`src/ar/\`: Penanganan WebXR (\`ARSessionManager.js\`, \`HitTestManager.js\`).

## 🚀 Panduan Instalasi & Pengembangan

### Prasyarat
- Node.js (v16 atau lebih baru)
- NPM atau Yarn

### Menjalankan Server Lokal
1. Install dependensi:
   \`\`\`bash
   npm install
   \`\`\`
2. Jalankan server pengembangan lokal:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Buka tautan \`localhost\` di browser Anda.

### Panduan Deployment (Produksi)
Untuk mengemas proyek ke dalam bundel yang dioptimalkan:
\`\`\`bash
npm run build
\`\`\`
Hasil build akan berada di direktori \`dist/\`, siap untuk di-deploy ke Vercel, Netlify, atau GitHub Pages.

## 📱 Penggunaan di Perangkat Seluler (AR)
1. Akses aplikasi melalui Google Chrome di perangkat Android yang mendukung **ARCore**.
2. Klik tombol **"Mulai AR"** di pojok kanan atas.
3. Arahkan kamera ke permukaan datar yang terang (meja/lantai) hingga grid kalibrasi muncul.
4. Ketuk layar untuk menempatkan laboratorium vektor.
5. Gunakan antarmuka sentuh untuk mengubah input vektor dan menjalankan simulasi operasi.
