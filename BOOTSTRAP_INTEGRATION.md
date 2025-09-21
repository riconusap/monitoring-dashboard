# Bootstrap Integration

Bootstrap 5.3.8 telah berhasil diintegrasikan ke dalam project monitoring dashboard ini.

## Instalasi

Bootstrap dan dependensinya telah diinstall:
- `bootstrap`: ^5.3.8
- `@popperjs/core`: ^2.11.8

## Konfigurasi

Bootstrap CSS dan JS telah ditambahkan ke `src/main.ts`:

```typescript
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
```

## Penggunaan

Sekarang Anda dapat menggunakan semua class Bootstrap di komponen Vue:

### Contoh Grid System
```vue
<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <h4>Column 1</h4>
      </div>
      <div class="col-md-6">
        <h4>Column 2</h4>
      </div>
    </div>
  </div>
</template>
```

### Contoh Button
```vue
<template>
  <button class="btn btn-primary">Primary Button</button>
  <button class="btn btn-secondary">Secondary Button</button>
  <button class="btn btn-success">Success Button</button>
</template>
```

### Contoh Card
```vue
<template>
  <div class="card">
    <div class="card-header">
      Card Header
    </div>
    <div class="card-body">
      <h5 class="card-title">Card Title</h5>
      <p class="card-text">Card content goes here.</p>
      <a href="#" class="btn btn-primary">Go somewhere</a>
    </div>
  </div>
</template>
```

### Contoh Modal
```vue
<template>
  <!-- Button trigger modal -->
  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button>

  <!-- Modal -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Modal content here...
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Kompabilitas dengan Element Plus

Bootstrap dapat digunakan bersamaan dengan Element Plus. Namun perhatikan:

1. **Conflicting Classes**: Beberapa class mungkin konflik. Gunakan CSS specificity atau custom CSS untuk override jika diperlukan.

2. **Component Priority**: Prioritaskan Element Plus untuk komponen UI yang kompleks (forms, tables, complex widgets), dan gunakan Bootstrap untuk layout, utilities, dan styling sederhana.

3. **Best Practices**:
   - Gunakan Bootstrap grid system untuk layout
   - Gunakan Bootstrap utilities untuk spacing, colors, display, dll
   - Gunakan Element Plus untuk form components, complex widgets
   - Gunakan Bootstrap untuk styling sederhana seperti buttons, cards, alerts

## Contoh Kombinasi Bootstrap + Element Plus

```vue
<template>
  <div class="container-fluid"> <!-- Bootstrap container -->
    <div class="row"> <!-- Bootstrap grid -->
      <div class="col-md-8"> <!-- Bootstrap column -->
        <!-- Element Plus form -->
        <el-form :model="form" label-width="120px">
          <el-form-item label="Activity name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="col-md-4"> <!-- Bootstrap column -->
        <div class="card"> <!-- Bootstrap card -->
          <div class="card-body">
            <h5 class="card-title">Information</h5>
            <p class="card-text">Additional info here.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Utilities yang Berguna

### Spacing
- `m-*`: margin
- `p-*`: padding
- `mt-*`, `mb-*`, `ms-*`, `me-*`: margin top, bottom, start, end

### Display
- `d-none`, `d-block`, `d-inline`, `d-flex`
- `d-md-none`, `d-lg-block`: responsive display

### Flexbox
- `d-flex`, `justify-content-center`, `align-items-center`
- `flex-column`, `flex-row`

### Text
- `text-center`, `text-start`, `text-end`
- `text-primary`, `text-secondary`, `text-success`, dll

### Background
- `bg-primary`, `bg-secondary`, `bg-light`, `bg-dark`

## Dokumentasi Lengkap

Untuk dokumentasi lengkap Bootstrap 5, kunjungi: https://getbootstrap.com/docs/5.3/