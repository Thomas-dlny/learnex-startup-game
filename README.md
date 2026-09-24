# Startup Incubation Game

Jeu web die and retry pour les Learnex EDHEC Entrepreneurs.
Tu diriges Glane, une startup anti-gaspillage pour restaurants, pendant 18 mois d'incubation.
Une partie dure 5 à 10 minutes. Tu perds, tu lis ton bilan, tu recommences.

Game design complet : [`docs/game-design.md`](docs/game-design.md).

## Lancer le jeu en local

Il te faut Node.js 20 ou plus.

```bash
npm install
npm run dev
```

Ouvre l'adresse affichée (en général http://localhost:5173).

Autres commandes :

| Commande | Rôle |
|---|---|
| `npm test` | Tests du moteur, des fins de partie, du stockage et des données |
| `npm run build` | Version prête à héberger, dans `dist/` |
| `npm run preview` | Sert le dossier `dist/` en local pour vérifier le build |
| `npm run simulate` | Fait jouer 500 parties à 10 stratégies-types pour vérifier l'équilibrage |

## Où se trouve quoi

```
src/
  data/
    events.js      événements du jeu (le contenu principal)
    callbacks.js   conséquences différées ("3 mois plus tard...")
    news.js        bandeau ACTU et humeur du marché
  game/
    config.js      paramètres d'équilibrage
    engine.js      règles du jeu (mois, effets, croissance, churn, défaites)
    endings.js     fins, cause principale, profils de joueur
    storage.js     records et reprise de partie (localStorage)
  components/      écrans et blocs d'interface React
  styles/app.css   toute la direction visuelle
scripts/simulate.mjs   simulation d'équilibrage
tests/                 tests Vitest
```

## Modifier ou ajouter un événement

Tout se passe dans `src/data/events.js`. Tu n'as pas besoin de toucher aux composants.

1. Copie un événement existant.
2. Change son `id` (il doit être unique).
3. Règle `months` : la fenêtre de mois où il peut sortir, par exemple `[6, 12]`.
4. Écris `title` et `text` en deux phrases maximum.
5. Donne 2 ou 3 `choices`. Pour chaque choix :
   - `label` : le texte du bouton
   - `hints` : ce que le joueur voit avant de cliquer. Reste qualitatif ("Coût élevé", "Résultat incertain")
   - `effects` : ce qui change tout de suite. Par exemple `{ cash: -3000, pmf: 5, team: -4 }`
   - `text` : ce qui s'est passé, affiché après le choix
   - `tags` : le style de jeu, utilisé pour le profil de fin (`growth`, `product`, `sales`, `cash`, `recruit`, `corporate`, `fundraise`, `team`)
6. Lance `npm test`. Le test des données signale les fautes de frappe dans les clés, les ids en double et les conséquences introuvables.

Exemple minimal :

```js
{
  id: 'salon-bordeaux',
  months: [4, 10],
  category: 'Salon',
  title: 'Un salon de la restauration à Bordeaux',
  text: 'Stand à 1 500 €. Deux jours avec tes futurs clients.',
  choices: [
    {
      label: 'Prendre un stand',
      hints: ['Coût : 1 500 €', 'Résultat incertain'],
      tags: ['growth'],
      effects: { cash: -1500, team: -3 },
      outcomes: [
        { chance: { base: 0.3, pmf: 0.01 }, effects: { clients: 3 }, text: '3 restaurants signent sur place.' },
        { effects: { clients: 1 }, text: 'Un seul client. Les autres vont réfléchir.' },
      ],
    },
    { label: 'Passer ton tour', hints: ['Aucun coût'], tags: ['cash'], effects: {}, text: 'Tu restes au bureau.' },
  ],
},
```

Pour aller plus loin :

- **Résultat aléatoire** : `outcomes` avec une `chance`. La chance se calcule ainsi : `base + pmf x PMF + team x Équipe + mrr x (MRR / 1000)`, plus des bonus selon le marché ou des flags. Le premier résultat tiré l'emporte, le dernier sert de repli.
- **Conséquence différée** : `delayed: [{ in: 3, id: 'mon-retour' }]`, puis tu ajoutes `mon-retour` dans `src/data/callbacks.js`.
- **Condition d'apparition** : `when: { minPmf: 30, minClients: 5 }`. Liste complète des clés en tête de `events.js`.
- **Recrutement** : `hire: { role: 'dev', label: 'Développeuse', cost: 3800 }` ajoute une charge mensuelle.
- **Mise en scène forte** : `stage: 'flash'`, `'breaking'` ou `'alert'`. À garder pour les moments importants.

## Modifier l'équilibrage

Les réglages globaux sont dans `src/game/config.js`, commentés :

- départ : cash, charges, prix moyen, équipe, PMF
- croissance organique : `growthPerPmf` (nouveaux clients par point de PMF)
- efficacité d'un commercial avec ou sans PMF
- churn selon le PMF
- charge de l'équipe : clients par personne, récupération, surcharge
- seuils des alertes et des fins positives

Après chaque réglage, lance `npm run simulate`. Le tableau montre, pour chaque stratégie, la part de fins positives et de défaites, ainsi que le mois médian de défaite. Repères actuels :

- joueur au hasard : environ 10 % de fins positives, mort vers le mois 8
- joueur équilibré : environ 50 % de fins positives
- joueur prudent qui ne dépense rien : presque jamais de fin positive
- aucune stratégie au-dessus de 70 %

## Déployer gratuitement

Le jeu est un site statique : pas de serveur, pas de base de données.

**Netlify (le plus simple)**
1. `npm run build`
2. Va sur https://app.netlify.com/drop
3. Glisse le dossier `dist/` dans la page. Tu obtiens une URL tout de suite.

**Vercel**
1. Importe le repo GitHub sur https://vercel.com/new
2. Vercel détecte Vite. Commande de build : `npm run build`, dossier de sortie : `dist`.

**GitHub Pages**
1. Dans le repo : Settings > Pages > Source : "GitHub Actions".
2. Crée `.github/workflows/deploy.yml` :

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

Le build utilise des chemins relatifs (`base: './'` dans `vite.config.js`) : il fonctionne aussi dans un sous-dossier comme `ton-compte.github.io/learnex-startup-game/`.

## Sauvegarde

Le jeu garde dans le navigateur (localStorage) :

- la partie en cours, pour la reprendre après un rechargement
- les 20 dernières runs, le record de survie et les fins débloquées

Aucune donnée personnelle, rien ne part sur un serveur. Si le navigateur bloque le stockage (navigation privée stricte), le jeu fonctionne quand même, sans sauvegarde entre deux visites.

Les polices viennent de Google Fonts. Sans connexion, le jeu utilise des polices de secours.
