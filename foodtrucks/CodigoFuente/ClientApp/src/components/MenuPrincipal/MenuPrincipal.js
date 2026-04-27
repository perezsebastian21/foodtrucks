import React from 'react'
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import LogoMDP from "../../assets/LOGOMarDelPlata.jpg"
import 'bootstrap/dist/css/bootstrap.min.css';
import '../MenuPrincipal/MenuPrincipal.css'


function MenuPrincipal() {
  return (
    <>
      <Navbar 
        collapseOnSelect 
        expand="lg" 
        style={{backgroundColor: '#24436f'}} 
        className="navbar-principal p-2"
      >
        <Container className="navFlex d-flex justify-content-center">
          <Navbar.Brand className="mx-auto"> 
            <a href="https://www.mardelplata.gob.ar/" name="Pagina de Inicio de la Municipalidad de General Pueyrredon">
              <span className="sr-only">Municipalidad de General Pueyrredon</span>
              <img 
                src={LogoMDP} 
                alt="MGP" 
                className="fotoMenu d-block mx-auto" 
                title=" "
              />
            </a>
          </Navbar.Brand>
        </Container>
      </Navbar> 
    </>
  )
}

export default MenuPrincipal