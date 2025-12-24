import { initWebKit, type LogoLoader } from '@easemate/web-kit';

initWebKit({
  theme: 'default',
  styles: 'main',
  fonts: 'default',
  dev: {
    logLoads: true
  }
});

// Extended interface for logo loader with playIntro method
interface LogoLoaderWithMethods extends LogoLoader {
  playIntro(variant?: 'wave' | 'particle'): void;
}

// Logo loader demo controls
document.addEventListener('DOMContentLoaded', () => {
  const logoLoader = document.getElementById('demo-logo') as LogoLoaderWithMethods | null;
  const btnIntroWave = document.getElementById('btn-intro-wave');
  const btnIntroParticle = document.getElementById('btn-intro-particle');
  const btnLoadingToggle = document.getElementById('btn-loading-toggle');

  if (!logoLoader) {
    return;
  }

  // Play wave intro
  btnIntroWave?.addEventListener('click', () => {
    logoLoader.playIntro('wave');
  });

  // Play particle intro
  btnIntroParticle?.addEventListener('click', () => {
    logoLoader.playIntro('particle');
  });

  // Toggle loading state
  btnLoadingToggle?.addEventListener('click', () => {
    logoLoader.loading = !logoLoader.loading;
    if (btnLoadingToggle) {
      btnLoadingToggle.textContent = logoLoader.loading ? 'Stop Loading' : 'Start Loading';
    }
  });
});
