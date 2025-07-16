import os
import yt_dlp
import tempfile
import shutil
import re
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from uuid import uuid4

app = Flask(__name__)
CORS(app)

# Configuración para producción
if __name__ != "__main__":
    import logging
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

def limpiar_nombre_archivo(nombre):
    """Limpia el nombre del archivo para que sea válido en el sistema de archivos"""
    # Reemplazar caracteres no válidos con guiones
    nombre_limpio = re.sub(r'[<>:"/\|?*]', '-', nombre)
    # Remover espacios extra y puntos al final
    nombre_limpio = nombre_limpio.strip('. ')
    # Limitar longitud
    if len(nombre_limpio) > 100:
        nombre_limpio = nombre_limpio[:100]
    return nombre_limpio

class FileRemover:
    def __init__(self, filepath, tmpdir):
        self.filepath = filepath
        self.tmpdir = tmpdir
        self.file = open(filepath, 'rb')

    def read(self, *args):
        return self.file.read(*args)

    def close(self):
        try:
            self.file.close()
            # Primero eliminar el archivo
            if os.path.exists(self.filepath):
                os.remove(self.filepath)
                print(f"Archivo eliminado: {self.filepath}")
            # Luego eliminar la carpeta temporal
            if os.path.exists(self.tmpdir):
                shutil.rmtree(self.tmpdir)
                print(f"Carpeta temporal eliminada: {self.tmpdir}")
        except Exception as e:
            print(f"Error eliminando archivos: {e}")

    def __getattr__(self, name):
        return getattr(self.file, name)

@app.route("/api/info", methods=["POST"])
def info_video():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL no proporcionada"}), 400

    try:
        # Configuración para evitar playlists y obtener solo info
        opciones = {
            "noplaylist": True,  # ¡CLAVE! Evita descargar playlists
            "quiet": True,       # Reduce logs
        }
        
        with yt_dlp.YoutubeDL(opciones) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail")
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/descargar", methods=["POST"])
def descargar_audio():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL no proporcionada"}), 400

    tmpdir = tempfile.mkdtemp()

    try:
        nombre_archivo = str(uuid4())
        salida = os.path.join(tmpdir, f"{nombre_archivo}.%(ext)s")

        opciones = {
            "format": "bestaudio/best",
            "outtmpl": salida,
            "noplaylist": True,  # ¡CLAVE! Solo el video, no la playlist
            "quiet": True,       # Reduce logs
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }]
        }

        # Extraer información del video primero
        with yt_dlp.YoutubeDL(opciones) as ydl:
            info = ydl.extract_info(url, download=False)
            titulo_original = info.get('title', 'audio')

            # Limpiar el título para usarlo como nombre de archivo
            titulo_limpio = limpiar_nombre_archivo(titulo_original)
            print(f"Enviando archivo como: {titulo_limpio}.mp3")
            # Ahora descargar el audio
            ydl.download([url])

        archivo_final = salida.replace("%(ext)s", "mp3")

        if not os.path.exists(archivo_final):
            shutil.rmtree(tmpdir)
            return jsonify({"error": "No se encontró el archivo mp3"}), 404

        # Pasar tmpdir al FileRemover para que lo elimine después
        file_wrapper = FileRemover(archivo_final, tmpdir)
        response = send_file(
            file_wrapper,
            as_attachment=True,
            download_name=f"{titulo_limpio}.mp3",
            mimetype="audio/mpeg"
        )
        response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response

    except Exception as e:
        if os.path.exists(tmpdir):
            shutil.rmtree(tmpdir)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)