import axios from 'axios';
import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import ReactPaginate from "react-paginate";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Siguiente from '../../assets/der.png';
import Anterior from '../../assets/izq.png';
import User from '../../assets/user.png';
import Menu from '../../assets/restaurant.png';
import Mail from '../../assets/mail.png';
import Ubicacion from '../../assets/ubicacion.png';
import Vegetariano from '../../assets/Vegetariano2.png'
import sintacc from '../../assets/SinTACC2.png'
import Vegano from '../../assets/Vegetariano.png'
import NoImage from '../../assets/NoDisponible.png'
import '../ContenidoAdm/ContenidoAdm.css';
import { Buffer } from "buffer";

function Prueba() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [limit, setLimit] = useState(3);
  const [rows, setRows] = useState(0);
  const [vegie, setVegie] = useState('');
  const [vegetariano, setVegetariano] = useState('');
  const [sinTACC , setSinTACC] = useState ('');
  const [emplazado, setEmplazado] = useState('');
  const [activo, setActivo] = useState ('');
  const [foodTrucks, setFoodTrucks] = useState([]);

//-------------------------------------Obtengo ID-------------------------------//

  // Obtener la URL de la página anterior del usuario
  const referrerUrl = document.referrer;

  // Parsear la cadena de consulta de la URL de la página anterior
    const referrerParams = new URLSearchParams(referrerUrl.split('&')[1]);

  // Obtener el valor del parámetro Categoria de la URL de la página anterior
    const id = referrerParams.get('IdCategoria');

//----------------------------------Fin ID------------------------------------------//

//--------------------------------Inicio Peticion-------------------------------//

  const searchFoodTrucks = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + `foodtruck/FindQP?IdFT=&IdCategoria=&searchString=${keyword}&vegano=${vegie}&vegetariano=${vegetariano}&sinTacc=${sinTACC}&emplazado=${emplazado}&activo=${activo}&page=${page}&limit=${limit}`
        );
      setFoodTrucks(response.data.data.data);
      setPage(response.data.data.page);
      setPages(response.data.data.totalPage);
      setRows(response.data.data.totalRows);
    } catch (error) {
      console.log(error);
    }
  }

  const handleSearch = () => {
    setPage(0);
    setLimit(3)
    searchFoodTrucks();
  }

  //-------------------------Fin Peticion---------------------------------------//

 //----------------------------BTN Reset---------------------------------------//

  const resetInput = () => {
    setKeyword("");
    setPage("");
    setRows("");
    setPages(0);
    setLimit(3);
    setActivo("");
    setEmplazado("");   
    setSinTACC("");
    setFoodTrucks([]);
    setVegetariano("");
    setVegie("");

  };
 //-------------------------Fin BTN Reset---------------------------------------//
//--------------------------Modal------------------------------------------------//

 const values = [true]; 
 const [fullscreen, setFullscreen] = useState(true);
 const [show, setShow] = useState(false);
 
 function handleShow(breakpoint) {
   setFullscreen(breakpoint);
   setShow(true);
 } 
 const handleClose = () => setShow(false);

 //--------------------------Fin Modal------------------------------------------------//

//--------------------------------------Paginador------------------------------//
const changePage = ({ selected }) => {
  setPage(selected);
};

