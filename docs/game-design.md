# Startup Incubation Game : game design (MVP)

Source de vérité produit : skill `startup-incubation-game`. Ce document fige les choix du MVP.
Date : 2026-09-24.

## 1. Intention

Jeu web court (5 à 10 min), die and retry, pour des participants Learnex qui ne connaissent pas le monde des startups.
Le joueur dirige une startup incubée chez EDHEC Entrepreneurs pendant 18 mois.
Il apprend par les conséquences : cash, burn, runway, premiers clients, PMF, arbitrages, effets différés.

Critères de succès :

- on comprend l'écran en moins de 30 secondes
- une partie dure 5 à 10 minutes
- l'échec s'explique en une phrase
- le joueur veut rejouer pour tester une autre hypothèse
- plusieurs stratégies mènent à une fin positive, aucune ne gagne à coup sûr

## 2. Boucle de jeu

1 tour = 1 mois. 18 tours.

1. Début du mois : les conséquences différées arrivées à échéance se résolvent (bandeau "Pendant ce temps").
2. Le contexte de marché évolue parfois (bandeau ACTU).
3. Un événement principal s'affiche (grande carte). Priorité : conséquence interactive > urgence (runway, équipe) > pioche dans le pool de l'acte.
4. Le joueur choisit parmi 2 ou 3 options. Il voit des indices qualitatifs, rarement des chiffres.
5. Effets immédiats appliqués, effets différés programmés.
6. Clôture du mois : revenus, charges, nouveaux clients, clients perdus, charge de l'équipe.
7. Écran résultat : ce qui s'est passé + chiffres exacts + bilan du mois.
8. Défaite ? Fin du mois 18 ? Sinon mois suivant.

Nombre de décisions : 18 (une par mois). Environ 20 secondes par décision.

## 3. Métriques

HUD principal (5 blocs) : Cash, Runway, MRR, Équipe, PMF.
Secondaire (sous-ligne du HUD) : clients, charges mensuelles, burn net.
Recap uniquement : part du capital détenue par les fondateurs.

| Donnée | Départ | Règle |
|---|---|---|
| Cash | 10 000 € | Perdu si < 0 en fin de mois |
| Charges mensuelles | 1 800 € | Outils, hébergement, compta. Fondateurs non payés au départ |
| Prix moyen (ARPU) | 250 €/mois | Modifié par les événements de pricing |
| Clients | 0 | |
| MRR | 0 € | Revenus récurrents mensuels. Suit les clients |
| Équipe | 80 / 100 | Moral + fatigue + cohésion. Perdu si <= 0 |
| PMF | 15 / 100 | Adéquation produit / marché |
| Capital fondateurs | 100 % | Baisse à chaque levée |

Dérivés :

- burn net = charges - MRR (0 si positif)
- runway = cash / burn net, affiché "Rentable" si burn net = 0

## 4. Mécaniques systémiques (clôture de mois)

C'est ce qui donne au PMF un rôle concret, sans cours théorique.

**Croissance organique**
nouveaux clients = PMF / 20 x multiplicateur commercial x multiplicateur marché (arrondi aléatoire).
PMF 15 : 0,75 client/mois. PMF 50 : 2,5 clients/mois.

**Multiplicateur commercial**
1 + 0,8 par commercial si PMF >= 35, sinon 1 + 0,3 par commercial.
Leçon : un commercial vend un produit qui a trouvé son marché, pas l'inverse.

**Churn (clients perdus par mois)**
PMF < 25 : 10 %. < 45 : 5 %. < 65 : 2,5 %. Sinon 1 %.
Leçon : la pub remplit le seau, le PMF bouche les trous.

**Développeurs**
+1 PMF par mois et par dev (vitesse produit).

**Charge de l'équipe**
capacité = 8 clients par personne (2 fondateurs + salariés).
Sous la capacité : +2 équipe/mois. Au-dessus : -3. Au-dessus de 150 % : -6.
Leçon : la croissance fatigue, le recrutement soulage mais coûte.

**Marché** (morose / normal / euphorique)
Croissance x0,8 / x1 / x1,2. Modifie les chances de levée et de vente corporate.
Change par des news (environ 1 fois sur 4 à partir du mois 4) ou par certains événements.

## 5. Conditions de défaite

- **Cash** : cash < 0 en fin de mois. Cause explicite dans le recap.
- **Équipe** : équipe <= 0. Burnout collectif ou départ du cofondateur.

