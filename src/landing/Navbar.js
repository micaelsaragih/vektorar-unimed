export function Navbar() {
  return `
    <nav class="landing-nav">
      <div class="landing-nav__brand">
        <img src="/foto/logounimed.png" alt="UNIMED" class="landing-nav__logo">
        VektorAR
      </div>
      <div class="landing-nav__links">
        <a href="#fitur" class="landing-nav__link">Fitur</a>
        <a href="#tentang" class="landing-nav__link">Tentang</a>
        <a href="#mulai" class="landing-nav__link btn-mulai-nav" style="color: var(--accent);">Visualisasi</a>
      </div>
    </nav>
  `;
}
