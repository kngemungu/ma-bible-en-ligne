/* Ma Bible en ligne — exploration, lecture et recherche.
   Les textes sont fournis par bible-LSG.js et bible-KJV.js. */
(function () {
  "use strict";

  const VERSIONS = {
    LSG: "Louis Segond",
    KJV: "King James"
  };

  const CATEGORIES = [
    { titre: "Pentateuque", testament: "AT", livres: [
      ["genese", "Genèse", "Gn", 50],
      ["exode", "Exode", "Ex", 40],
      ["levitique", "Lévitique", "Lv", 27],
      ["nombres", "Nombres", "Nb", 36],
      ["deuteronome", "Deutéronome", "Dt", 34]
    ]},
    { titre: "Livres historiques", testament: "AT", livres: [
      ["josue", "Josué", "Jos", 24],
      ["juges", "Juges", "Jg", 21],
      ["ruth", "Ruth", "Rt", 4],
      ["1-samuel", "1 Samuel", "1 S", 31],
      ["2-samuel", "2 Samuel", "2 S", 24],
      ["1-rois", "1 Rois", "1 R", 22],
      ["2-rois", "2 Rois", "2 R", 25],
      ["1-chroniques", "1 Chroniques", "1 Ch", 29],
      ["2-chroniques", "2 Chroniques", "2 Ch", 36],
      ["esdras", "Esdras", "Esd", 10],
      ["nehemie", "Néhémie", "Né", 13],
      ["esther", "Esther", "Est", 10]
    ]},
    { titre: "Poésie & sagesse", testament: "AT", livres: [
      ["job", "Job", "Jb", 42],
      ["psaumes", "Psaumes", "Ps", 150],
      ["proverbes", "Proverbes", "Pr", 31],
      ["ecclesiaste", "Ecclésiaste", "Ec", 12],
      ["cantique", "Cantique des cantiques", "Ct", 8]
    ]},
    { titre: "Livres prophétiques", testament: "AT", livres: [
      ["esaie", "Ésaïe", "És", 66],
      ["jeremie", "Jérémie", "Jr", 52],
      ["lamentations", "Lamentations", "La", 5],
      ["ezechiel", "Ézéchiel", "Éz", 48],
      ["daniel", "Daniel", "Dn", 12],
      ["osee", "Osée", "Os", 14],
      ["joel", "Joël", "Jl", 3],
      ["amos", "Amos", "Am", 9],
      ["abdias", "Abdias", "Ab", 1],
      ["jonas", "Jonas", "Jon", 4],
      ["michee", "Michée", "Mi", 7],
      ["nahum", "Nahum", "Na", 3],
      ["habacuc", "Habacuc", "Ha", 3],
      ["sophonie", "Sophonie", "So", 3],
      ["aggee", "Aggée", "Ag", 2],
      ["zacharie", "Zacharie", "Za", 14],
      ["malachie", "Malachie", "Ml", 4]
    ]},
    { titre: "Évangiles", testament: "NT", livres: [
      ["matthieu", "Matthieu", "Mt", 28],
      ["marc", "Marc", "Mc", 16],
      ["luc", "Luc", "Lc", 24],
      ["jean", "Jean", "Jn", 21]
    ]},
    { titre: "Histoire", testament: "NT", livres: [
      ["actes", "Actes des Apôtres", "Ac", 28]
    ]},
    { titre: "Lettres de Paul", testament: "NT", livres: [
      ["romains", "Romains", "Rm", 16],
      ["1-corinthiens", "1 Corinthiens", "1 Co", 16],
      ["2-corinthiens", "2 Corinthiens", "2 Co", 13],
      ["galates", "Galates", "Ga", 6],
      ["ephesiens", "Éphésiens", "Ép", 6],
      ["philippiens", "Philippiens", "Ph", 4],
      ["colossiens", "Colossiens", "Col", 4],
      ["1-thessaloniciens", "1 Thessaloniciens", "1 Th", 5],
      ["2-thessaloniciens", "2 Thessaloniciens", "2 Th", 3],
      ["1-timothee", "1 Timothée", "1 Tm", 6],
      ["2-timothee", "2 Timothée", "2 Tm", 4],
      ["tite", "Tite", "Tt", 3],
      ["philemon", "Philémon", "Phm", 1]
    ]},
    { titre: "Lettres générales", testament: "NT", livres: [
      ["hebreux", "Hébreux", "Hé", 13],
      ["jacques", "Jacques", "Jc", 5],
      ["1-pierre", "1 Pierre", "1 P", 5],
      ["2-pierre", "2 Pierre", "2 P", 3],
      ["1-jean", "1 Jean", "1 Jn", 5],
      ["2-jean", "2 Jean", "2 Jn", 1],
      ["3-jean", "3 Jean", "3 Jn", 1],
      ["jude", "Jude", "Jude", 1]
    ]},
    { titre: "Apocalypse", testament: "NT", livres: [
      ["apocalypse", "Apocalypse", "Ap", 22]
    ]}
  ];

  const LIVRES = CATEGORIES.flatMap(cat =>
    cat.livres.map(([id, nom, abbr, ch]) => ({
      id, nom, abbr, ch,
      categorie: cat.titre,
      testament: cat.testament
    }))
  );
  const PAR_ID = new Map(LIVRES.map(livre => [livre.id, livre]));

  const CLE_VERSION = "bible.version.v1";
  const CLE_DERNIERE_LECTURE = "bible.derniere-lecture.v1";
  const CLE_SURLIGNAGES = "bible.surlignages.v1";
  const COULEURS_SURLIGNAGE = ["or", "vert", "bleu", "rose"];
  const NOMS_COULEURS = { or: "or", vert: "vert", bleu: "bleu", rose: "rose" };
  const DUREE_APPUI_LONG = 550;
  const LONGUEUR_MIN_RECHERCHE = 3;

  const REFERENCES_VERSET_DU_JOUR = [
    { livre: "jean", chapitre: 3, verset: 16, theme: "L’amour de Dieu" },
    { livre: "psaumes", chapitre: 23, verset: 1, theme: "Confiance" },
    { livre: "proverbes", chapitre: 3, verset: 5, theme: "Confiance" },
    { livre: "esaie", chapitre: 41, verset: 10, theme: "Courage" },
    { livre: "matthieu", chapitre: 11, verset: 28, theme: "Repos" },
    { livre: "philippiens", chapitre: 4, verset: 6, theme: "Prière" },
    { livre: "romains", chapitre: 8, verset: 28, theme: "Espérance" },
    { livre: "josue", chapitre: 1, verset: 9, theme: "Courage" },
    { livre: "psaumes", chapitre: 119, verset: 105, theme: "Direction" },
    { livre: "1-corinthiens", chapitre: 13, verset: 4, theme: "Amour" },
    { livre: "galates", chapitre: 5, verset: 22, theme: "Fruit de l’Esprit" },
    { livre: "ephesiens", chapitre: 2, verset: 8, theme: "Grâce" },
    { livre: "hebreux", chapitre: 11, verset: 1, theme: "Foi" },
    { livre: "jacques", chapitre: 1, verset: 5, theme: "Sagesse" },
    { livre: "1-jean", chapitre: 4, verset: 19, theme: "Amour" },
    { livre: "psaumes", chapitre: 91, verset: 1, theme: "Refuge" },
    { livre: "matthieu", chapitre: 6, verset: 33, theme: "Royaume" },
    { livre: "romains", chapitre: 12, verset: 2, theme: "Transformation" },
    { livre: "2-timothee", chapitre: 1, verset: 7, theme: "Courage" },
    { livre: "jean", chapitre: 14, verset: 27, theme: "Paix" },
    { livre: "lamentations", chapitre: 3, verset: 23, theme: "Bonté" },
    { livre: "michee", chapitre: 6, verset: 8, theme: "Justice" },
    { livre: "actes", chapitre: 1, verset: 8, theme: "Témoignage" },
    { livre: "colossiens", chapitre: 3, verset: 23, theme: "Travail" },
    { livre: "1-pierre", chapitre: 5, verset: 7, theme: "Confiance" },
    { livre: "apocalypse", chapitre: 21, verset: 4, theme: "Espérance" },
    { livre: "esaie", chapitre: 40, verset: 31, theme: "Force" },
    { livre: "romains", chapitre: 15, verset: 13, theme: "Joie" },
    { livre: "nombres", chapitre: 6, verset: 24, theme: "Bénédiction" },
    { livre: "sophonie", chapitre: 3, verset: 17, theme: "Réjouissance" },
    { livre: "jean", chapitre: 8, verset: 12, theme: "Lumière" }
  ];

  /* ---------- Raccourcis et état ---------- */
  const voile = document.getElementById("voile");
  const panneau = document.getElementById("panneau");
  const selectionVersion = document.getElementById("version");
  const champRecherche = document.getElementById("recherche");
  const compteur = document.getElementById("compteur");
  const zoneVide = document.getElementById("vide");
  const zoneResultats = document.getElementById("resultats-versets");
  const compteurVersets = document.getElementById("compteur-versets");
  const listeVersets = document.getElementById("liste-versets");
  const zoneVersetJour = document.getElementById("verset-jour");
  const boutonRefVersetJour = document.getElementById("ref-verset-jour");
  const boutonReprise = document.getElementById("reprise-bouton");

  let testamentActif = "TOUT";
  let versionActive = "LSG";
  let dernierFocus = null;
  let minuteurFiltres = null;
  let indexVersets = [];
  let indexVersion = null;
  let referenceVersetJour = null;
  let surlignages = lireSurlignages();
  let paletteOuverte = null;
  let minuteurAppuiLong = null;
  let appuiLongDeclenche = false;

  /* ---------- Stockage local ---------- */
  function lireStockage(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }

  function ecrireStockage(cle, valeur) {
    try { localStorage.setItem(cle, valeur); } catch (e) { /* stockage indisponible */ }
  }

  function lireDerniereLecture() {
    try {
      const brut = JSON.parse(lireStockage(CLE_DERNIERE_LECTURE) || "null");
      if (!brut) return null;
      const livre = PAR_ID.get(brut.livreId);
      const chapitre = parseInt(brut.chapitre, 10);
      if (!livre || !Number.isFinite(chapitre) || chapitre < 1 || chapitre > livre.ch) return null;
      return {
        livreId: livre.id,
        chapitre,
        version: VERSIONS[brut.version] ? brut.version : "LSG",
        date: Number(brut.date) || 0
      };
    } catch (e) {
      return null;
    }
  }

  function enregistrerDerniereLecture(livre, numero) {
    ecrireStockage(CLE_DERNIERE_LECTURE, JSON.stringify({
      livreId: livre.id,
      chapitre: numero,
      version: versionActive,
      date: Date.now()
    }));
    mettreAJourReprise();
  }

  /* ---------- Surlignage et copie des versets ---------- */
  function cleVerset(livreId, chapitre, verset) {
    return versionActive + "|" + livreId + "|" + chapitre + "|" + verset;
  }

  function lireSurlignages() {
    try {
      const brut = JSON.parse(lireStockage(CLE_SURLIGNAGES) || "{}");
      if (!brut || typeof brut !== "object" || Array.isArray(brut)) return {};
      const propre = {};
      Object.keys(brut).forEach(cle => {
        if (COULEURS_SURLIGNAGE.indexOf(brut[cle]) !== -1) propre[cle] = brut[cle];
      });
      return propre;
    } catch (e) {
      return {};
    }
  }

  function enregistrerSurlignages() {
    ecrireStockage(CLE_SURLIGNAGES, JSON.stringify(surlignages));
  }

  function texteDuVerset(element) {
    const copie = element.cloneNode(true);
    const numero = copie.querySelector(".verset-num");
    if (numero) numero.remove();
    return copie.textContent.replace(/\s+/g, " ").trim();
  }

  function afficherToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toast._minuteur);
    toast._minuteur = setTimeout(() => toast.classList.remove("visible"), 1900);
  }

  function copierTexte(texte, bouton, message) {
    function confirmer() {
      if (bouton) {
        const libelle = bouton.textContent;
        bouton.textContent = message;
        setTimeout(() => { bouton.textContent = libelle; }, 1600);
      } else {
        afficherToast(message);
      }
    }

    function copieDeSecours() {
      const zone = document.createElement("textarea");
      zone.value = texte;
      zone.setAttribute("readonly", "");
      zone.style.position = "fixed";
      zone.style.opacity = "0";
      document.body.appendChild(zone);
      zone.select();
      let reussi = false;
      try { reussi = document.execCommand("copy"); } catch (e) { reussi = false; }
      document.body.removeChild(zone);
      if (reussi) confirmer();
      else if (bouton) bouton.textContent = "Copie impossible";
      else afficherToast("Copie impossible");
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(confirmer).catch(copieDeSecours);
    } else {
      copieDeSecours();
    }
  }

  function copierVerset(element) {
    const livre = PAR_ID.get(element.dataset.livre);
    if (!livre) return;
    const chapitre = parseInt(element.dataset.chapitre, 10);
    const verset = parseInt(element.dataset.verset, 10);
    const reference = livre.nom + " " + chapitre + ":" + verset;
    const texte = "« " + texteDuVerset(element) + " » — " + reference +
      " (" + nomVersion(versionActive) + ")";
    copierTexte(texte, null, "Verset copié ✓");
  }

  function fermerPalette() {
    if (!paletteOuverte) return;
    paletteOuverte.element.remove();
    paletteOuverte = null;
  }

  function ouvrirPalette(verset) {
    fermerPalette();
    const actuelle = verset.dataset.surlignage || "";
    const palette = document.createElement("div");
    palette.className = "palette-surlignage";
    palette.setAttribute("role", "group");
    palette.setAttribute("aria-label", "Couleurs de surlignage");
    palette.innerHTML =
      '<span class="palette-label">Surligner</span>' +
      COULEURS_SURLIGNAGE.map(couleur =>
        '<button type="button" class="palette-couleur" data-couleur="' + couleur + '"' +
        ' title="' + NOMS_COULEURS[couleur] + '" aria-label="Surligner en ' + NOMS_COULEURS[couleur] + '"' +
        ' style="--swatch:var(--couleur-' + couleur + ')"' +
        (actuelle === couleur ? ' aria-pressed="true"' : '') + '></button>'
      ).join("") +
      '<span class="palette-sep"></span>' +
      '<button type="button" class="palette-action" data-action-palette="copier">Copier</button>' +
      (actuelle ? '<button type="button" class="palette-action" data-couleur="aucun">Effacer</button>' : '');
    document.body.appendChild(palette);

    const rect = verset.getBoundingClientRect();
    const dimensions = palette.getBoundingClientRect();
    let gauche = rect.left;
    let haut = rect.bottom + 8;
    if (haut + dimensions.height > window.innerHeight - 8) haut = rect.top - dimensions.height - 8;
    gauche = Math.max(8, Math.min(gauche, window.innerWidth - dimensions.width - 8));
    palette.style.left = Math.max(8, gauche) + "px";
    palette.style.top = Math.max(8, haut) + "px";
    paletteOuverte = { element: palette, verset: verset };
    palette.querySelector("button").focus();
  }

  /* ---------- Utilitaires ---------- */
  const normaliser = (texte) => String(texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/\s+/g, " ")
    .trim();

  const echapper = (texte) => String(texte == null ? "" : texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  function nomVersion(version) {
    return VERSIONS[version] || version;
  }

  function chapitresDe(version, livreId) {
    const bible = (window.BIBLES && window.BIBLES[version]) || {};
    return bible[livreId] || null;
  }

  /* ---------- Pages et cartes de livres ---------- */
  function construireCarte(livre) {
    const carte = document.createElement("button");
    carte.type = "button";
    carte.className = "carte";
    carte.dataset.id = livre.id;
    carte.dataset.testament = livre.testament;
    carte.dataset.recherche = normaliser(
      livre.nom + " " + livre.abbr + " " + livre.categorie
    );
    carte.setAttribute("aria-label",
      livre.nom + ", " + livre.ch + " chapitre" + (livre.ch > 1 ? "s" : ""));
    carte.innerHTML =
      '<span class="carte-nom">' + echapper(livre.nom) + '</span>' +
      '<span class="carte-meta">' + livre.ch + ' chapitre' + (livre.ch > 1 ? 's' : '') + '</span>';
    return carte;
  }

  function construireGrille() {
    CATEGORIES.forEach(cat => {
      const zone = document.getElementById(cat.testament === "AT" ? "zone-at" : "zone-nt");
      const section = document.createElement("section");
      section.className = "categorie";
      section.dataset.testament = cat.testament;

      const titre = document.createElement("h3");
      titre.className = "titre-categorie";
      titre.textContent = cat.titre;
      section.appendChild(titre);

      const grille = document.createElement("div");
      grille.className = "grille";
      cat.livres.forEach(([id]) => {
        grille.appendChild(construireCarte(PAR_ID.get(id)));
      });
      section.appendChild(grille);
      zone.appendChild(section);
    });
  }

  /* ---------- Recherche dans les versets ---------- */
  function construireIndexVersets() {
    const bible = (window.BIBLES && window.BIBLES[versionActive]) || {};
    const entrees = [];

    LIVRES.forEach(livre => {
      const chapitres = bible[livre.id];
      if (!chapitres) return;
      Object.keys(chapitres)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(numero => {
          const versets = chapitres[numero];
          for (let i = 0; i < versets.length; i++) {
            entrees.push({
              livreId: livre.id,
              livreNom: livre.nom,
              testament: livre.testament,
              chapitre: numero,
              verset: i + 1,
              texte: versets[i],
              normalise: normaliser(versets[i])
            });
          }
        });
    });

    indexVersets = entrees;
    indexVersion = versionActive;
    return entrees;
  }

  function chercherVersets(requete, limite) {
    const recherche = normaliser(requete);
    if (recherche.length < LONGUEUR_MIN_RECHERCHE) {
      return { total: 0, resultats: [] };
    }
    if (indexVersion !== versionActive) construireIndexVersets();

    const resultats = [];
    let total = 0;
    for (let i = 0; i < indexVersets.length; i++) {
      const entree = indexVersets[i];
      if (testamentActif !== "TOUT" && entree.testament !== testamentActif) continue;
      if (entree.normalise.indexOf(recherche) === -1) continue;
      total++;
      if (resultats.length < limite) resultats.push(entree);
    }
    return { total, resultats };
  }

  function rendreResultatsVersets(requete) {
    const recherche = normaliser(requete);
    if (recherche.length < LONGUEUR_MIN_RECHERCHE) {
      zoneResultats.hidden = true;
      compteurVersets.textContent = "";
      listeVersets.innerHTML = "";
      return 0;
    }

    const resultat = chercherVersets(requete, 40);
    const total = resultat.total;
    zoneResultats.hidden = false;

    if (!total) {
      compteurVersets.textContent = "0 verset";
      listeVersets.innerHTML =
        '<p class="resultats-vide">Aucun verset ne contient « ' +
        echapper(requete.trim()) + ' » dans ' + echapper(nomVersion(versionActive)) + '.</p>';
      return 0;
    }

    compteurVersets.textContent = total + " verset" + (total > 1 ? "s" : "") +
      (total > resultat.resultats.length ? " · " + resultat.resultats.length + " premiers affichés" : "");

    listeVersets.innerHTML = resultat.resultats.map(entree =>
      '<button class="verset-resultat" type="button" data-ouvrir="' +
        entree.livreId + "/" + entree.chapitre + "/" + entree.verset + '">' +
        '<span class="verset-resultat-ref">' + echapper(entree.livreNom) + " " +
          entree.chapitre + ":" + entree.verset + '</span>' +
        '<span class="verset-resultat-texte">' + echapper(entree.texte) + '</span>' +
      '</button>'
    ).join("");

    return total;
  }

  function appliquerFiltres() {
    const recherche = normaliser(champRecherche.value);
    const totalVersets = rendreResultatsVersets(champRecherche.value);
    let visibles = 0;

    document.querySelectorAll(".carte").forEach(carte => {
      const correspondTexte = !recherche || carte.dataset.recherche.includes(recherche);
      const correspondTestament = testamentActif === "TOUT" ||
        carte.dataset.testament === testamentActif;
      const visible = correspondTexte && correspondTestament;
      carte.hidden = !visible;
      if (visible) visibles++;
    });

    document.querySelectorAll(".categorie").forEach(section => {
      const aUneCarte = section.querySelector(".carte:not([hidden])");
      section.hidden = !aUneCarte;
    });

    document.querySelectorAll("main .testament").forEach(section => {
      const aUneCategorie = section.querySelector(".categorie:not([hidden])");
      section.hidden = !aUneCategorie;
    });

    zoneVide.classList.toggle("visible", visibles === 0 && totalVersets === 0);

    if (visibles === 0 && totalVersets > 0) {
      compteur.textContent = "Aucun livre ne correspond · " + totalVersets +
        " verset" + (totalVersets > 1 ? "s" : "") + " trouvé" +
        (totalVersets > 1 ? "s" : "") + " ci-dessous.";
    } else if (visibles === 0) {
      compteur.textContent = "Aucun livre ne correspond à votre recherche.";
    } else if (!recherche && testamentActif === "TOUT") {
      compteur.textContent = "66 livres disponibles, Ancien et Nouveau Testament.";
    } else {
      compteur.textContent = visibles + " livre" + (visibles > 1 ? "s" : "") +
        " affiché" + (visibles > 1 ? "s" : "") +
        (totalVersets > 0 ? " · " + totalVersets + " verset" +
          (totalVersets > 1 ? "s" : "") + " trouvé" + (totalVersets > 1 ? "s" : "") : "");
    }
  }

  /* ---------- Verset du jour et reprise ---------- */
  function choisirVersetDuJour() {
    const debutAnnee = new Date(new Date().getFullYear(), 0, 0);
    const jour = Math.floor((Date.now() - debutAnnee.getTime()) / 86400000);
    const index = Math.abs(jour) % REFERENCES_VERSET_DU_JOUR.length;
    return REFERENCES_VERSET_DU_JOUR[index];
  }

  function rendreVersetDuJour() {
    if (!referenceVersetJour) referenceVersetJour = choisirVersetDuJour();
    const livre = PAR_ID.get(referenceVersetJour.livre);
    const chapitres = livre ? chapitresDe(versionActive, livre.id) : null;
    const versets = chapitres ? chapitres[referenceVersetJour.chapitre] : null;
    const texte = versets ? versets[referenceVersetJour.verset - 1] : null;

    if (!livre || !texte) {
      zoneVersetJour.hidden = true;
      return;
    }

    zoneVersetJour.hidden = false;
    document.getElementById("theme-verset-jour").textContent =
      referenceVersetJour.theme + " · " + nomVersion(versionActive);
    document.getElementById("texte-verset-jour").textContent = "« " + texte + " »";
    boutonRefVersetJour.textContent = livre.nom + " " +
      referenceVersetJour.chapitre + ":" + referenceVersetJour.verset;
    boutonRefVersetJour.dataset.hash = "#/livre/" + livre.id + "/" +
      referenceVersetJour.chapitre + "/" + referenceVersetJour.verset;
  }

  function mettreAJourReprise() {
    const zone = document.getElementById("reprise");
    const derniere = lireDerniereLecture();
    if (!derniere) {
      zone.hidden = true;
      return;
    }

    const livre = PAR_ID.get(derniere.livreId);
    document.getElementById("reprise-titre").textContent = livre.nom + " " + derniere.chapitre;
    document.getElementById("reprise-detail").textContent =
      nomVersion(derniere.version) + " · " + livre.ch + " chapitre" + (livre.ch > 1 ? "s" : "");
    zone.hidden = false;

    boutonReprise.onclick = function () {
      if (derniere.version !== versionActive) {
        versionActive = derniere.version;
        selectionVersion.value = versionActive;
        ecrireStockage(CLE_VERSION, versionActive);
        rendreVersetDuJour();
        appliquerFiltres();
      }
      naviguer("#/livre/" + derniere.livreId + "/" + derniere.chapitre);
    };
  }

  /* ---------- Panneau de lecture ---------- */
  function memoriserFocus() {
    const actif = document.activeElement;
    if (actif && actif !== document.body && !panneau.contains(actif)) {
      dernierFocus = actif;
    }
  }

  function ouvrirLivre(livre) {
    memoriserFocus();
    panneau.innerHTML =
      '<header class="panneau-entete">' +
        '<div class="panneau-titres">' +
          '<h2 class="panneau-titre" id="panneau-titre">' + echapper(livre.nom) + '</h2>' +
          '<p class="panneau-sous">' + livre.ch + ' chapitre' + (livre.ch > 1 ? 's' : '') +
            ' · ' + echapper(nomVersion(versionActive)) + '. Choisissez un chapitre.</p>' +
        '</div>' +
        '<button class="bouton-panneau" type="button" data-action="fermer">Fermer</button>' +
      '</header>' +
      '<div class="panneau-corps">' +
        '<div class="grille-chapitres">' +
          Array.from({ length: livre.ch }, (_, i) =>
            '<button class="chapitre" type="button" data-action="chapitre" data-chapitre="' + (i + 1) + '"' +
            ' aria-label="' + echapper(livre.nom) + ' chapitre ' + (i + 1) + '">' + (i + 1) + '</button>'
          ).join("") +
        '</div>' +
      '</div>';
    afficherVoile();
  }

  function ouvrirChapitre(livre, numero, versetCible) {
    memoriserFocus();

    const chapitres = chapitresDe(versionActive, livre.id);
    const versets = chapitres ? chapitres[numero] : null;
    const nom = nomVersion(versionActive);
    let contenu;

    if (Array.isArray(versets) && versets.length) {
      contenu = '<div class="lecture-texte">' +
        versets.map((verset, i) => {
          const n = i + 1;
          const classes = versetCible === n ? ["verset", "verset-cible"] : ["verset"];
          const couleur = surlignages[cleVerset(livre.id, numero, n)];
          return '<p class="' + classes.join(" ") + '" id="verset-' + n + '"' +
            ' data-livre="' + livre.id + '" data-chapitre="' + numero + '" data-verset="' + n + '"' +
            (couleur ? ' data-surlignage="' + couleur + '"' : '') +
            ' tabindex="0" title="Clic : couleur · Clic droit ou appui long : copier">' +
            '<span class="verset-num" aria-hidden="true">' + n + '</span>' +
            echapper(verset) +
          '</p>';
        }).join("") +
      '</div>';
    } else {
      contenu =
        '<div class="lecture-vide">' +
          'Le texte de <strong>' + echapper(livre.nom) + ' ' + numero + '</strong> (' +
          echapper(nom) + ') n’est pas disponible pour le moment.' +
        '</div>';
    }

    panneau.innerHTML =
      '<header class="panneau-entete">' +
        '<button class="bouton-panneau" type="button" data-action="chapitres">Chapitres</button>' +
        '<div class="panneau-titres">' +
          '<h2 class="panneau-titre" id="panneau-titre">' + echapper(livre.nom) + ' ' + numero + '</h2>' +
          '<p class="panneau-sous">Chapitre ' + numero + ' sur ' + livre.ch + ' · ' +
            echapper(nom) + '.</p>' +
        '</div>' +
        '<div class="panneau-actions">' +
          '<button class="bouton-panneau" type="button" data-action="copier">Copier le lien</button>' +
          '<button class="bouton-panneau" type="button" data-action="fermer">Fermer</button>' +
        '</div>' +
      '</header>' +
      '<div class="panneau-corps">' +
        '<div class="lecture">' +
          '<p class="lecture-astuce">Clic sur un verset : choisir une couleur · Clic droit ou appui long : copier.</p>' +
          contenu +
          '<div class="navigation-lecture">' +
            '<button class="nav-bouton" type="button" data-action="precedent"' +
              (numero <= 1 ? ' disabled' : '') + '>← Chapitre précédent</button>' +
            '<button class="nav-bouton" type="button" data-action="suivant"' +
              (numero >= livre.ch ? ' disabled' : '') + '>Chapitre suivant →</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    enregistrerDerniereLecture(livre, numero);
    afficherVoile(versetCible);
  }

  function afficherVoile(versetCible) {
    fermerPalette();
    voile.hidden = false;
    document.body.style.overflow = "hidden";

    const corps = panneau.querySelector(".panneau-corps");
    if (corps) corps.scrollTop = 0;

    if (versetCible && corps) {
      const cible = panneau.querySelector("#verset-" + versetCible);
      if (cible) {
        requestAnimationFrame(() => {
          cible.scrollIntoView({ block: "center" });
        });
      }
    }

    panneau.focus({ preventScroll: true });
  }

  function cacherVoile() {
    fermerPalette();
    voile.hidden = true;
    document.body.style.overflow = "";
    if (dernierFocus && document.contains(dernierFocus)) {
      dernierFocus.focus({ preventScroll: true });
    }
    dernierFocus = null;
  }

  function copierLien(bouton) {
    copierTexte(location.href, bouton, "Lien copié ✓");
  }

  /* ---------- Routage ---------- */
  function chapitreDansUrl() {
    const correspondance = (location.hash || "").match(/^#\/livre\/([a-z0-9-]+)\/(\d+)/);
    if (!correspondance) return null;
    const livre = PAR_ID.get(correspondance[1]);
    if (!livre) return null;
    const chapitre = parseInt(correspondance[2], 10);
    if (!Number.isFinite(chapitre)) return null;
    return { livre, chapitre: Math.min(Math.max(chapitre, 1), livre.ch) };
  }

  function router() {
    const hash = location.hash || "";
    const correspondance = hash.match(/^#\/livre\/([a-z0-9-]+)(?:\/(\d+))?(?:\/(\d+))?/);

    if (!correspondance) {
      cacherVoile();
      panneau.innerHTML = "";
      return;
    }

    const livre = PAR_ID.get(correspondance[1]);
    if (!livre) {
      cacherVoile();
      panneau.innerHTML = "";
      return;
    }

    if (correspondance[2]) {
      const numero = Math.min(Math.max(parseInt(correspondance[2], 10), 1), livre.ch);
      const verset = correspondance[3] ? Math.max(parseInt(correspondance[3], 10), 1) : null;
      ouvrirChapitre(livre, numero, verset);
    } else {
      ouvrirLivre(livre);
    }
  }

  function naviguer(hash) {
    if (location.hash === hash) {
      router();
    } else {
      location.hash = hash;
    }
  }

  function fermerPanneau() {
    if (location.hash) {
      history.pushState(null, "", location.pathname + location.search);
      router();
    } else {
      cacherVoile();
    }
  }

  /* ---------- Événements ---------- */
  champRecherche.addEventListener("input", function () {
    clearTimeout(minuteurFiltres);
    minuteurFiltres = setTimeout(appliquerFiltres, 120);
  });

  document.querySelectorAll(".filtre").forEach(bouton => {
    bouton.addEventListener("click", function () {
      testamentActif = bouton.dataset.testament;
      document.querySelectorAll(".filtre").forEach(b => {
        b.setAttribute("aria-pressed", b === bouton ? "true" : "false");
      });
      appliquerFiltres();
    });
  });

  selectionVersion.addEventListener("change", function () {
    versionActive = selectionVersion.value;
    ecrireStockage(CLE_VERSION, versionActive);
    rendreVersetDuJour();
    appliquerFiltres();
    router();
  });

  document.querySelectorAll("#zone-at, #zone-nt").forEach(zone => {
    zone.addEventListener("click", function (e) {
      const carte = e.target.closest(".carte");
      if (!carte) return;
      naviguer("#/livre/" + carte.dataset.id);
    });
  });

  panneau.addEventListener("click", function (e) {
    const verset = e.target.closest(".verset");
    if (verset) {
      if (appuiLongDeclenche) {
        appuiLongDeclenche = false;
        return;
      }
      if (window.getSelection && String(window.getSelection()).trim()) return;
      e.preventDefault();
      e.stopPropagation();
      ouvrirPalette(verset);
      return;
    }
    const bouton = e.target.closest("[data-action]");
    if (!bouton) return;
    const action = bouton.dataset.action;
    const correspondance = (location.hash || "").match(/^#\/livre\/([a-z0-9-]+)(?:\/(\d+))?/);
    if (!correspondance) return;
    const livre = PAR_ID.get(correspondance[1]);
    const chapitre = correspondance[2] ? parseInt(correspondance[2], 10) : null;
    if (!livre) return;

    switch (action) {
      case "fermer":
        fermerPanneau();
        break;
      case "chapitres":
        naviguer("#/livre/" + livre.id);
        break;
      case "chapitre":
        naviguer("#/livre/" + livre.id + "/" + bouton.dataset.chapitre);
        break;
      case "precedent":
        if (chapitre && chapitre > 1) naviguer("#/livre/" + livre.id + "/" + (chapitre - 1));
        break;
      case "suivant":
        if (chapitre && chapitre < livre.ch) naviguer("#/livre/" + livre.id + "/" + (chapitre + 1));
        break;
      case "copier":
        copierLien(bouton);
        break;
    }
  });

  panneau.addEventListener("contextmenu", function (e) {
    const verset = e.target.closest(".verset");
    if (!verset) return;
    e.preventDefault();
    fermerPalette();
    copierVerset(verset);
  });

  panneau.addEventListener("pointerdown", function (e) {
    const verset = e.target.closest(".verset");
    if (!verset) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    appuiLongDeclenche = false;
    clearTimeout(minuteurAppuiLong);
    minuteurAppuiLong = setTimeout(() => {
      if (window.getSelection && String(window.getSelection()).trim()) return;
      appuiLongDeclenche = true;
      fermerPalette();
      copierVerset(verset);
    }, DUREE_APPUI_LONG);
  });

  panneau.addEventListener("pointerup", function () {
    clearTimeout(minuteurAppuiLong);
  });

  ["pointercancel", "pointerleave"].forEach(type => {
    panneau.addEventListener(type, function () {
      clearTimeout(minuteurAppuiLong);
      appuiLongDeclenche = false;
    });
  });

  panneau.addEventListener("keydown", function (e) {
    const verset = e.target.closest(".verset");
    if (!verset) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ouvrirPalette(verset);
    }
  });

  document.addEventListener("click", function (e) {
    if (!paletteOuverte) return;
    const action = e.target.closest("[data-couleur], [data-action-palette]");
    if (action && paletteOuverte.element.contains(action)) {
      e.preventDefault();
      e.stopPropagation();
      const verset = paletteOuverte.verset;
      if (action.dataset.actionPalette === "copier") {
        copierVerset(verset);
      } else {
        const couleur = action.dataset.couleur;
        const cle = cleVerset(verset.dataset.livre, verset.dataset.chapitre, verset.dataset.verset);
        if (couleur === "aucun") delete surlignages[cle];
        else surlignages[cle] = couleur;
        enregistrerSurlignages();
        if (couleur === "aucun") verset.removeAttribute("data-surlignage");
        else verset.setAttribute("data-surlignage", couleur);
        verset.classList.remove("surlignage-neuf");
        void verset.offsetWidth;
        verset.classList.add("surlignage-neuf");
      }
      fermerPalette();
      return;
    }
    if (!paletteOuverte.element.contains(e.target)) fermerPalette();
  });

  listeVersets.addEventListener("click", function (e) {
    const bouton = e.target.closest("[data-ouvrir]");
    if (!bouton) return;
    naviguer("#/livre/" + bouton.dataset.ouvrir);
  });

  boutonRefVersetJour.addEventListener("click", function () {
    if (boutonRefVersetJour.dataset.hash) {
      naviguer(boutonRefVersetJour.dataset.hash);
    }
  });

  voile.addEventListener("click", function (e) {
    if (e.target === voile) fermerPanneau();
  });

  document.addEventListener("keydown", function (e) {
    if (voile.hidden) return;

    if (e.key === "Escape") {
      if (paletteOuverte) {
        fermerPalette();
        return;
      }
      fermerPanneau();
      return;
    }

    if (e.key === "Tab") {
      const elements = Array.from(panneau.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null);
      if (!elements.length) return;
      const premier = elements[0];
      const dernier = elements[elements.length - 1];
      if (!panneau.contains(document.activeElement)) {
        e.preventDefault();
        premier.focus();
      } else if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const actif = document.activeElement;
      if (actif && actif.closest("input, select, textarea")) return;
      const courant = chapitreDansUrl();
      if (!courant) return;
      if (e.key === "ArrowLeft" && courant.chapitre > 1) {
        e.preventDefault();
        naviguer("#/livre/" + courant.livre.id + "/" + (courant.chapitre - 1));
      } else if (e.key === "ArrowRight" && courant.chapitre < courant.livre.ch) {
        e.preventDefault();
        naviguer("#/livre/" + courant.livre.id + "/" + (courant.chapitre + 1));
      }
    }
  });

  window.addEventListener("hashchange", router);
  window.addEventListener("popstate", router);

  /* ---------- Démarrage ---------- */
  const versionEnregistree = lireStockage(CLE_VERSION);
  if (VERSIONS[versionEnregistree]) versionActive = versionEnregistree;
  selectionVersion.value = versionActive;

  construireGrille();
  rendreVersetDuJour();
  mettreAJourReprise();
  appliquerFiltres();
  router();

  function preparerIndexEnArrierePlan() {
    const lancer = () => {
      if (indexVersion !== versionActive) construireIndexVersets();
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(lancer, { timeout: 3000 });
    } else {
      setTimeout(lancer, 1200);
    }
  }
  preparerIndexEnArrierePlan();
})();
