document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    
    // 1. Update CSS Variables (Magic)
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor || '#ff6b81');
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor || '#ffffff');
    
    // Safely format font family
    const fontStr = settings.fontFamily || 'Inter';
    document.documentElement.style.setProperty('--font-family', `"${fontStr}", sans-serif`);
    
    document.documentElement.style.setProperty('--hero-bg', `url('${settings.heroImage}')`);

    // 2. Load Google Fonts dynamically
    const dynamicFontLink = document.getElementById('dynamic-font');
    if (dynamicFontLink) {
      // Need to format the string for Google Fonts API (e.g. "Playfair Display" => "Playfair+Display")
      const fontUrlFriendly = fontStr.replace(/ /g, '+');
      dynamicFontLink.href = `https://fonts.googleapis.com/css2?family=${fontUrlFriendly}:wght@300;400;600;700;800&display=swap`;
    }

    // 3. Update Texts & Content
    const siteNameEls = document.querySelectorAll('#site-name');
    siteNameEls.forEach(el => el.textContent = settings.siteName || 'Boreal');

    const logoImg = document.getElementById('site-logo-img');
    const siteNameSpan = document.getElementById('site-name');
    if (settings.logoUrl) {
      logoImg.src = settings.logoUrl;
      logoImg.style.display = 'block';
      siteNameSpan.style.display = 'none'; // hide text if logo exists
    } else {
      logoImg.style.display = 'none';
      siteNameSpan.style.display = 'block';
    }
    
    document.title = settings.siteName || 'Boreal';
    
    document.getElementById('hero-title').textContent = settings.heroTitle;
    document.getElementById('hero-subtitle').textContent = settings.heroSubtitle;
    document.getElementById('footer-text').innerHTML = `&copy; ${new Date().getFullYear()} ${settings.siteName}. Derechos Reservados.`;

    // 4. Update Services Grid
    const servicesSection = document.getElementById('services');
    const servicesGrid = document.getElementById('services-grid');
    if (servicesSection && servicesGrid) {
      if (settings.services && Array.isArray(settings.services) && settings.services.length > 0) {
        servicesSection.style.display = 'block';
        servicesGrid.innerHTML = '';
        settings.services.forEach(service => {
          const card = document.createElement('div');
          card.className = 'card fade-in-up';
          card.innerHTML = `
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          `;
          servicesGrid.appendChild(card);
        });
      } else {
        servicesSection.style.display = 'none';
      }
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        nav.style.background = 'rgba(0, 0, 0, 0.8)';
      } else {
        nav.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    });

    // 5. Update Social Links
    const socialLinksContainer = document.getElementById('social-links');
    if (settings.socials && Array.isArray(settings.socials) && settings.socials.length > 0) {
      socialLinksContainer.innerHTML = '';
      settings.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.target = '_blank';
        a.textContent = social.name;
        socialLinksContainer.appendChild(a);
      });
    } else {
      socialLinksContainer.innerHTML = '';
    }

    // 5.5 Update About Section
    const aboutSection = document.getElementById('about');
    if (aboutSection && settings.about) {
      if (settings.about.title || settings.about.description || settings.about.image) {
        aboutSection.style.display = 'block';
        document.getElementById('about-title').textContent = settings.about.title || 'Nosotros';
        document.getElementById('about-desc').textContent = settings.about.description || '';
        const aboutImg = document.getElementById('about-image');
        if (settings.about.image) {
          aboutImg.src = settings.about.image;
          aboutImg.style.display = 'block';
        } else {
          aboutImg.style.display = 'none';
        }
      } else {
        aboutSection.style.display = 'none';
      }
    }

    // 6. Update Portfolio Grid
    const portfolioGrid = document.getElementById('portfolio-grid');
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioGrid && portfolioSection) {
      if (settings.portfolio && Array.isArray(settings.portfolio) && settings.portfolio.length > 0) {
        portfolioSection.style.display = 'block';
        portfolioGrid.innerHTML = '';
        settings.portfolio.forEach(item => {
          const a = document.createElement('a');
          a.className = 'portfolio-item fade-in-up';
          a.href = item.url || '#';
          a.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="portfolio-item-overlay">
              <h3>${item.title}</h3>
            </div>
          `;
          portfolioGrid.appendChild(a);
        });
      } else {
        portfolioSection.style.display = 'none';
      }
    }

  } catch (error) {
    console.error('Error fetching settings:', error);
  }
});