Filets de sécurité, pour éviter une mort brutale et incomprise :

- **ALERTE RUNWAY** : si runway < 2 mois, événement prioritaire (2 fois max par partie). Couper les coûts, mettre son épargne, appeler son business angel.
- **FLASH équipe** : si équipe <= 30, ton associé menace de partir (1 fois par partie).

Pas de mort aléatoire sans cause.

## 6. Fins positives

Évaluées à la fin du mois 18, sauf l'exit qui termine la partie tout de suite.

| Fin | Condition | Message |
|---|---|---|
| EXIT | Accepter une offre de rachat (événement rare : mois 13+, PMF >= 60, MRR >= 8 000 €) | Fin exceptionnelle |
| RENTABLE | MRR >= charges + salaire fondateurs (3 600 € si non payés) sur les 3 derniers mois, équipe >= 25 | Tu contrôles ton destin |
| LEVÉE + TRACTION | Seed signée, PMF >= 45, MRR >= 5 000 € | Une étape franchie, pas une victoire définitive |
| TOUJOURS DEBOUT | Vivant sans remplir les autres critères | Fin neutre, pas une victoire |

Priorité si plusieurs : Exit > Rentable > Levée + traction > Toujours debout.
La règle "salaire fondateurs inclus" empêche la stratégie "ne rien dépenser" de passer pour une réussite : une startup qui ne paie pas ses fondateurs n'est pas rentable.

## 7. Événements

Fichiers de données JS dans `src/data/`. Ajouter un événement = ajouter une entrée.

Structure :

```js
{
  id: "vivatech",
  months: [4, 7],            // fenêtre d'apparition
  category: "Salon",         // étiquette affichée
  speaker: "Léa, experte EDHEC Entrepreneurs", // optionnel
  stage: "breaking",         // optionnel : mise en scène forte (flash, breaking, alerte)
  title: "VivaTech t'ouvre ses portes",
  text: "Un stand dans l'espace startups. 4 jours, des milliers de visiteurs.",
  note: "POC : un test payant de ton produit chez un client.", // jargon expliqué
  when: { minPmf: 20 },      // conditions sur l'état
  weight: 1,
  choices: [
    {
      label: "Prendre un stand",
      hints: ["Coût : 4 000 €", "Retombées incertaines"],
      tags: ["growth"],
      effects: { cash: -4000, team: -5 },
      delayed: [{ in: 3, id: "vivatech-callback" }],
      text: "Quatre jours debout, 300 cartes de visite."
    }
  ]
}
```

Résultats aléatoires : une option (ou une conséquence) liste des `outcomes`. Chacun a une condition `if` et une `chance` qui dépend de l'état (base + bonus PMF, équipe, MRR, marché, flags). Le premier qui passe l'emporte, le dernier sert de repli.

Contenu MVP : environ 38 événements de pool, 20 conséquences différées, 12 news de marché.

Répartition :

- Acte 1, Survivre (mois 1 à 6) : interviews, premier prospect, site web, freelance design, dev freelance, stagiaire, Meta Ads, Bourse French Tech, prêt d'honneur, expert EDHEC, mentor, salon, VivaTech, client mécontent, feature demandée par un gros prospect, tension entre associés.
- Acte 2, Traction (mois 7 à 12) : prix, commercial, développeur, POC corporate, appel d'offres, pivot, concurrent, business angel, prêt bancaire, salaire des fondateurs, bad buzz, panne, préparation levée, contenu, partenariat, parrainage.
- Acte 3, Accélérer (mois 13 à 18) : levée Seed, term sheet, international, grand compte exclusif, concurrent qui lève 20 M€, crise de management, salarié débauché, offre de rachat.

Le mois 1 est fixe (interviews utilisateurs) : il pose la leçon PMF dès la première minute.

## 8. Conséquences différées

Une file `pending` : `{ dueMonth, id, source }`.
Au début de chaque mois, les éléments échus se résolvent :

- passifs : effets appliqués et affichés dans le bandeau "Pendant ce temps"
- interactifs : deviennent l'événement principal du mois (ex. le contact VivaTech revient avec un POC)

Exemples : VivaTech (3 mois), Bourse French Tech (3 mois), POC (3 mois), commercial (bilan à 3 mois), fin de stage (6 mois), cohorte Meta Ads qui churn (2 mois), levée Seed (2 mois puis term sheet).

## 9. Progression et recap

Recap de fin de partie :

