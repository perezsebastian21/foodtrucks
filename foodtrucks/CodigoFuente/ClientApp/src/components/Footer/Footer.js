import React from 'react'
import LogoMDP from "../../assets/LogoMarDelPlataFooter.jpg"
import './Footer.css'


function Footer() {
  return (


    <footer aria-label="Pié de página" className="bg-footer" >


      <div className="container">
        <div className="row">
          <div className="col-md-3 hide-mobile">
            <div className="p-2 mt-4">
              <img className="footerImagen" src={LogoMDP} alt="Logo Municipalidad de General Pueyrredón" />
            </div>
          </div>
          <div className="col-md-3">
            <h3>ACCESOS DIRECTOS</h3>
            <ul>
              <li><a href="https://www.mardelplata.gob.ar/EMVIAL">Vialidad y Alumbrado</a></li>
              <li><a href="http://www.turismomardelplata.gov.ar/">Turismo</a></li>
              <li><a href="https://www.mardelplata.gob.ar/deportes">Deporte</a></li>
              <li><a href="https://www.mardelplata.gob.ar/serviciosurbanos">Servicios Urbanos</a></li>
              <li><a href="https://www.mardelplata.gob.ar/ARM">Agencia de Recaudación Municipal</a></li>
              <li><a href="https://www.mardelplata.gob.ar/hacienda">Hacienda</a></li>
              <li><a href="https://www.mardelplata.gob.ar/cultura">Cultura</a></li>
              <li><a href="https://www.mardelplata.gob.ar/educacion">Educación</a></li>
              <li><a href="https://www.mardelplata.gob.ar/Seguridad">Seguridad</a></li>
              <li><a href="https://www.mardelplata.gob.ar/produccion">Producción</a></li>
              <li><a href="https://www.mardelplata.gob.ar/salud">Salud</a></li>
              <li><a href="https://www.mardelplata.gob.ar/INSPECCIONGENERAL">Inspección General</a></li>
            </ul>
          </div>
          <div className="col-md-3 segunda-columna">
            <ul>
              <li><a href="https://www.mardelplata.gob.ar/Desarrollo_social">Desarrollo Social</a></li>
              <li><a href="https://www.mardelplata.gob.ar/obras">Obras y Planeamiento Urbano</a></li>
              <li><a href="https://www.mardelplata.gob.ar/Gobierno">Gobierno</a></li>
              <li><a href="https://www.mardelplata.gob.ar/privada">Privada</a></li>
              <li><a href="https://www.mardelplata.gob.ar/modernizacion/gde">Modernización</a></li>
              <li><a href="https://www.mardelplata.gob.ar/movilidadurbana">Movilidad Urbana</a></li>
              <li><a href="https://www.mardelplata.gob.ar/gobierno-digital">Gobierno Digital</a></li>
              <li><a href="https://www.mardelplata.gob.ar/comunidad">Asuntos de la Comunidad</a></li>
              <li><a href="https://www.mardelplata.gob.ar/relacionesinternacionales">Relaciones Internacionales</a></li>
              <li><a href="https://www.mardelplata.gob.ar/defensadelconsumidor">Defensa del Consumidor</a></li>
              <li><a href="http://www.osmgp.gov.ar/">Obras Sanitarias</a></li>
              <li><a href="http://www.concejo.mdp.gob.ar/">Honorable Concejo Deliberante</a></li>
            </ul>
          </div>
          <div className="col-md-3 telefonos-utiles">
            <h3>TELÉFONOS DE EMERGENCIA</h3>
            <ul>
              <li>
                <a href="tel:107">
                  <span className="glyphicon-earphone"></span>
                  <div> 107 | Emergencias Médicas</div>
                </a>
              </li>
              <li>
                <a href="tel:145">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 145 | Trata de Personas</div>
                </a>
              </li>
              <li>
                <a href="tel:911">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 911 | Policía</div>
                </a>
              </li>
              <li>
                <a href="tel:102">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 102 | Niños en Riesgo</div>
                </a>
              </li>
              <li>
                <a href="tel:147">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 147 | Atención al Vecino</div>
                </a>
              </li>
              <li>
                <a href="tel:103">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 103 | Defensa Civil</div>
                </a>
              </li>
              <li>
                <a href="tel:108">
                  <span className="glyphicon glyphicon-earphone"></span>
                  <div> 108 | Violencia de Género</div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>

  )
}

export default Footer