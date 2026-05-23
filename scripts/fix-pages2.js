const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'app', '[locale]', 'admin', 'landing', 'sections');
const dirs = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory() && f !== '_components');

dirs.forEach(dir => {
  const pagePath = path.join(basePath, dir, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    content = content.replace(
      'let landingData = await getLandingSettings();\n  if (!landingData) landingData = { hero: {}, hero_slides: [], logos: [], stats: [], faqs: [], section_overrides: {} } as any;',
      'const landingData = (await getLandingSettings()) || ({ hero: {}, hero_slides: [], logos: [], stats: [], faqs: [], section_overrides: {} } as unknown as import("@/lib/validators/settings").LandingSettings);'
    );
    fs.writeFileSync(pagePath, content);
  }
});
