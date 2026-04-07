document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check Auth (Redirect if not logged in)
  const authRes = await fetch('/api/auth/check');
  if (!authRes.ok) {
    window.location.href = '/admin/login.html';
    return;
  }

  // 2. Fetch Current Settings
  let currentSettings = {};
  let dataLoaded = false;
  const btnSave = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');

  btnSave.disabled = true;
  saveStatus.textContent = '⏳ Cargando configuración...';

  try {
    const res = await fetch('/api/settings');
    currentSettings = await res.json();
    populateForm(currentSettings);
    dataLoaded = true;
    btnSave.disabled = false;
    saveStatus.textContent = '';
  } catch(e) {
    console.error('Failed to load settings', e);
    saveStatus.textContent = '❌ Error al cargar configuración';
  }

  // 3. Populate Form
  function populateForm(settings) {
    document.getElementById('siteName').value = settings.siteName || '';
    document.getElementById('logoUrl').value = settings.logoUrl || '';
    document.getElementById('primaryColor').value = settings.primaryColor || '#ff6b81';
    document.getElementById('secondaryColor').value = settings.secondaryColor || '#ffffff';
    document.getElementById('fontFamily').value = settings.fontFamily || 'Inter';
    document.getElementById('heroTitle').value = settings.heroTitle || '';
    document.getElementById('heroSubtitle').value = settings.heroSubtitle || '';
    document.getElementById('heroImage').value = settings.heroImage || '';

    if (settings.about) {
      document.getElementById('aboutTitle').value = settings.about.title || '';
      document.getElementById('aboutDesc').value = settings.about.description || '';
      document.getElementById('aboutImage').value = settings.about.image || '';
    }

    // Color labels
    document.getElementById('primaryColorVal').textContent = document.getElementById('primaryColor').value;
    document.getElementById('secondaryColorVal').textContent = document.getElementById('secondaryColor').value;

    renderSocials(settings.socials || []);
    renderPortfolio(settings.portfolio || []);
    renderServices(settings.services || []);
  }

  // Live color update
  document.getElementById('primaryColor').addEventListener('input', (e) => {
    document.getElementById('primaryColorVal').textContent = e.target.value;
  });
  document.getElementById('secondaryColor').addEventListener('input', (e) => {
    document.getElementById('secondaryColorVal').textContent = e.target.value;
  });

  // Socials logic
  const socialsContainer = document.getElementById('socials-container');
  let socialsArr = [];

  function renderSocials(socials) {
    socialsArr = socials;
    socialsContainer.innerHTML = '';
    socials.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="form-group">
          <label>Nombre (ej. Instagram)</label>
          <input type="text" value="${s.name}" onchange="updateSocial(${idx}, 'name', this.value)">
        </div>
        <div class="form-group">
          <label>Enlace (URL)</label>
          <input type="text" value="${s.url}" placeholder="https://" onchange="updateSocial(${idx}, 'url', this.value)">
        </div>
        <button type="button" class="btn btn-danger" onclick="removeSocial(${idx})">Eliminar</button>
      `;
      socialsContainer.appendChild(div);
    });
  }

  window.updateSocial = (index, key, value) => {
    socialsArr[index][key] = value;
  };

  window.removeSocial = (index) => {
    socialsArr.splice(index, 1);
    renderSocials(socialsArr);
  };

  document.getElementById('add-social-btn').addEventListener('click', () => {
    socialsArr.push({ name: 'Nueva Red', url: 'https://' });
    renderSocials(socialsArr);
  });

  // Services logic
  const servicesContainer = document.getElementById('services-container');
  let servicesArr = [];

  function renderServices(services) {
    servicesArr = services;
    servicesContainer.innerHTML = '';
    services.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="form-group">
          <label>Título del Servicio</label>
          <input type="text" value="${s.title}" onchange="updateService(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input type="text" value="${s.description}" onchange="updateService(${idx}, 'description', this.value)">
        </div>
        <button type="button" class="btn btn-danger" onclick="removeService(${idx})">Eliminar</button>
      `;
      servicesContainer.appendChild(div);
    });
  }

  window.updateService = (index, key, value) => {
    servicesArr[index][key] = value;
  };

  window.removeService = (index) => {
    servicesArr.splice(index, 1);
    renderServices(servicesArr);
  };

  document.getElementById('add-service-btn').addEventListener('click', () => {
    servicesArr.push({ title: 'Nuevo Servicio', description: 'Descripción...' });
    renderServices(servicesArr);
  });

  // Portfolio logic
  const portfolioContainer = document.getElementById('portfolio-container');
  let portfolioArr = [];

  function renderPortfolio(portfolio) {
    portfolioArr = portfolio;
    portfolioContainer.innerHTML = '';
    portfolio.forEach((p, idx) => {
      const div = document.createElement('div');
      div.className = 'service-item';
      div.innerHTML = `
        <div class="form-group">
          <label>Título del Trabajo</label>
          <input type="text" value="${p.title}" onchange="updatePortfolio(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label>Imagen de Portada (URL o Subir Archivo)</label>
          <div style="display:flex; gap:10px;">
            <input type="text" value="${p.image}" onchange="updatePortfolio(${idx}, 'image', this.value)" id="portUrl_${idx}" style="flex:1;">
            <input type="file" accept="image/*" class="btn" style="width:auto; padding:5px;" onchange="uploadPortfolioFile(event, ${idx})">
          </div>
        </div>
        <div class="form-group">
          <label>Enlace del Portfolio (Opcional)</label>
          <input type="text" value="${p.url}" onchange="updatePortfolio(${idx}, 'url', this.value)">
        </div>
        <button type="button" class="btn btn-danger" onclick="removePortfolio(${idx})">Eliminar</button>
      `;
      portfolioContainer.appendChild(div);
    });
  }

  // Upload handler for Portfolio dynamically
  window.uploadPortfolioFile = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('portUrl_' + index).value = data.url;
        updatePortfolio(index, 'image', data.url);
        alert('Imagen de portfolio subida con éxito!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error contactando servidor falló upload');
    }
  };

  window.updatePortfolio = (index, key, value) => {
    portfolioArr[index][key] = value;
  };

  window.removePortfolio = (index) => {
    portfolioArr.splice(index, 1);
    renderPortfolio(portfolioArr);
  };

  document.getElementById('add-portfolio-btn').addEventListener('click', () => {
    portfolioArr.push({ title: 'Nuevo Trabajo', image: 'https://', url: '#' });
    renderPortfolio(portfolioArr);
  });

  // --- UPLOAD HANDLERS ---
  const handleUpload = async (inputId, targetTextId) => {
    const fileInput = document.getElementById(inputId);
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData // cookies pasaran automáticamente el token
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById(targetTextId).value = data.url;
        alert('¡Archivo subido exitosamente!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Ocurrió un error en la subida.');
    }
  };

  document.getElementById('logoUpload').addEventListener('change', () => handleUpload('logoUpload', 'logoUrl'));
  document.getElementById('heroUpload').addEventListener('change', () => handleUpload('heroUpload', 'heroImage'));
  document.getElementById('aboutUpload').addEventListener('change', () => handleUpload('aboutUpload', 'aboutImage'));


  // 4. Save Settings
  document.getElementById('save-btn').addEventListener('click', async () => {
    if (!dataLoaded) return;
    const btn = document.getElementById('save-btn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;

    const newSettings = {
      siteName: document.getElementById('siteName').value,
      logoUrl: document.getElementById('logoUrl').value,
      primaryColor: document.getElementById('primaryColor').value,
      secondaryColor: document.getElementById('secondaryColor').value,
      fontFamily: document.getElementById('fontFamily').value,
      heroTitle: document.getElementById('heroTitle').value,
      heroSubtitle: document.getElementById('heroSubtitle').value,
      heroImage: document.getElementById('heroImage').value,
      about: {
        title: document.getElementById('aboutTitle').value,
        description: document.getElementById('aboutDesc').value,
        image: document.getElementById('aboutImage').value
      },
      services: servicesArr,
      socials: socialsArr,
      portfolio: portfolioArr
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if(res.ok) {
        document.getElementById('save-status').textContent = '✅ ¡Cambios guardados con éxito!';
        setTimeout(() => document.getElementById('save-status').textContent = '', 3000);
      } else {
        alert('Error al guardar');
      }
    } catch(e) {
      alert('Error de conexión');
    }

    btn.textContent = 'Guardar Cambios';
    btn.disabled = false;
  });
});
