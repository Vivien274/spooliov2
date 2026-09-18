const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../audit_final.json'), 'utf8'));

const total = data.length;
const garderCount = data.filter(d => d.decision === 'GARDER').length;
const requalifierCount = data.filter(d => d.decision === 'REQUALIFIER').length;
const supprimerCount = data.filter(d => d.decision === 'SUPPRIMER').length;

const garderPct = ((garderCount / total) * 100).toFixed(1);
const requalifierPct = ((requalifierCount / total) * 100).toFixed(1);
const supprimerPct = ((supprimerCount / total) * 100).toFixed(1);

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Stratégique & Réglementaire du Catalogue Spoolio V2</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111726;
      --card-border: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.12);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.12);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --badge-border-s: rgba(16, 185, 129, 0.3);
      --badge-border-w: rgba(245, 158, 11, 0.3);
      --badge-border-d: rgba(239, 68, 68, 0.3);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 32px 24px 60px;
    }
    .container {
      max-width: 1440px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 15px;
      margin-top: 6px;
    }
    .roles-tag {
      display: inline-flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .role-badge {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 600;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .kpi-total::before { background: #64748b; }
    .kpi-garder::before { background: var(--success); }
    .kpi-requalifier::before { background: var(--warning); }
    .kpi-supprimer::before { background: var(--danger); }

    .kpi-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-value {
      font-size: 36px;
      font-weight: 800;
      margin: 8px 0 4px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .kpi-pct {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .kpi-desc {
      font-size: 13px;
      color: var(--text-muted);
    }

    .notice-box {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }
    .notice-col h3 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notice-col p {
      font-size: 13.5px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-wrap {
      flex: 1;
      min-width: 280px;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      font-size: 14px;
      padding: 10px 16px;
      border-radius: 10px;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .search-input:focus {
      border-color: var(--primary);
    }
    .filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-btn:hover {
      color: var(--text);
      border-color: #334155;
    }
    .filter-btn.active {
      background: #1e293b;
      color: #fff;
      border-color: var(--primary);
    }
    .filter-btn.btn-garder.active {
      background: var(--success-bg);
      border-color: var(--success);
      color: #34d399;
    }
    .filter-btn.btn-requalifier.active {
      background: var(--warning-bg);
      border-color: var(--warning);
      color: #fbbf24;
    }
    .filter-btn.btn-supprimer.active {
      background: var(--danger-bg);
      border-color: var(--danger);
      color: #f87171;
    }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13.5px;
    }
    th {
      background: #0d1322;
      color: #94a3b8;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 14px 18px;
      border-bottom: 1px solid var(--card-border);
      white-space: nowrap;
    }
    td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(30, 41, 59, 0.7);
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .col-id {
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-size: 12px;
    }
    .col-name {
      font-weight: 600;
      color: #f8fafc;
      max-width: 260px;
    }
    .col-cat {
      color: #94a3b8;
      font-size: 12.5px;
    }
    .col-price {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }
    .badge-garder {
      background: var(--success-bg);
      color: #34d399;
      border: 1px solid var(--badge-border-s);
    }
    .badge-requalifier {
      background: var(--warning-bg);
      color: #fbbf24;
      border: 1px solid var(--badge-border-w);
    }
    .badge-supprimer {
      background: var(--danger-bg);
      color: #f87171;
      border: 1px solid var(--badge-border-d);
    }
    .flag-yes {
      color: #f87171;
      font-weight: 600;
    }
    .flag-no {
      color: #64748b;
    }
    .flag-warning {
      color: #fbbf24;
      font-weight: 600;
    }
    .col-motif {
      color: #cbd5e1;
      font-size: 13px;
      line-height: 1.45;
      max-width: 480px;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
      font-size: 15px;
      display: none;
    }
    .export-btn {
      background: #1e293b;
      border: 1px solid #334155;
      color: #fff;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .export-btn:hover {
      background: #334155;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div>
          <h1>Audit Stratégique & Réglementaire du Catalogue Spoolio</h1>
          <p class="subtitle">Repositionnement Marque V2 : Desk Setup, Accessoires Gaming/Bureau, Art Toys & Fidgets Tactiles Haut de Gamme.</p>
          <div class="roles-tag">
            <span class="role-badge">🎨 Directeur Artistique</span>
            <span class="role-badge">💼 Chef de Produit E-commerce</span>
            <span class="role-badge">⚖️ Directive Jouets 2009/48/CE & RGSP 2023/988</span>
          </div>
        </div>
        <button class="export-btn" onclick="window.print()">🖨️ Imprimer / PDF</button>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card kpi-total">
        <div class="kpi-label">Produits Audités</div>
        <div class="kpi-value">${total}</div>
        <div class="kpi-desc">100% du catalogue actif audité</div>
      </div>
      <div class="kpi-card kpi-garder">
        <div class="kpi-label">À Garder (Cœur V2)</div>
        <div class="kpi-value">${garderCount} <span class="kpi-pct">(${garderPct}%)</span></div>
        <div class="kpi-desc">Desk setup, gaming, utilitaires & fidgets tactiles</div>
      </div>
      <div class="kpi-card kpi-requalifier">
        <div class="kpi-label">À Requalifier (+14 ans)</div>
        <div class="kpi-value">${requalifierCount} <span class="kpi-pct">(${requalifierPct}%)</span></div>
        <div class="kpi-desc">Art Toys, dioramas & sculptures (avertissement légal strict)</div>
      </div>
      <div class="kpi-card kpi-supprimer">
        <div class="kpi-label">À Supprimer / Dépublier</div>
        <div class="kpi-value">${supprimerCount} <span class="kpi-pct">(${supprimerPct}%)</span></div>
        <div class="kpi-desc">Babioles kermesse, mini-animaux cheap, gadgets enfantins</div>
      </div>
    </div>

    <div class="notice-box">
      <div class="notice-col">
        <h3>⚖️ Cadre Légal & Réglementaire</h3>
        <p><strong>Directive Jouets 2009/48/CE & Norme EN 71-1 :</strong> Tout produit ayant une valeur ludique perçue destinée aux moins de 14 ans est légalement un jouet. Les mini-animaux articulés (3-4€) présentent un risque immédiat d'ingestion de petits éléments en cas de casse (test du cylindre EN 71-1). Les figurines complexes conservées doivent obligatoirement afficher la mention légale : <em>"Objet de collection décoratif pour adultes (+14 ans) - Ne convient pas aux enfants"</em>.</p>
      </div>
      <div class="notice-col">
        <h3>📈 Impact E-commerce & Image de Marque</h3>
        <p><strong>Panier Moyen & Taux de Conversion :</strong> Les 124 articles babioles détruisent la valeur perçue de Spoolio, saturent le catalogue de micro-marges (2-4€) et cannibalisent les produits à fort panier (20-60€). L'épuration drastique positionne Spoolio en atelier d'impression 3D premium pour passionnés de tech, gaming et design de bureau.</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <input type="text" id="searchInput" class="search-input" placeholder="Rechercher par nom, catégorie, ID (ex: dragon, support, fidget)..." oninput="filterTable()">
      </div>
      <div class="filters">
        <button class="filter-btn active" data-filter="ALL" onclick="setFilter('ALL')">Tous (${total})</button>
        <button class="filter-btn btn-garder" data-filter="GARDER" onclick="setFilter('GARDER')">🟢 Garder (${garderCount})</button>
        <button class="filter-btn btn-requalifier" data-filter="REQUALIFIER" onclick="setFilter('REQUALIFIER')">🟡 Requalifier (${requalifierCount})</button>
        <button class="filter-btn btn-supprimer" data-filter="SUPPRIMER" onclick="setFilter('SUPPRIMER')">🔴 Supprimer (${supprimerCount})</button>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Trop Jouet ?</th>
            <th>Trop Cheap ?</th>
            <th>Décision</th>
            <th>Justification & Recommandation</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          ${data.map(p => {
            const decClass = p.decision === 'GARDER' ? 'badge-garder' : (p.decision === 'REQUALIFIER' ? 'badge-requalifier' : 'badge-supprimer');
            const decIcon = p.decision === 'GARDER' ? '🟢 GARDER' : (p.decision === 'REQUALIFIER' ? '🟡 REQUALIFIER' : '🔴 SUPPRIMER');
            
            const toyClass = p.tropJouet.toLowerCase().includes('oui') ? 'flag-yes' : (p.tropJouet.toLowerCase().includes('limite') ? 'flag-warning' : 'flag-no');
            const cheapClass = p.tropCheap.toLowerCase().includes('oui') ? 'flag-yes' : (p.tropCheap.toLowerCase().includes('limite') ? 'flag-warning' : 'flag-no');

            return `
            <tr data-decision="${p.decision}" data-search="${(p.name + ' ' + p.cats + ' ' + p.id + ' ' + p.motif).toLowerCase()}">
              <td class="col-id">#${p.id}</td>
              <td class="col-name">${p.name}</td>
              <td class="col-cat">${p.cats || '-'}</td>
              <td class="col-price">${p.price ? p.price.toFixed(2) + ' €' : '-'}</td>
              <td class="${toyClass}">${p.tropJouet}</td>
              <td class="${cheapClass}">${p.tropCheap}</td>
              <td><span class="badge ${decClass}">${decIcon}</span></td>
              <td class="col-motif">${p.motif}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div id="emptyState" class="empty-state">
        Aucun produit ne correspond à votre recherche ou filtre.
      </div>
    </div>
  </div>

  <script>
    let currentFilter = 'ALL';

    function setFilter(filter) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => {
        if (b.getAttribute('data-filter') === filter) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      filterTable();
    }

    function filterTable() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      const rows = document.querySelectorAll('#tableBody tr');
      let visible = 0;

      rows.forEach(r => {
        const dec = r.getAttribute('data-decision');
        const text = r.getAttribute('data-search');

        const matchFilter = (currentFilter === 'ALL' || dec === currentFilter);
        const matchSearch = (!q || text.includes(q));

        if (matchFilter && matchSearch) {
          r.style.display = '';
          visible++;
        } else {
          r.style.display = 'none';
        }
      });

      document.getElementById('emptyState').style.display = visible === 0 ? 'block' : 'none';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '../public/audit-catalogue-spoolio-v2.html'), html, 'utf8');
console.log('SUCCESS: public/audit-catalogue-spoolio-v2.html generated successfully.');
