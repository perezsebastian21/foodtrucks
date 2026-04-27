import React, { useState } from "react";
import "../Login/Login.css";
import { useNavigate } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import jwt_decode from "jwt-decode";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [Usuario, setUsername] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = (event) => {
    event.preventDefault();
    axios.post(process.env.REACT_APP_API_URL + 'account/login', { Usuario, Password }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': true
      }
    })
      .then((response) => {
        const token = response.data.token || (response.data.value && response.data.value.token);
        localStorage.setItem('token', token);
        const decodedToken = jwt_decode(token);
        navigate("/adm");
      })
      .catch((error) => {
        setError(error.message);
        console.log('Login Incorrecto')
      });
  };

  const onUsername = (e) => {
    setUsername(e.target.value);
  };

  const onPassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="displayLogin">
      <Form className="formLogIn" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        {error && <div className="alert alert-danger">Nombre de usuario o contraseña incorrecto.</div>}
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            placeholder="Usuario"
            aria-label="Usuario"
            aria-describedby="basic-addon1"
            value={Usuario}
            onChange={onUsername}

          />
        </InputGroup>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Password"
            aria-label="Password"
            aria-describedby="basic-addon1"
            type="password"
            value={Password}
            onChange={onPassword}
          />
        </InputGroup>
        <button type='submit' className="btn btn-primary">
          Iniciar sesión
        </button>
      </Form>
    </div>
  );
}
export default Login;
