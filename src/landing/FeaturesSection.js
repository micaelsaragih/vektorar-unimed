export function FeaturesSection() {
  return `
    <section class="section" id="fitur">
      <div class="landing__container">
        <div class="section__header">
          <h2 class="section__title">Fitur Unggulan</h2>
          <p class="section__subtitle">Dirancang khusus untuk memfasilitasi pembelajaran matematika tingkat universitas melalui pendekatan interaktif.</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📐</div>
            <h3 class="feature-title">Input Dinamis</h3>
            <p class="feature-desc">Masukkan koordinat vektor secara bebas dan saksikan perubahan arah dan magnitudo dihitung ulang secara real-time.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3 class="feature-title">Tutorial Pembelajaran</h3>
            <p class="feature-desc">Pelajari setiap operasi (Penjumlahan, Perkalian Silang, dll.) secara bertahap melalui mode penjelasan interaktif.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">Mode WebAR</h3>
            <p class="feature-desc">Bawa sistem koordinat ke dunia nyata. Tempatkan vektor di atas meja belajar Anda menggunakan smartphone yang mendukung ARCore.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
