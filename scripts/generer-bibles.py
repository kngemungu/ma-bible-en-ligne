#!/usr/bin/env python3
"""Génère les fichiers bible-LSG.js et bible-KJV.js du site.

Les textes sont récupérés depuis l'API publique Bible.helloAO.org :
  - Louis Segond 1910 (fra_lsg) : domaine public
  - King James Version (eng_kjv) : domaine public

Le script met les réponses en cache dans le dossier temporaire de la machine,
puis produit un objet JavaScript de la forme :

  window.BIBLES.LSG = { "genese": { "1": ["verset 1", "verset 2", ...] } }

Usage :
  python scripts/generer-bibles.py            # utilise le cache si possible
  python scripts/generer-bibles.py --force    # force le téléchargement
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import urllib.request
from datetime import date
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
CACHE = Path(tempfile.gettempdir()) / "opencode" / "bible-build"
API = "https://bible.helloao.org/api"

# Ordre des livres utilisé par le site : (identifiant du site, code OSIS).
LIVRES = [
    ("genese", "GEN"), ("exode", "EXO"), ("levitique", "LEV"),
    ("nombres", "NUM"), ("deuteronome", "DEU"),
    ("josue", "JOS"), ("juges", "JDG"), ("ruth", "RUT"),
    ("1-samuel", "1SA"), ("2-samuel", "2SA"), ("1-rois", "1KI"),
    ("2-rois", "2KI"), ("1-chroniques", "1CH"), ("2-chroniques", "2CH"),
    ("esdras", "EZR"), ("nehemie", "NEH"), ("esther", "EST"),
    ("job", "JOB"), ("psaumes", "PSA"), ("proverbes", "PRO"),
    ("ecclesiaste", "ECC"), ("cantique", "SNG"), ("esaie", "ISA"),
    ("jeremie", "JER"), ("lamentations", "LAM"), ("ezechiel", "EZK"),
    ("daniel", "DAN"), ("osee", "HOS"), ("joel", "JOL"), ("amos", "AMO"),
    ("abdias", "OBA"), ("jonas", "JON"), ("michee", "MIC"), ("nahum", "NAM"),
    ("habacuc", "HAB"), ("sophonie", "ZEP"), ("aggee", "HAG"),
    ("zacharie", "ZEC"), ("malachie", "MAL"),
    ("matthieu", "MAT"), ("marc", "MRK"), ("luc", "LUK"), ("jean", "JHN"),
    ("actes", "ACT"), ("romains", "ROM"), ("1-corinthiens", "1CO"),
    ("2-corinthiens", "2CO"), ("galates", "GAL"), ("ephesiens", "EPH"),
    ("philippiens", "PHP"), ("colossiens", "COL"),
    ("1-thessaloniciens", "1TH"), ("2-thessaloniciens", "2TH"),
    ("1-timothee", "1TI"), ("2-timothee", "2TI"), ("tite", "TIT"),
    ("philemon", "PHM"), ("hebreux", "HEB"), ("jacques", "JAS"),
    ("1-pierre", "1PE"), ("2-pierre", "2PE"), ("1-jean", "1JN"),
    ("2-jean", "2JN"), ("3-jean", "3JN"), ("jude", "JUD"),
    ("apocalypse", "REV"),
]

VERSIONS = {
    "LSG": {
        "code": "fra_lsg",
        "nom": "Louis Segond 1910",
        "fichier": "bible-LSG.js",
    },
    "KJV": {
        "code": "eng_kjv",
        "nom": "King James Version",
        "fichier": "bible-KJV.js",
    },
}


def telecharger(code: str, force: bool = False) -> dict:
    """Télécharge (ou relit depuis le cache) la Bible complète d'une version."""
    CACHE.mkdir(parents=True, exist_ok=True)
    chemin = CACHE / f"{code}-complete.json"

    if force or not chemin.exists():
        url = f"{API}/{code}/complete.json"
        print(f"Téléchargement de {url}…")
        requete = urllib.request.Request(
            url, headers={"User-Agent": "Ma-Bible-en-ligne/1.0"}
        )
        with urllib.request.urlopen(requete, timeout=180) as reponse:
            donnees = reponse.read()
        chemin.write_bytes(donnees)
        print(f"  {len(donnees) / 1024 / 1024:.1f} Mo reçus")
    else:
        print(f"Cache utilisé : {chemin}")

    with chemin.open(encoding="utf-8") as fichier:
        return json.load(fichier)