- numéro de run et profil ("Le Growth Hacker", "Le Product Lover", "La Sales Machine", "Le Cash Keeper", "Le Serial Recruiter", "Le Corporate Addict", "Le Fundraiser", "Le Bootstrapper", "L'Équilibriste")
- mois survécus, cash, MRR, clients, PMF, équipe, capital détenu
- cause principale (règles ordonnées, ex. "Tu as recruté trop tôt")
- ce que tu avais bien fait
- 3 décisions marquantes
- record précédent / nouveau record
- bouton RECOMMENCER

Profil : chaque choix porte des tags (growth, product, sales, cash, recruit, corporate, fundraise). Le tag dominant donne le profil. Bootstrapper = fin rentable sans levée. Équilibriste = aucun tag au-dessus de 30 %.

Stockage localStorage : historique des 20 dernières runs, meilleure survie, meilleur MRR, fins débloquées, partie en cours (reprise après un rechargement de page).

## 10. Simulation papier (avant code)

Hypothèses de calcul : formules de la section 4, ARPU 250 €, charges 1 800 €.

**Le dépensier** (dit oui à tout ce qui coûte)
M1 interviews (PMF 27). M2 dev en CDI (+3 800 €/mois). M3 Meta Ads (-3 000 €). M4 VivaTech (-4 000 €).
Charges 5 600 €/mois pour 500 € de MRR. Cash à 0 vers M4. Alerte runway M3, épargne perso +6 000 €, mort M5-M6.
Cause lisible : "Tu as recruté et dépensé avant d'avoir des revenus." OK, mort rapide mais comprise.

**Le trop prudent** (refuse tout ce qui coûte)
PMF reste vers 17. 0,85 client/mois, churn 10 %. Plafond naturel vers 8 clients (2 000 € MRR).
Cash au plus bas vers M8 (~2 000 €), puis équilibre fragile. Chaque imprévu (panne, client mécontent) le met en alerte.
Fin : "Toujours debout" ou mort M12-M15. Leçon : ne rien tenter n'est pas une stratégie.
Point corrigé pendant la simulation : sans la règle "salaire fondateurs inclus", ce profil finissait "Rentable" avec 2 000 € de MRR. Règle ajoutée.

**Le très sales** (prospecte, pub, commercial tôt)
PMF 20 à M6, recrutement commercial M6 : multiplicateur 1,3 seulement. Charges 5 300 € pour 1 500 € de MRR.
Mort M9-M11. Cause : "Tu as recruté un commercial avant d'avoir un produit qui se vend."
Variante avec interviews au M1 : PMF 40, multiplicateur 1,8, +900 € de MRR/mois, rentable vers M15. Stratégie viable si le PMF suit.

**Le très produit** (interviews, design, refuse le custom, dev)
PMF 50+ vers M9. Croissance lente au début : cash critique vers M6. Survit s'il décroche la Bourse French Tech ou le prêt d'honneur.
Fin M18 : 25-30 clients, 6 500-7 500 € de MRR, équipe fatiguée (surcharge sans recrutement). Rentable ou Toujours debout.

**L'équilibré** (interviews, subvention, premier client, commercial à M9 avec PMF 45, préparation levée)
MRR 5 000-8 000 € à M15, levée tentée avec de bonnes chances. Fin Levée + traction ou Rentable.

Vérifications :

- mort trop rapide ? Non pour un joueur raisonnable. Le dépensier meurt vers M5, c'est voulu.
- victoire trop facile ? Non : ne rien faire ne gagne plus.
- le PMF sert ? Oui : croissance, churn, efficacité commerciale, chances de POC et de levée.
- recrutement trop puissant ? Non : 3 500 à 4 500 €/mois, utile seulement avec du PMF ou des revenus.
- levée automatique ? Non : exige PMF, MRR, préparation, marché. Ajoute des charges (plan de recrutement promis).
- cash fil rouge ? Oui : c'est la cause de mort principale.
- plusieurs stratégies viables ? Produit, équilibré, sales avec PMF. À confirmer par la simulation automatique (`npm run simulate`).

## 11. Hypothèses prises (sans validation)

- Noms d'entreprises fictifs (pas de vraies marques) pour éviter toute confusion.
- Pas de son, pas d'animations lourdes.
- Le mois 1 est scripté, le reste est tiré au sort dans le pool de l'acte.
- Le capital détenu n'est affiché qu'au recap pour garder le HUD léger.
- Pas de fin anticipée pour la rentabilité : la partie va au mois 18, sauf exit ou défaite.
