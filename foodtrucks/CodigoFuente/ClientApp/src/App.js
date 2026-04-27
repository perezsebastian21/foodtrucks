import MenuPrincial from './components/MenuPrincipal/MenuPrincipal'
import MenuSecundario from './components/MenuSecundario/MenuSecundario'
import ContenidoClient from './components/Contenido/ContenidoClient'
import Create from './components/Acciones/Create'
import Footer from './components/Footer/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import React, { useEffect } from "react";
import './App.css';
import ContenidoAdm from './components/ContenidoAdm/ContenidoAdm';
import RegistroFT from './components/Contenido/RegistroFT'
import Prueba from './components/Prueba/Prueba';
import ReseniasFT from './components/Contenido/ReseniasFT';
import EditRegistroFT from './components/Acciones/EditRegistroFT';
import VotacionFT from './components/Acciones/VotacionFT';
//import PruebaClient from './components/Prueba/PruebaClient';
import Login from './components/Login/Login'
import AdmReseniasFT from './components/ContenidoAdm/AdmReseniasFT';

function App() {

  const isTokenAvailable = () => {
    const token = localStorage.getItem("token");
    return token !== null;
  };

  useEffect(() => {
    const storageEventListener = (event) => {
      if (event.storageArea === localStorage && event.key === "token") {
        if (!isTokenAvailable()) {
          window.location.href = "/";
        }
      }
    };
    window.addEventListener("storage", storageEventListener);
    return () => {
      window.removeEventListener("storage", storageEventListener);
    };
  }, []);



  return (
    <div className="App">
      <MenuPrincial />

      <BrowserRouter>
        <Routes>
          <Route path='*' element={<Navigate to="/" />} />
          <Route path='/' element={<ContenidoClient />} />
          <Route path='/ReseniasFT/:id' element={<ReseniasFT />} />
          <Route path='/RegistroFT' element={<RegistroFT />} />
          <Route path='/VotacionFT/:id' element={<VotacionFT />} />
          <Route path='/mosaico/:id' element={<ContenidoClient />} />
          <Route path='/user' element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/adm' element={<ContenidoAdm />} />
            {/*<Route path='/edit/:id' element={ <Edit />} />*/}
            <Route path='/edit/:id' element={<EditRegistroFT />} />
            <Route path='/AdmReseniasFT/:id' element={<AdmReseniasFT />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Footer />

    </div>
  );
}

export default App;