# Coming Soon — Page d'attente premium

Page d'attente élégante, mystérieuse et moderne pour un lancement le **11 juin 2026 à 20h00 (GMT+2)**.

Le projet reste volontairement non divulgué. La page crée l'attente et le FOMO.

## Stack technique

- HTML5 sémantique
- CSS3 (variables, animations, responsive)
- JavaScript vanilla (ES6+)
- Google Fonts (Playfair Display + JetBrains Mono)
- Aucune dépendance externe lourde

## Structure du projet

```
├── index.html           # Structure complète de la page
├── css/style.css        # Styles, animations, responsive
├── js/main.js           # Compteur, horloge, particules, easter egg, formulaire
├── assets/logo.svg      # Logo abstrait (dégradé rouge → or)
└── README.md
```

## Sections de la page

1. **Hero** — Logo, compteur J-days temps réel, titre mystérieux, compte à rebours (jours/heures/minutes/secondes)
2. **Citation** — Bloc élégant avec la date du lancement
3. **Le voyage continue** — 3 étapes : lignes de code, nuits blanches, travail soigné
4. **Notification** — Formulaire email avec validation, stockage localStorage, prêt pour API
5. **Horloge live** — Heure actuelle (GMT+2) en bas d'écran
6. **Easter egg** — 5 clics sur le logo → message surprise
7. **Fond animé** — Particules feu (rouge, orange, doré) + lueurs d'ambiance chaudes

## Fonctionnalités

- Compte à rebours temps réel avec animation flip
- J-days (jours restants) mis à jour chaque seconde
- Tick sonore discret (dernières 24h)
- Formulaire email avec stockage localStorage
- Parallaxe subtil au mouvement de la souris
- Apparition progressive des sections au scroll
- Écran de révélation quand le compteur atteint zéro
- Mode démo : `?demo` dans l'URL (countdown à 10s)
- Thème sombre avec ambiances chaudes
- Responsive (mobile, tablette, desktop)
- Accessibilité (aria, prefers-reduced-motion, navigation clavier)

## Personnalisation

| Élément | Fichier | Ligne |
|---|---|---|
| Date de lancement | `js/main.js` | `TARGET_DATE` (ligne 4) |
| Texte du journal J-days | `js/main.js` | fixe, lié au compteur |
| URL de redirection | `js/main.js` | `REDIRECT_URL` (ligne 5) |
| Contenu du voyage | `index.html` | lignes 78-88 |
| Textes de la timeline | `js/main.js` | `timelineData` (supprimé dans cette version) |
| Couleurs principales | `css/style.css` | variables `:root` (lignes 1-17) |
| API email | `index.html` | `data-api-url` sur le formulaire (ligne 95) |

## Récupérer les emails gratuitement

Le formulaire stocke déjà les emails dans le `localStorage` du navigateur. Pour les récupérer côté serveur sans payer :

### Option 1 — Formspree (recommandé, gratuit)

1. Créez un compte sur [formspree.io](https://formspree.io)
2. Créez un nouveau formulaire → obtenez une URL type `https://formspree.io/f/xxxxxx`
3. Dans `index.html`, ajoutez cette URL à l'attribut `data-api-url` :
   ```html
   <form class="notify-form" id="notify-form" data-api-url="https://formspree.io/f/xxxxxx" novalidate>
   ```
4. Les emails arriveront dans votre boîte Formspree (gratuit : 50 soumissions/mois)

### Option 2 — Netlify Forms (si déployé sur Netlify)

1. Déployez sur Netlify
2. Ajoutez `netlify` à l'attribut `data-netlify="true"` sur le formulaire
3. Les soumissions apparaissent dans l'onglet Forms du dashboard Netlify (gratuit : 100 soumissions/mois)

### Option 3 — Web3Forms (gratuit)

1. Créez une clé API sur [web3forms.com](https://web3forms.com)
2. Définissez l'URL d'action : `https://api.web3forms.com/submit`
3. Ajoutez `access_key` dans les données envoyées (100 soumissions/mois gratuites)

### Option 4 — Récupération manuelle (localStorage)

Les emails sont aussi sauvegardés en local. Pour les voir dans la console du navigateur :
```js
JSON.parse(localStorage.getItem('notifications'))
```

## Test en local

```bash
cd /home/kenny/Desktop/launching
python3 -m http.server 8080
# Ouvrir http://localhost:8080
```

Pour tester la fin du compte à rebours :
```
http://localhost:8080/?demo
```

## Licence

© 2026
