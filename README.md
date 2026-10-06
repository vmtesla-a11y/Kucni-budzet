# Kućni budžet

Mobilna aplikacija za prihode, rashode i mesečne limite. Isti kod radi na Androidu, iOS-u i u browseru.

## Pokretanje

```bash
npm install
npm test
npm run web
```

`npm start` otvara Expo dev server. Na telefonu aplikaciju otvori kroz Expo Go.

Unosi se čuvaju u SQLite bazi na uređaju. Nema naloga ni servera. Ekrani su još prazne školjke; pravila su u `src/domain` i proveravaju se sa `npm test`.
