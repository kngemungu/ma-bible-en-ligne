# Ma Bible en ligne

Prototype de lecteur biblique : parcourir les 66 livres, lire un chapitre, rechercher un livre ou un mot, et retrouver sa dernière lecture.

## Lancer le site

Ouvrez `Index.html` dans un navigateur. Aucune installation et aucun serveur ne sont nécessaires.

La version choisie et la dernière lecture sont mémorisées dans le `localStorage` du navigateur.

## Fonctionnalités

- 66 livres, Ancien et Nouveau Testament.
- Deux versions complètes : **Louis Segond 1910** (français) et **King James Version** (anglais).
- Navigation par livre puis par chapitre, avec chapitres précédent/suivant.
- Lien direct vers un chapitre ou un verset : `#/livre/jean/3/16`.
- Clic sur un verset : palette de surlignage (or, vert, bleu, rose) mémorisée localement ; clic droit ou appui long pour copier le verset avec sa référence.
- Recherche par nom de livre et recherche plein texte dans les versets de la version active.
- Verset du jour, reprise de la dernière lecture, copie du lien de lecture.
- Interface responsive, navigation au clavier (← / → dans un chapitre, Échap pour fermer).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `Index.html` | Structure de la page |
| `style.css` | Thème sombre doré, composants et responsive |
| `app.js` | Routage, rendu, recherche, verset du jour et stockage local |
| `bible-LSG.js` | Texte Louis Segond 1910 généré (66 livres) |
| `bible-KJV.js` | Texte King James Version généré (66 livres) |
| `scripts/generer-bibles.py` | Téléchargement et génération des deux fichiers bibliques |
| `favicon.svg` | Icône du site |

## Régénérer les textes bibliques

Les deux fichiers `bible-*.js` sont générés à partir de l’API publique [Bible.helloAO.org](https://bible.helloao.org). Pour les reconstruire :

```powershell
python scripts/generer-bibles.py
```

Ajoutez `--force` pour forcer le téléchargement des sources. Le script met les réponses en cache dans le dossier temporaire de la machine.

## Sources et licence

- **Louis Segond 1910** : texte du domaine public.
- **King James Version** : texte du domaine public.

Les textes sont issus de l’API Bible.helloAO.org, qui distribue des traductions libres ou du domaine public. Aucune attribution n’est requise, mais la source est indiquée dans le pied de page.
