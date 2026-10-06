# Kućni budžet

Mobilna aplikacija za prihode, rashode i mesečne limite. Isti kod radi na Androidu, iOS-u i u browseru.

## Pokretanje

```bash
npm install
npm test
npm run web
```

`npm start` otvara Expo dev server. Na telefonu aplikaciju otvori kroz Expo Go.

Unosi se čuvaju u SQLite bazi na uređaju. Nema naloga ni servera. Ekran Unosi otvara formu Novi unos (`/add`). Početna i Plan su još prazne školjke. Pravila su u `src/domain` i proveravaju se sa `npm test`.
