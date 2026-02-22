from app import app, db, bcrypt
from models import Usuario
with app.app_context():
    db.create_all()
    hash = bcrypt.generate_password_hash("user1234").decode("utf-8")
    user = Usuario(username="user", password_hash=hash)
    db.session.add(user)
    db.session.commit()
    print("Usuario creado")
exit()