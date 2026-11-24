# Ma Bible en ligne — Plan de développement

Ce fichier complète le `README.md` : le README explique **comment utiliser** le site, ce PLAN décrit **où on en est et ce qui reste à faire**.

> Ce projet est le premier prototype d'un objectif plus large : un réseau social 100 % chrétien. Le lecteur biblique sert de socle et de prétexte pour construire les briques réutilisables (comptes, contenus, communauté).

## Vision

Proposer une lecture de la Bible gratuite, claire et agréable en français et en anglais, avec des explications et des méditations, puis faire évoluer progressivement ce socle vers un espace communautaire chrétien.

## État actuel : prototype fonctionnel ✅

Le site est entièrement statique (HTML/CSS/JS), sans serveur ni installation. Les préférences restent dans le navigateur via `localStorage`.

### Phase 1 — Socle (terminée)

- [x] Structure de la page, thème sombre doré, mise en page responsive
- [x] Navigation dans les 66 livres, Ancien et Nouveau Testament, par catégories
- [x] Navigation par chapitre avec chapitres précédent/suivant
- [x] Liens directs vers un chapitre ou un verset (`#/livre/jean/3/16`)
- [x] Favicon et soins d'interface (focus clavier, Échap pour fermer, flèches ← / →)

### Phase 2 — Textes et versions (terminée)

- [x] Version Louis Segond 1910 complète (français)
- [x] Version King James complète (anglais)
- [x] Génération automatisée des fichiers `bible-*.js` via `scripts/generer-bibles.py` (API Bible.helloAO.org)
- [x] Mise en cache des téléchargements et option `--force` pour régénérer
- [x] Textes du domaine public, source indiquée dans le pied de page

### Phase 3 — Confort de lecture (terminée)

- [x] Recherche par nom de livre (avec filtres Ancien/Nouveau Testament)
- [x] Recherche plein texte dans les versets de la version active
- [x] Verset du jour
- [x] Reprise de la dernière lecture
- [x] Copie du lien de lecture
- [x] Mémorisation de la version choisie

### Phase 4 — Vérification (à confirmer)

- [ ] Parcours complet testé dans le navigateur sur toutes les vues
- [ ] Vérification des 66 livres × 2 versions (chapitres manquants, versets vides)
- [ ] Contrôle de la console navigateur (aucune erreur)
- [ ] Test clavier et lecteur d'écran sur les panneaux de lecture

## Contenu disponible aujourd'hui

| Version | Langue | Couverture |
| --- | --- | --- |
| Louis Segond 1910 | Français | 66 livres |
| King James Version | Anglais | 66 livres |

## Phase 5 — À venir

### Priorité haute

- [ ] **Explications et méditations** : chaque chapitre doit pouvoir afficher un commentaire court et une méditation (c'était prévu dès la première version de la page d'accueil)
- [ ] **Notes et marque-pages personnels** : surligner un verset, ajouter une note, retrouver ses favoris
- [ ] **Recherche améliorée** : gestion des accents, expressions exactes, filtre par livre

### Priorité moyenne

- [ ] Nouvelles traductions libres (Darby, Segment de King James, etc.)
- [ ] Partage d'un verset sous forme d'image
- [ ] Lecture audio ou mode concentration (texte seul, sans interface)
- [ ] Mode hors-ligne (PWA) pour lire sans connexion

### Priorité basse / long terme (vers le réseau social)

- [ ] Comptes utilisateurs et profils
- [ ] Groupes de lecture, discussions par chapitre, modération
- [ ] Publications et témoignages, avec règles de communauté
- [ ] Synchronisation des notes entre appareils (backend + base de données)

## Décisions techniques actuelles

| Sujet | Choix retenu |
| --- | --- |
| Hébergement | Aucun : fichiers statiques, ouvrables en double-cliquant sur `Index.html` |
| Données utilisateur | `localStorage` : `bible.version.v1`, `bible.derniere-lecture.v1` |
| Contenu | `bible-LSG.js` et `bible-KJV.js`, générés par `scripts/generer-bibles.py` |
| Logique | `app.js` (routage par hash, rendu, recherche, stockage local) |
| Design | `style.css`, variables CSS, panneaux modaux, `@media print` non prévu pour l'instant |
| Licence | Textes domaine public, récupérés depuis Bible.helloAO.org |

## Décisions à prendre avant la suite

1. Choisir le format des commentaires/méditations (fichiers JS générés, JSON statique ou CMS).
2. Décider si les notes personnelles restent locales ou nécessitent des comptes dès le départ.
3. Définir la charte de modération avant d'ouvrir la moindre fonctionnalité communautaire.
4. Prévoir une politique de confidentialité dès l'introduction des comptes.