//--------------------------------------Fin Paginador------------------------------//



  return (
    <>
    <h2>PruebaClient</h2>
    
    <div className="contenido">
      <div className="FormularioClient">
        <Form.Control type="text" className="Inputs" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Button variant="success"  onClick={handleSearch} > Buscar </Button>
        <Button variant="danger" onClick={resetInput} className="Inputs"> Reset </Button>
      </div>
      <div className="FormularioFilter">
      <div>
    <label>Vegano</label>
      <Form.Select value={vegie} onChange={(e) => setVegie(e.target.value)}>
        <option value="">--Todos--</option>
        <option value="N">No</option>
        <option value="S">Si</option>
      </Form.Select>
      </div>
      <div>
      <label>Vegetariano</label>
      <Form.Select value={vegetariano} onChange={(e) => setVegetariano(e.target.value)}>
        <option value="">--Todos--</option>
        <option value="N">No</option>
        <option value="S">Si</option>
      </Form.Select>
      </div>
      <div>
      <label>Sin TACC</label>
      <Form.Select value={sinTACC} onChange={(e) => setSinTACC(e.target.value)}>
        <option value="">--Todos--</option>
        <option value="N">No</option>
        <option value="S">Si</option>
      </Form.Select>
      </div>
      <div>
      <label>Emplazado</label>
      <Form.Select value={emplazado} onChange={(e) => setEmplazado(e.target.value)}>
        <option value="">--Todos--</option>
        <option value="N">No</option>
        <option value="S">Si</option>
      </Form.Select>
      </div>
      <div>
      <label>Estado</label>
      <Form.Select value={activo} onChange={(e) => setActivo(e.target.value)}>
        <option value="">--Todos--</option>
        <option value="N">Inactivo</option>
        <option value="S">Activo</option>
      </Form.Select>
      </div>
      </div>
      <br/><br/>
      {foodTrucks.map( (foodtruck) =>(      
            <Card className="cardHorizontal" style={{ width: '50rem' }} key={foodtruck.IdFT}>
            {foodtruck.logo ? (
                    <Card.Img src={`data:image/*;base64,${Buffer.from(foodtruck.logo)}`} />
                  ) : (
                    <Card.Img src={NoImage}/>
            )}
              <Card.Body className="cardBody">
                <Card.Title>{foodtruck.nombreFantasia}</Card.Title>

                  {values.map((v, idx) => (
                    <Button key={idx} variant="outline-info" size="sm" onClick={() => handleShow(v, foodtruck)}>+ Mas Info</Button>
                  ))}

                <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}  size="lg">
                  <Modal.Header>
                    <Modal.Title>{foodtruck.nombreFantasia}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body key={foodtruck.IdFT}>
                    <div className="display">
                      {foodtruck.logo ? (
                        <img className="imagenCard" src={`data:image/*;base64,${Buffer.from(foodtruck.logo)}`} />
                        ) : ( 
                        <img className="imagenCard" src={NoImage}/>
                        )}
                      
                      <div>
                        <div className="display">
                          <img src={User}/>
                          <h5><b className="textoModal">Titular : </b>{foodtruck.titular}</h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={Mail}/>
                          <h5><b className="textoModal">  Correo Electronico : </b>{foodtruck.email}</h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={Menu}/>
                          <h5><b className="textoModal">  Menu : </b>{foodtruck.menu}</h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={Vegano}/>
                          <h5 className="prueba"><b className="textoModal">Opcion Vegana: </b>{foodtruck.vegano === "S" ? "Sí" : "No"}</h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={Vegetariano}/>
                          <h5 className="prueba"><b className="textoModal">Opcion Vegetariana: </b>{foodtruck.vegetariano === "S" ? "Sí" : "No"} </h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={sintacc}/>
                          <h5 className="prueba"><b className="textoModal">Opcion SinTACC: </b>{foodtruck.sinTACC === "S" ? "Sí" : "No"} </h5><br/>
                        </div>
                        <div className="display espacio">
                          <img src={Ubicacion}/>
                          <h5><b className="textoModal">  Emplazado o Eventos: </b>{foodtruck.emplazado === "S" ? "Sí" : "No"} </h5><br/>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}> Cerrar </Button>
                  </Modal.Footer>
                </Modal>
              </Card.Body>
            </Card>
      ))}

      
      
    </div>
    <nav className="pagination is-centered espacio" role="navigation" aria-label="pagination">
            <ReactPaginate
              previousLabel={<img src={Anterior}/>}
              nextLabel={<img src={Siguiente}/>}
              pageCount={Math.min(10, pages)}
              onPageChange={changePage}
              forcePage={changePage}
              containerClassName={"pagination-list"}
              pageLinkClassName={"pagination-link"}
              previousLinkClassName={"pagination-previous"}
              nextLinkClassName={"pagination-next"}
              activeLinkClassName={"pagination-link is-current"}
              disabledLinkClassName={"pagination-link is-disabled"}
            />
          </nav>
    </>
  );
}

export default Prueba;
  
  
  