def texte_du_verset(contenu: list) -> str:
    """Reconstitue le texte d'un verset à partir des fragments de l'API.

    Les fragments peuvent être de simples chaînes, ou des objets qui portent
    le texte (parfois en rouge « wordsOfJesus »), un saut de ligne poétique
    ou une note. On ignore les notes et on transforme les sauts de ligne en
    espaces pour obtenir un paragraphe lisible.
    """
    morceaux = []
    for fragment in contenu:
        if isinstance(fragment, str):
            morceaux.append(fragment)
        elif isinstance(fragment, dict):
            if isinstance(fragment.get("text"), str):
                morceaux.append(fragment["text"])
            if fragment.get("lineBreak"):
                morceaux.append(" ")

    texte = " ".join(morceaux)
    # On compacte les espaces ASCII sans toucher aux espaces insécables français.
    texte = re.sub(r"[ \t\r\n]+", " ", texte).strip()
    # Les marques de paragraphe de la King James ne sont pas utiles à la lecture.
    return re.sub(r"^¶\s*", "", texte)


def construire_bible(donnees: dict) -> tuple[dict, dict]:
    """Transforme la réponse de l'API en objet indexé par identifiant de livre."""
    livres_source = {livre["id"]: livre for livre in donnees.get("books", [])}
    if len(livres_source) != 66:
        raise ValueError(
            f"66 livres attendus, {len(livres_source)} reçus pour "
            f"{donnees.get('translation', {}).get('id', '?')}"
        )

    bible: dict[str, dict[str, list[str]]] = {}
    stats = {"livres": 0, "chapitres": 0, "versets": 0}

    for identifiant, code in LIVRES:
        livre = livres_source.get(code)
        if livre is None:
            raise ValueError(f"Livre absent de la source : {code}")

        chapitres: dict[str, list[str]] = {}
        chapitres_source = sorted(
            livre.get("chapters", []), key=lambda ch: ch["chapter"]["number"]
        )
        for chapitre in chapitres_source:
            numero = chapitre["chapter"]["number"]
            versets = []
            for element in chapitre["chapter"].get("content", []):
                if element.get("type") != "verse":
                    continue
                versets.append(texte_du_verset(element.get("content", [])))

            # L'application numérote les versets de 1 à n : on vérifie que la
            # source ne saute aucun numéro pour ne pas décaler l'affichage.
            numeros = [
                element["number"]
                for element in chapitre["chapter"].get("content", [])
                if element.get("type") == "verse" and "number" in element
            ]
            if numeros != list(range(1, len(numeros) + 1)):
                raise ValueError(
                    f"Numérotation irrégulière dans {code} {numero} : {numeros[:10]}"
                )

            chapitres[str(numero)] = versets
            stats["chapitres"] += 1
            stats["versets"] += len(versets)

        bible[identifiant] = chapitres
        stats["livres"] += 1

    return bible, stats


def ecrire_fichier(version: str, bible: dict, stats: dict) -> Path:
    configuration = VERSIONS[version]
    chemin = RACINE / configuration["fichier"]

    entete = (
        f"/* Bible {configuration['nom']} — texte du domaine public.\n"
        f"   Source : {API}/{configuration['code']}/complete.json\n"
        f"   Généré le {date.today().isoformat()} par scripts/generer-bibles.py.\n"
        f"   {stats['livres']} livres · {stats['chapitres']} chapitres · "
        f"{stats['versets']} versets. */\n"
    )
    charge = json.dumps(bible, ensure_ascii=False, separators=(",", ":"))
    # Ces deux caractères peuvent casser un littéral JavaScript ancien.
    charge = charge.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    contenu = (
        f"{entete}window.BIBLES = window.BIBLES || {{}};\n"
        f"window.BIBLES.{version} = {charge};\n"
    )
    chemin.write_text(contenu, encoding="utf-8", newline="\n")
    return chemin


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    analyseur = argparse.ArgumentParser(description=__doc__)
    analyseur.add_argument(
        "--force", action="store_true", help="forcer le téléchargement des sources"
    )
    options = analyseur.parse_args()

    for version, configuration in VERSIONS.items():
        print(f"\n=== {version} — {configuration['nom']} ===")
        donnees = telecharger(configuration["code"], force=options.force)
        bible, stats = construire_bible(donnees)
        chemin = ecrire_fichier(version, bible, stats)
        taille = chemin.stat().st_size / 1024 / 1024
        print(
            f"  {stats['livres']} livres, {stats['chapitres']} chapitres, "
            f"{stats['versets']} versets"
        )
        print(f"  Écrit : {chemin} ({taille:.1f} Mo)")

    print("\nTerminé.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
