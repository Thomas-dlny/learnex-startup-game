# Startup Incubation Game MVP : plan d'implémentation

> Exécution : superpowers:executing-plans (inline, choisi par l'utilisateur : "avance de façon autonome").

**Goal :** un jeu web statique jouable de bout en bout (start, 18 mois, défaite ou victoire, recap, restart).

**Architecture :** moteur de jeu pur en JS (fonctions `state -> state`, aléatoire seedé stocké dans l'état) testé avec Vitest. Contenu dans `src/data/*.js`. UI React fine qui lit l'état et appelle le moteur. localStorage pour records et reprise.

**Tech Stack :** Vite, React, CSS pur, Vitest. Aucune autre dépendance.

**Spec :** `docs/game-design.md`

## Global Constraints

- Frontend only. Pas de backend, pas de compte, pas d'API externe.
- Dépendances : react, react-dom, vite, @vitejs/plugin-react, vitest. Rien d'autre.
- Argent en euros. Départ : 10 000 € cash, 1 800 € charges, ARPU 250 €, équipe 80, PMF 15.
- 18 mois, 1 décision par mois.
- Textes du jeu en français, tutoiement, jamais de tiret long (U+2014).
- Événements modifiables sans toucher aux composants.
- `base: './'` dans Vite pour déployer sur GitHub Pages, Netlify, Vercel.

## Review Focus

1. localStorage indisponible (navigation privée, quota) : le jeu doit tourner sans sauvegarde, sans crash.
2. Sauvegarde corrompue ou d'une ancienne version : ignorée, nouvelle partie proposée.
3. Pool d'événements vide pour un mois donné (conditions trop strictes) : un événement de repli s'affiche, la partie ne bloque jamais.
4. Division par zéro sur le runway quand le burn net est nul : affichage "Rentable".
5. Double clic sur un choix : un seul choix appliqué.

## Structure des fichiers

```
index.html
vite.config.js
src/
  main.jsx               montage React
  App.jsx                écrans : accueil, jeu, recap
  game/
    config.js            paramètres d'équilibrage
    rng.js               aléatoire seedé (mulberry32)
    engine.js            newGame, chooseOption, nextMonth, sélection, effets, clôture de mois
    endings.js           fin de partie, cause, profil, points forts
    storage.js           records + reprise (localStorage protégé)
    format.js            formatage euros, runway
  data/
    events.js            pool d'événements + urgences
    callbacks.js         conséquences différées
    news.js              news de marché + brèves
  components/
    Timeline.jsx  Hud.jsx  NewsTicker.jsx  EventCard.jsx  ResultCard.jsx  StartScreen.jsx  RunRecap.jsx
  styles/app.css
tests/
  engine.test.js  endings.test.js  storage.test.js  data.test.js
scripts/simulate.mjs     simulation de stratégies (équilibrage)
```

## Tâches

### Task 1 : Scaffold

Fichiers : package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx (placeholder).
Vérif : `npm run build` exit 0, `npx vitest run` démarre.

### Task 2 : Moteur (TDD)

Fichiers : src/game/config.js, rng.js, engine.js, format.js, tests/engine.test.js.
Produit :

- `newGame(seed) -> state`
- `chooseOption(state, choiceIndex, content?) -> state` (phase `event` -> `result` ou `ended`)
- `nextMonth(state, content?) -> state` (phase `result` -> `event` ou `ended`)
- `netBurn(state)`, `runway(state)` (Infinity si burn nul)
- `visibleChoices(state, event)`

Tests (écrits d'abord, vus rouges) :

- état initial conforme au spec
- runway = cash / burn net, Infinity si MRR >= charges
- effets immédiats appliqués (cash, team borné 0-100, pmf borné, clients ajoutent ARPU au MRR)
- clôture de mois : cash += MRR - charges, croissance organique dépend du PMF, churn dépend du PMF
- effet différé programmé puis résolu au bon mois (passif et interactif)
- défaite cash < 0, défaite équipe <= 0
- alerte runway prioritaire quand runway < 2
- mois 1 = événement d'interviews
- fin du mois 18 -> phase `ended`
- même seed + mêmes choix = même partie (déterminisme)
- double appel de chooseOption en phase `result` : ignoré
- pool vide : événement de repli

### Task 3 : Fins, cause, profil (TDD)

Fichiers : src/game/endings.js, tests/endings.test.js.
Produit : `evaluateEnding(state)`, `buildRecap(state, records)`.
Tests : priorité des fins, règle salaire fondateurs, cause "recrutement trop tôt", profil par tag dominant, Bootstrapper, Équilibriste.

### Task 4 : Stockage (TDD)

Fichiers : src/game/storage.js, tests/storage.test.js.
Produit : `loadRecords()`, `saveRun(summary)`, `saveCurrent(state)`, `loadCurrent()`, `clearCurrent()`.
Tests : records vides par défaut, meilleur score mis à jour, JSON corrompu ignoré, localStorage qui throw ignoré.

### Task 5 : Vertical slice UI

Direction visuelle (frontend-design) puis composants minimaux, 5 événements, boucle complète jouable dans le navigateur.
Vérif : build + parcours Playwright start -> 18 mois ou défaite -> recap -> restart.

### Task 6 : Contenu complet

~38 événements, ~20 conséquences, ~12 news. Test de validation des données (ids uniques, callbacks existants, 2-3 choix, pas de tiret long).

### Task 7 : Équilibrage

scripts/simulate.mjs : 6 stratégies x 500 parties. Cibles : dépensier meurt tôt, prudent ne gagne pas, équilibré gagne 35-60 %, aucune stratégie > 70 %, partie aléatoire meurt en médiane entre M8 et M12.

### Task 8 : Polish, vérification, README, déploiement

Mise en scène (flash, breaking, alerte), responsive, accessibilité clavier, README, test Playwright desktop + mobile, console sans erreur.
