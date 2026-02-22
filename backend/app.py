import os
import yt_dlp
import tempfile
import shutil
import re
from uuid import uuid4
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from flask_session import Session
from flask_login import LoginManager, login_required
from flask_bcrypt import Bcrypt
from config import Config
from models import db, Usuario
from auth import auth

# === Configuración inicial de Flask ===
app = Flask(__name__)
app.config.from_object('config.Config')

# === CORS: permite el frontend local Y el de producción ===
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
]
# Si se define FRONTEND_URL en las env vars de Render, se agrega también
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

CORS(
    app,
    origins=allowed_origins,
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Disposition"],
)

# === Configuración de sesiones ===
Session(app)

# === Extensiones ===
db.init_app(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

# === Registrar blueprint ===
app.register_blueprint(auth)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Usuario, int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "No autorizado"}), 401

# === Manejador global de errores ===
@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    print(traceback.format_exc())
    return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"mensaje": "El backend está funcionando correctamente."}), 200

# === Función para limpiar nombres de archivo ===
def limpiar_nombre_archivo(nombre):
    nombre_limpio = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '-', nombre)
    nombre_limpio = nombre_limpio.strip('. ')
    return nombre_limpio[:100] or "audio"

# === Opciones base de yt-dlp para evitar detección de bots ===
def get_ydl_base_opts():
    opts = {
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        # Simular cliente iOS para evitar restricciones de bot
        "extractor_args": {
            "youtube": {
                "player_client": ["web", "ios", "android"],
                "po_token": ["web+auto"],
            }
        },
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                "Mobile/15E148 Safari/604.1"
            ),
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        "socket_timeout": 60,
        "retries": 3,
        "fragment_retries": 3,
    }

    # Si se proveen cookies exportadas del navegador (recomendado en producción)
    cookies_file = os.environ.get("YOUTUBE_COOKIES_FILE")
    if cookies_file and os.path.exists(cookies_file):
        opts["cookiefile"] = cookies_file

    # Proxy opcional (muy útil en producción)
    proxy = os.environ.get("YTDLP_PROXY")
    if proxy:
        opts["proxy"] = proxy

    return opts

# === Crear tablas ===
with app.app_context():
    db.create_all()

# === Obtener info del video ===
@app.route("/api/info", methods=["POST"])
@login_required
def info_video():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL no proporcionada"}), 400

    try:
        opciones = get_ydl_base_opts()
        with yt_dlp.YoutubeDL(opciones) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
            })
    except yt_dlp.utils.DownloadError as e:
        err = str(e)
        if "Sign in" in err or "bot" in err.lower():
            return jsonify({"error": "YouTube requiere verificación. Intenta con otro video o más tarde."}), 503
        if "unavailable" in err.lower():
            return jsonify({"error": "El video no está disponible o es privado."}), 404
        return jsonify({"error": f"No se pudo obtener información: {err}"}), 500

    except yt_dlp.utils.DownloadError as e:
        err = str(e)
        if "DRM" in err:
            return jsonify({"error": "Este video está protegido con DRM y no puede descargarse."}), 403
        if "Sign in" in err or "bot" in err.lower():
            return jsonify({"error": "YouTube requiere verificación. Intenta con otro video o más tarde."}), 503
        if "unavailable" in err.lower() or "private" in err.lower():
            return jsonify({"error": "El video no está disponible o es privado."}), 404
        return jsonify({"error": f"No se pudo obtener información: {err}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

# === Ruta para descargar audio ===
@app.route("/api/descargar", methods=["POST"])
@login_required
def descargar_audio():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL no proporcionada"}), 400

    tmpdir = tempfile.mkdtemp()

    try:
        nombre_uuid = str(uuid4())
        salida = os.path.join(tmpdir, f"{nombre_uuid}.%(ext)s")

        opciones = {
            **get_ydl_base_opts(),
            "format": "bestaudio/best",
            "outtmpl": salida,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",  # 320 innecesario para streaming; 192 es HQ
            }],
        }

        titulo_limpio = "audio"
        with yt_dlp.YoutubeDL(opciones) as ydl:
            info = ydl.extract_info(url, download=False)
            titulo_limpio = limpiar_nombre_archivo(info.get("title", "audio"))
            ydl.download([url])

        archivo_final = os.path.join(tmpdir, f"{nombre_uuid}.mp3")

        if not os.path.exists(archivo_final):
            # yt-dlp a veces usa extensión diferente; buscar el mp3
            for f in os.listdir(tmpdir):
                if f.endswith(".mp3"):
                    archivo_final = os.path.join(tmpdir, f)
                    break
            else:
                shutil.rmtree(tmpdir)
                return jsonify({"error": "No se encontró el archivo MP3 tras la conversión."}), 404

        download_name = f"{titulo_limpio}.mp3"

        def generate():
            try:
                with open(archivo_final, "rb") as f:
                    while chunk := f.read(8192):
                        yield chunk
            finally:
                shutil.rmtree(tmpdir, ignore_errors=True)

        from flask import Response
        response = Response(
            generate(),
            mimetype="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{titulo_limpio}.mp3",
                "Content-Length": str(os.path.getsize(archivo_final)),
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        )
        return response

    except yt_dlp.utils.DownloadError as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        err = str(e)
        if "Sign in" in err or "bot" in err.lower():
            return jsonify({"error": "YouTube bloqueó la descarga. Intenta más tarde."}), 503
        return jsonify({"error": f"Error de descarga: {err}"}), 500
    except Exception as e:
        shutil.rmtree(tmpdir, ignore_errors=True)
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


# === Iniciar servidor ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)

