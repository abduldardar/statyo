# Répartition de l’utilisation des IA génératives — site statique

Ce projet fournit un site statique (HTML/CSS/JS) qui affiche :
- Un graphique donut (%) de la répartition par catégorie.
- Un graphique d'évolution hebdomadaire.
- Un script Node.js pour automatiser la récupération et l'agrégation heuristique des rapports publics.
- Un workflow GitHub Actions pour exécuter la mise à jour chaque semaine.

## Fichiers clés
- `index.html` – page d'accueil.
- `css/style.css` – styles (zen, moderne).
- `js/app.js` – logique frontend (Chart.js).
- `data/data.json` – données actuelles + historique (exemples).
- `scripts/fetch_data.js` – script Node.js qui récupère rapports publics et calcule des estimations (heuristique).
- `.github/workflows/update.yml` – workflow GitHub Actions programmé chaque semaine.
- `README.md` – ce fichier.

## Méthodologie & limites
Les pourcentages fournis dans `data/data.json` sont des **estimations agrégées** basées sur sources publiques : Microsoft (Work Trend Index), McKinsey, OpenAI usage studies, Stanford HAI, Deloitte, IDC, etc. Ces sources n'exposent pas toujours des pourcentages homogènes par catégorie — le script `fetch_data.js` applique une heuristique (comptage de mots-clés) pour produire un signal. **Dis moi lorsque tu ne sais pas** : le projet inclut des références et vous devez vérifier la réalité des chiffres avant toute décision.

## Déploiement
1. Télécharger le zip et déployer un site statique (Netlify, Vercel, GitHub Pages).
2. Pour automatiser les mises à jour localement : installer Node.js puis `npm install node-fetch@2` et exécuter `node scripts/fetch_data.js`.
3. Pour exécuter automatiquement chaque semaine : pousser vers GitHub ; le workflow dans `.github/workflows/update.yml` exécutera le script tous les Lundi.

## Sources (exemples)
- Microsoft Work Trend Index — AI at Work (May 2024)
- McKinsey Global Survey — The state of AI (2024)
- OpenAI research — How people use ChatGPT (2024/2025)
- Stanford HAI — AI Index (2024)
- Deloitte — State of Generative AI in the Enterprise (2024)
Vérifie toujours les rapports originaux pour des chiffres précis.
