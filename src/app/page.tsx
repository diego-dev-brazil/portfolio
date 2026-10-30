import { CaseStudies } from '../components/CaseStudies';
import { InteractiveBeach } from '../components/InteractiveBeach';
import { OceanBackdrop } from '../components/OceanBackdrop';
import { PixelFishSpotify } from '../components/PixelFishSpotify';
import { cases } from '../data/cases';

export default function HomePage() {
  return (
    <div className="ocean-world">
      <OceanBackdrop />

      {/* Top Navigation */}
      <header className="topbar">
        <div className="topbar-inner">
          <a className="wordmark" href="#inicio" aria-label="Início">
            <span className="wordmark-mark">
              <img
                src="/assets/fish/ClownFish.png"
                alt=""
                width={22}
                height={22}
                className="pixel-sprite"
              />
            </span>
            <span>Diego Augusto</span>
          </a>
          <nav className="top-nav" aria-label="Navegação principal">
            <a href="#inicio">Início</a>
            <a href="#projetos">Projetos</a>
            <a
              href="/diego-augusto-oliveira-cv.pdf"
              download="Diego_Augusto_Oliveira_CV.pdf"
              className="topnav-cv-link"
            >
              Currículo PDF ↓
            </a>
            <a
              href="https://www.linkedin.com/in/diego-augusto-7aa1a2303"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/diego-dev-brazil"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      {/* Interactive Beach Stage (Cabana = Sobre Mim, Livro = Stack & CV, Barco = Contato) */}
      <InteractiveBeach />

      {/* Main Content */}
      <main className="site-shell underwater-main">
        <section
          className="projects-section"
          id="projetos"
          aria-labelledby="projects-title"
        >
          <div className="section-heading">
            <div>
              <p className="micro-label">PORTFÓLIO // ENGENHARIA & IA</p>
              <h2 id="projects-title">Projetos em Destaque</h2>
            </div>
            <PixelFishSpotify />
          </div>

          <CaseStudies cases={cases} />
        </section>

        <footer className="site-footer" id="sistemas">
          <div className="seabed-decor" aria-hidden="true">
            <img
              src="/assets/fish/StarFish.png"
              alt=""
              width={32}
              height={32}
              className="pixel-sprite"
            />
            <img
              src="/assets/fish/StoneFish.png"
              alt=""
              width={32}
              height={32}
              className="pixel-sprite"
            />
          </div>
          <span>DIEGO AUGUSTO · @diego-dev-brazil</span>
          <a href="#inicio">Voltar ao topo ↑</a>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  );
}
