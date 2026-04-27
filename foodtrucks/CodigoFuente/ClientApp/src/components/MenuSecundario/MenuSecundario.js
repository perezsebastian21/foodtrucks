import React from 'react'
import './MenuSecundario.css'

function MenuSecundario() {
  return (
    
        <nav aria-label="Menu Secundario" className="navbar-secundario bg-nav p-3">
            <div className="left">
            <ul className="inline">
                <li><a className='link' href="https://www.mardelplata.gob.ar/Servicios">Trámites y Servicios</a></li>
                <li><a className='link' href="https://www.mardelplata.gob.ar/147">Atención al vecino</a></li>
                <li><a className='link' href="https://www.mardelplata.gob.ar/agenda">Agenda</a></li>
                <li><a className='link' href="http://www.turismomardelplata.gov.ar/">Turismo</a></li>
            </ul>
            </div>
            <div className="rigth">
            <form className="search-form clear-form" name="searchForm" action="https://www.mardelplata.gob.ar/search/node" method="GET" id="search-form" acceptCharset="UTF-8">
			<label className="sr-only" htmlFor="search">Buscador</label>
            <input className="InputSearch" type="text" id="edit-keys" name="keys" placeholder="Buscar" aria-label="Buscar"></input>
            <input type="hidden" name="form_build_id" value="form-L5sLTWCuClKx4ArVOlLSGXq_We5T9pG-BRbREttYTLQ"></input>
            <input type="hidden" name="form_id" value="search_form"></input>
            <button name="Buscar"><i className="fa fa-search" aria-hidden="true"></i></button>
            </form>
            </div>
        </nav>
        
    
   
  )
}

export default MenuSecundario