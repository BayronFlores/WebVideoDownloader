# Descargador de Videos (Backend + Frontend)

Aplicación web para buscar y descargar videos fácilmente, con una interfaz moderna y responsiva. El proyecto está dividido en dos partes principales: un backend en Python (Flask) y un frontend en React con TypeScript.

## Características

- Búsqueda de videos por URL o término.
- Visualización de información relevante del video.
- Descarga de videos en diferentes formatos.
- Interfaz intuitiva y responsiva.
- Separación clara entre backend y frontend para facilitar el desarrollo y despliegue.

## Estructura del Proyecto

/
├── backend/
│ ├── server.py
│ ├── requirements.txt
│ └── render.yaml
└── frontend/
├── src/
│ ├── App.tsx
│ ├── main.tsx
│ ├── components/
│ │ ├── DownloadLink.tsx
│ │ ├── VideoInfo.tsx
│ │ ├── Footer.tsx
│ │ ├── StatusMessage.tsx
│ │ ├── Header.tsx
│ │ └── SearchInput.tsx
│ ├── hooks/
│ │ ├── useDownloader.ts
│ │ └── useDeviceDetection.ts
│ ├── App.css
│ └── index.css

## Requisitos

- Backend: Python 3.8 o superior
- Frontend: Node.js 16 o superior y npm

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Uso

1. Abre la aplicación en tu navegador (http://localhost:5173).
2. Ingresa la URL o término de búsqueda en la barra principal.
3. Visualiza la información del video.
4. Haz clic en el enlace de descarga para obtener el video en el formato disponible.

## Ejemplo de Uso

- Buscar un video: Escribe una URL de YouTube o un término de búsqueda y presiona Enter.
- Ver información: Se mostrará el título, miniatura y detalles del video.
- Descargar: Haz clic en el botón de descarga para guardar el video en tu dispositivo.
