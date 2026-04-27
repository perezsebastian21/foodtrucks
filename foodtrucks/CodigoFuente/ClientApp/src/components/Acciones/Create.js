import axios from 'axios'
import { useState , useEffect} from 'react'
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom'
import SinTACC from '../../assets/SinTACC2.png';
import Vegano from '../../assets/Vegetariano.png'
import User from '../../assets/user.png';
import Vegetariano from '../../assets/Vegetariano2.png'
import Mail from '../../assets/mail.png';
import Ubicacion from '../../assets/ubicacion.png';
import Menu from '../../assets/restaurant.png';
import Pregunta from '../../assets/pregunta.png';
import Arroba from '../../assets/arroba.png';
import Telefono from '../../assets/phone.png'
import Imagen from '../../assets/image.png';
import Celiaco from '../../assets/celiaco.png';
import './Accion.css';
import swal from 'sweetalert';    
import { Button } from 'bootstrap';

const URLPeticion = process.env.REACT_APP_API_URL + `categoria/getall`
const URL = process.env.REACT_APP_API_URL + 'foodtruck/'

const Create = () => {
    const [nombreFantasia, setNombreFantasia] = useState('')
    const [titular, setTitular] = useState('')
    const [email, setEmail] = useState('')
    const [menu, setMenu] = useState ('') 
    const [vegano, setVegano] = useState ('')
    const [vegetariano , setVegetariano] = useState ('')
    const [sintacc , setSinTacc] = useState ('')  
    const [emplazado, setEmplazado] = useState ('')
    const [celiaco, setCeliaco] = useState ('')
    const [activo, setActivo] = useState ('')
    const [telefono, setTelefono] = useState ('')
    const navigate = useNavigate() 
    //const [logo, setLogo] = useState(null)
    //const [logoBase64, setLogoBase64] = useState('')
    const [logo, setLogo] = useState('')
    const [logoPreview, setLogoPreview] = useState('') // Para vista previa
    const token = localStorage.getItem('token');
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');


    useEffect( ()=>{
        getFoodIdCategoria()
    },[])

    const getFoodIdCategoria = async () => {
        try {
        const res = await axios.get(URLPeticion)
        const data = res.data;

        // Almacena los datos en el estado de categorias
        setCategorias(data);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
        if(error.response && error.response.status == 401){
            localStorage.removeItem("token"); // Eliminar el token del almacenamiento local
            navigate('/user');
          }
      }
    }

    const handleCategoriaChange = (event) => {
        setSelectedCategoria(event.target.value);
    };
    
    // Convertir archivo a Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    };
    
    //procedimiento guardar
    const store = async (e) => {
        e.preventDefault();
    
        try {
            // Crear objeto de datos para enviar
            const postData = {
                nombreFantasia,
                titular,
                email,
                menu,
                vegano,
                vegetariano,
                sintacc,
                emplazado,
                activo,
                logo: logo, // Enviamos la imagen como string Base64
                celContacto: telefono,
                idCategoria: selectedCategoria,
                celiaco
            };
            
            await axios.post(URL, postData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            swal("Se ha creado Exitosamente", " ", "success");
            navigate('/adm');
        } catch (error) {
            swal("No se ha podido crear", "Algo salió mal ", "error");
            console.error("Error al crear:", error);
            if(error.response && error.response.status == 401){
                localStorage.removeItem("token"); // Eliminar el token del almacenamiento local
                navigate('/user');
            }
        }
    };

    const handleImagenChange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        if (file) {
            try {
                setLogo(file);
                
                // Convertir a Base64
                //const base64 = await fileToBase64(file);
                let base64 = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                console.log("Base64 antes de split:", base64);
                base64 = reader.result.split(',')[1];
                setLogo(base64);
                //console.log("Base64 después de split:", base64);
                // Crear URL para vista previa (mismo base64)
                setLogoPreview(base64);
                //console.log("Imagen convertida a Base64 correctamente");
            } catch (error) {
                console.error("Error al convertir la imagen:", error);
                swal("Error", "No se pudo procesar la imagen", "error");
            }
        }
    };

    return (
        <div className='contenido'>
           <h2>Alta FoodTrucks</h2>
           <form className='formADM' onSubmit={store}>
                <div className='sectionForm'>
                    <div className='campoForm'>
                      <label className='formLabelADM'><img src={Arroba}/>Nombre Fantasia</label>
                    <input
                        value={nombreFantasia}
                        onChange={ (e)=> setNombreFantasia(e.target.value)} 
                        type="text"
                        className='form-control'
                        required
                    />                 
                    </div>
                    <div className='campoForm'>
                     <label className='formLabelADM'><img src={Telefono}/>Telefono</label>
                    <input
                        value={telefono}
                        onChange={ (e)=> setTelefono(e.target.value)} 
                        type="text"
                        className='form-control'
                    />   
                    </div>              
                 </div>
                <div className='sectionForm'>
                    <div className='campoForm'>
                        <label className='formLabelADM'><img src={User}/>Titular</label>
                        <input
                            value={titular}
                            onChange={ (e)=> setTitular(e.target.value)} 
                            type="text"
                            className='form-control'
                            required
                        />                 
                    </div>
                    <div className='campoForm'>
                        <label className='formLabelADM'><img src={Mail}/>Correo Electrónico</label>
                        <input
                            value={email}
                            onChange={ (e)=> setEmail(e.target.value)} 
                            type="text"
                            className='form-control'
                            required
                        />   
                    </div>              
                </div>
                <div className="sectionForm">
                    <div className='campoForm'>
                        <label  className="formLabelADM"><img src={Menu}/>Menú</label>
                        <input
                            value={menu}
                            onChange={ (e)=> setMenu(e.target.value)}
                            type="text"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="campoForm">
                        <label className="formLabelADM">Categoría</label>
                        <Form.Select value={selectedCategoria} onChange={handleCategoriaChange} required>
                            <option value="">-- Seleccione categoría --</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.idCategoria} value={categoria.idCategoria}> {categoria.nombre}</option>
                            ))}
                        </Form.Select>
                    </div>
                </div> 
                <div className='sectionForm'>
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={Vegano}/>Vegano</label>
                        <Form.Select className="Inputs" value={vegano}  onChange={ (e)=> setVegano(e.target.value)} > 
                            <option value="N">No</option>
                            <option value="S">Si</option>
                        </Form.Select>
                    </div>   
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={Vegetariano}/>Vegetariano</label>
                        <Form.Select className="Inputs" value={vegetariano}  onChange={ (e)=> setVegetariano(e.target.value)} > 
                            <option value="N">No</option>
                            <option value="S">Si</option>
                        </Form.Select>
                    </div> 
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={SinTACC}/> Sin TACC</label>
                        <Form.Select className="Inputs" value={sintacc}  onChange={ (e)=> setSinTacc(e.target.value)} > 
                            <option value="N">No</option>
                            <option value="S">Si</option>
                        </Form.Select>
                    </div> 
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={Celiaco}/> Apto Celíaco</label>
                        <Form.Select className="Inputs" value={celiaco}  onChange={ (e)=> setCeliaco(e.target.value)} > 
                            <option value="N">No</option>
                            <option value="S">Si</option>
                        </Form.Select>
                    </div> 
                </div>
                <div className='sectionForm'>
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={Ubicacion}/>Emplazado</label>
                        <Form.Select className="Inputs" value={emplazado}  onChange={ (e)=> setEmplazado(e.target.value)} > 
                            <option value="N">No</option>
                            <option value="S">Si</option>
                        </Form.Select>
                    </div> 
                    <div className="campoForm">
                        <label  className="formLabelADM"><img src={Pregunta}/>Estado</label>
                        <Form.Select className="Inputs" value={activo}  onChange={ (e)=> setActivo(e.target.value)} > 
                            <option value={true}>Activo</option>
                            <option value={false}>Inactivo</option>
                        </Form.Select>
                    </div>
                </div> 
                <div className='sectionForm'>    
                    <div className="">
                        <label className="formLabelADM"><img src={Imagen}/>Imagen</label>
                        <input
                            onChange={handleImagenChange}
                            type="file"
                            name='logo'
                            accept="image/*"
                            className="form-control"
                        />
                        {logoPreview && (
                            <div className="mt-2">
                                <img src={logoPreview} alt="Logo preview" style={{maxWidth: '100px', maxHeight: '100px'}} />
                            </div>
                        )}
                    </div> 
                </div>
                <div className='boton'>
                 <button type='submit' className='btn btn-primary'>Guardar</button>
                </div>
           </form>
        </div>
    )
}

export default Create