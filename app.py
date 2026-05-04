from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/nosotros")
def nosotros():
    return render_template("nosotros.html")

@app.route("/servicios")
def servicios():
    return render_template("servicios.html")

@app.route("/proyectos")
def proyectos():
    return render_template("proyectos.html")

@app.route("/contacto")
def contacto():
    return render_template("contacto.html")

if __name__ == "__main__":
    app.run(debug=True)