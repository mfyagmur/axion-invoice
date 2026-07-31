# Axion Invoice - Proje Yapısı ve Eklentiler

## 📁 Klasör Yapısı

```
axion-invoice/
├── backend/                  # Backend uygulaması (henüz yapılandırılmadı)
├── frontend/                 # React + TypeScript frontend uygulaması
│   ├── public/              # Statik kaynaklar
│   ├── src/
│   │   ├── api/             # API çağrıları ve endpoints
│   │   ├── assets/          # İçeriğin yanı sıra resimler, fontlar vb.
│   │   ├── components/      # Yeniden kullanılabilir React bileşenleri
│   │   ├── config/          # Uygulama konfigürasyonu
│   │   ├── features/        # Özellik modülleri
│   │   │   └── auth/        # Kimlik doğrulama özelliği
│   │   ├── hooks/           # Özel React hooks
│   │   ├── layouts/         # Sayfa düzenleri
│   │   ├── lib/             # Yardımcı kütüphaneler
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── routes/          # Yönlendirme tanımlamaları
│   │   ├── services/        # İş mantığı ve servisler
│   │   ├── store/           # Durum yönetimi (Zustand)
│   │   ├── types/           # TypeScript tip tanımlamaları
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   ├── App.tsx          # Ana uygulama bileşeni
│   │   ├── App.css          # Ana stil dosyası
│   │   ├── main.tsx         # Uygulama giriş noktası
│   │   └── index.css        # Global stiller
│   ├── .gitignore           # Git yoksay dosyası
│   ├── eslint.config.js     # ESLint yapılandırması
│   ├── index.html           # HTML giriş dosyası
│   ├── package.json         # Paket bağımlılıkları
│   ├── package-lock.json    # Paket kilidi
│   ├── tsconfig.json        # TypeScript ana konfigürasyonu
│   ├── tsconfig.app.json    # Uygulama TypeScript konfigürasyonu
│   ├── tsconfig.node.json   # Node ortamı TypeScript konfigürasyonu
│   ├── vite.config.ts       # Vite yapılandırması
│   └── README.md            # Frontend belgesi
```

---

## 🛠️ Frontend Eklentileri ve Bağımlılıkları

### Üretim Bağımlılıkları (Dependencies)

| Eklenti | Sürüm | Açıklama |
|---------|-------|---------|
| `@hookform/resolvers` | ^5.5.7 | React Hook Form için form çözücüleri |
| `@tanstack/react-query` | ^5.101.4 | Async durum yönetimi ve veri senkronizasyonu |
| `clsx` | ^2.1.1 | Koşullu CSS sınıfları birleştirme yardımcısı |
| `lucide-react` | ^1.28.0 | İkon kütüphanesi |
| `react` | ^19.2.8 | React çekirdeği |
| `react-dom` | ^19.2.8 | React DOM işleyicisi |
| `react-hook-form` | ^7.83.0 | Form yönetimi ve doğrulama |
| `react-router-dom` | ^7.18.2 | Yönlendirme kütüphanesi |
| `tailwind-merge` | ^3.6.0 | Tailwind CSS sınıf birleştirme |
| `zod` | ^4.4.3 | TypeScript-first şema doğrulama |
| `zustand` | ^5.0.14 | Basit durum yönetimi kütüphanesi |

### Geliştirme Bağımlılıkları (DevDependencies)

| Eklenti | Sürüm | Açıklama |
|---------|-------|---------|
| `@eslint/js` | ^10.0.1 | ESLint çekirdeği |
| `@tailwindcss/vite` | ^4.3.3 | Tailwind CSS Vite eklentisi |
| `@testing-library/react` | ^16.3.2 | React bileşen testi kütüphanesi |
| `@types/node` | ^24.13.3 | Node.js için TypeScript tipleri |
| `@types/react` | ^19.2.17 | React için TypeScript tipleri |
| `@types/react-dom` | ^19.2.3 | React DOM için TypeScript tipleri |
| `@vitejs/plugin-react` | ^6.0.4 | Vite React eklentisi |
| `eslint` | ^10.8.0 | Kod kalite kontrol aracı |
| `eslint-plugin-react-hooks` | ^7.1.1 | React Hooks ESLint kuralları |
| `eslint-plugin-react-refresh` | ^0.5.3 | React Fast Refresh ESLint kuralları |
| `globals` | ^17.7.0 | Global değişkenlerin tanımı |
| `jsdom` | ^29.1.1 | DOM ortamı simülasyonu |
| `prettier` | ^3.9.6 | Kod biçimlendirici |
| `prettier-plugin-tailwindcss` | ^0.8.1 | Tailwind CSS Prettier eklentisi |
| `tailwindcss` | ^4.3.3 | Utility-first CSS çatısı |
| `typescript` | ~6.0.2 | TypeScript derleyicisi |
| `typescript-eslint` | ^8.65.0 | TypeScript ESLint desteği |
| `vite` | ^8.2.0 | Modern frontend yapı aracı |
| `vitest` | ^4.1.10 | Birim testi çatısı |

### Kurulu Eklentilerin Özeti

**Durum Yönetimi:**
- Zustand (global state)
- React Hook Form (form state)
- TanStack Query (server state)

**UI & Styling:**
- React Router DOM (routing)
- Tailwind CSS (styling)
- Lucide React (icons)

**Veri Doğrulama:**
- Zod (schema validation)
- React Hook Form (form validation)

**Geliştirme & Test Araçları:**
- TypeScript (type safety)
- ESLint + Prettier (code quality)
- Vitest + Testing Library (testing)
- Vite (build tool)

---

## 📦 Backend

Backend bölümü henüz yapılandırılmamış durumdadır. Başlatılması için `backend/` dizinine paket dosyaları eklenmesi gerekmektedir.

---

## 🚀 Başlangıç Komutları (Frontend)

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Üretim yapısı oluştur
npm run build

# Kod kalitesi kontrolü
npm lint

# Yapıyı önizle
npm run preview
```

---

## 📝 Yapılandırma Dosyaları

- **tsconfig.json** - TypeScript ana konfigürasyonu
- **tsconfig.app.json** - Uygulama TypeScript ayarları
- **tsconfig.node.json** - Node ortamı TypeScript ayarları
- **vite.config.ts** - Vite yapı aracı konfigürasyonu
- **eslint.config.js** - Kod kalite kontrol kuralları
- **.gitignore** - Git tarafından yoksayılacak dosyalar

---

**Son Güncelleme:** 2026-07-31
