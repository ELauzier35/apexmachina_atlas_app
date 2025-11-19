from app import app 

if __name__ == '__main__':
    app.run(debug=True, port=5050, host='localhost', ssl_context=('cert.pem', 'key.pem'))