import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import './EditRegistroFT.css';
const CustomModal = ({ show, onClose, children }) => {
    if (!show) {
        return null;
    }
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                }}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};


const EdicionFT = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [foodTruckData, setFoodTruckData] = useState(null);
    const [nombreFantasia, setNombreFantasia] = useState('');
    const [titular, setTitular] = useState('');
    const [cuitCuil, setCuitCuil] = useState('');
    const [domicilioLegal, setDomicilioLegal] = useState('');
    const [telefono, setTelefono] = useState('');
    const [emailTitular, setEmailTitular] = useState('');
    const [emailContacto, setEmailContacto] = useState('');
    const [numeroRegistro, setNumeroRegistro] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [menu, setMenu] = useState('');
    const [emplazado, setEmplazado] = useState('');
    const [solicitudIngreso, setSolicitudIngreso] = useState('');
    const [consumo, setConsumo] = useState('');
    const [estado, setEstado] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [cartaMenu, setCartaMenu] = useState([]);
    const [categoriasIds, setCategoriasIds] = useState([]);
    const [opcionesCategoria, setOpcionesCategoria] = useState([]);
    const [errors, setErrors] = useState({});

    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');
    useEffect(() => {
    const fetchCategorias = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}categoria/GetAll`);
            const categorias = response.data.map(cat => ({
                value: cat.idCategoria.toString(),
                label: cat.nombre
            }));
            setOpcionesCategoria(categorias);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        }
    };

    fetchCategorias();
}, []);

    useEffect(() => {
        const fetchFoodTruck = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}foodtruck/GetById?idFT=${id}`);
                const data = response.data;
                setFoodTruckData(data);
                setNombreFantasia(data.nombreFantasia || '');
                setTitular(data.titular || '');
                setCuitCuil(data.cuitCuil || '');
                setDomicilioLegal(data.domicilioLegal || '');
                setTelefono(data.telefono || '');
                setEmailTitular(data.emailTitular || '');
                setEmailContacto(data.emailContacto || '');
                setNumeroRegistro(data.numeroRegistro || '');
                setEstado(data.estado || '');
                setObservaciones(data.observaciones || '');
                setFechaVencimiento(data.fechaVencimiento ? data.fechaVencimiento.split('T')[0] : '');
                setMenu(data.menu || '');
                setEmplazado(data.emplazado || '');
                setSolicitudIngreso(data.solicitudIngreso || '');
                setConsumo(data.consumo || '');
                 if (data.foodtrucksCategorias && data.foodtrucksCategorias.length > 0) {
                    const ids = data.foodtrucksCategorias.map(cat => cat.idCategoria.toString());
                    setCategoriasIds(ids);
                } else {
                    setCategoriasIds([]);
                }

            } catch (error) {
                console.error('Error fetching food truck data:', error);
                swal("Error", "No se pudo cargar la información del Food Truck.", "error").then(() => {
                    navigate('/');
                });
            }
        };

        if (id) {
            fetchFoodTruck();
        }
    }, [id, navigate]);

    const handleInputChange = (setter, fieldName) => (e) => {
        setter(e.target.value);
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!nombreFantasia.trim()) newErrors.nombreFantasia = 'Campo requerido';
        if (!titular.trim()) newErrors.titular = 'Campo requerido';
        if (!cuitCuil.trim()) newErrors.cuitCuil = 'Campo requerido';
        if (!domicilioLegal.trim()) newErrors.domicilioLegal = 'Campo requerido';
        if (!telefono.trim()) newErrors.telefono = 'Campo requerido';
        if (!emailTitular.trim()) newErrors.emailTitular = 'Campo requerido';
        if (!estado) newErrors.estado = 'Campo requerido';
        if (!emailContacto.trim()) newErrors.emailContacto = 'Campo requerido';
        if (!menu.trim()) { newErrors.menu = 'Campo requerido'; } else if (menu.length > 100) {  newErrors.menu = 'Máximo 100 caracteres'; }
        if (!numeroRegistro.trim()) newErrors.numeroRegistro = 'Campo requerido';
        if (!emplazado) newErrors.emplazado = 'Campo requerido';
        if (!solicitudIngreso) newErrors.solicitudIngreso = 'Campo requerido';
        if (!fechaVencimiento.trim()) newErrors.fechaVencimiento = 'Campo requerido';
        if (!consumo.trim()) newErrors.consumo = 'Campo requerido';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const formData = new FormData();
        formData.append('idFT', id);
        formData.append('nombreFantasia', nombreFantasia);
        formData.append('titular', titular);
        formData.append('cuitCuil', cuitCuil);
        formData.append('domicilioLegal', domicilioLegal);
        formData.append('telefono', telefono);
        formData.append('emailTitular', emailTitular);
        formData.append('emailContacto', emailContacto);
        formData.append('numeroRegistro', numeroRegistro);
        formData.append('estado', estado);
        formData.append('observaciones', observaciones);
        formData.append('fechaVencimiento', fechaVencimiento);
        formData.append('emplazado', emplazado);
        formData.append('solicitudIngreso', solicitudIngreso);
        formData.append('consumo', consumo);
        formData.append('menu', menu);
        if (foodTruckData.dniFrente) {
            formData.append('dniFrente', base64ToBlob(foodTruckData.dniFrente, 'image/jpeg'), 'dniFrente.jpeg');
        }
        if (foodTruckData.dniDorso) {
            formData.append('dniDorso', base64ToBlob(foodTruckData.dniDorso, 'image/jpeg'), 'dniDorso.jpeg');
        }
        if (foodTruckData.habilitacion) {
            formData.append('habilitacion', base64ToBlob(foodTruckData.habilitacion, 'application/pdf'), 'habilitacion.pdf');
        }
        if (foodTruckData.cartaMenu) {
            formData.append('cartaMenu', base64ToBlob(foodTruckData.cartaMenu, 'image/jpeg'), 'cartaMenu.jpeg');
        }
        if (foodTruckData.logo) {
            formData.append('logo', base64ToBlob(foodTruckData.logo, 'image/jpeg'), 'logo.jpeg');
        }
        if (foodTruckData.ftFrente) {
            formData.append('ftFrente', base64ToBlob(foodTruckData.ftFrente, 'image/jpeg'), 'ftFrente.jpeg');
        }
        if (foodTruckData.ftTrasera) {
            formData.append('ftTrasera', base64ToBlob(foodTruckData.ftTrasera, 'image/jpeg'), 'ftTrasera.jpeg');
        }
        if (foodTruckData.ftIzquierda) {
            formData.append('ftIzquierda', base64ToBlob(foodTruckData.ftIzquierda, 'image/jpeg'), 'ftIzquierda.jpeg');
        }
        if (foodTruckData.ftDerecha) {
            formData.append('ftDerecha', base64ToBlob(foodTruckData.ftDerecha, 'image/jpeg'), 'ftDerecha.jpeg');
        }

        categoriasIds.forEach(catId => {
            formData.append("categoriasIds", catId);
        });
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}foodtruck/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                swal("Food Truck Actualizado Exitosamente", "La información ha sido modificada", "success").then(() => {
                    navigate('/');
                });
            }
        } catch (error) {
            swal("No se ha podido Actualizar", "Algo salió mal", "error");
            console.error('Error al enviar el formulario de edición:', error);
        }
    };

    const handleCheckboxChange = (value) => (e) => {
        const val = value.toString();
        if (e.target.checked) {
            setCategoriasIds(prev => [...prev, val]);
        } else {
            setCategoriasIds(prev => prev.filter(item => item !== val));
        }
    };
const handleViewFile = (base64Data, fileName) => {
    if (!base64Data) {
        swal("Error", "No hay archivo para mostrar.", "info");
        return;
    }

    const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : '';

    if (fileExtension === 'pdf') {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 100);

    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        setModalContent(`data:image/${fileExtension};base64,${base64Data}`);
        setShowModal(true);
    } else {
        swal("Advertencia", "Tipo de archivo no soportado para previsualización.", "warning");
    }
};
    const closeModal = () => {
        setShowModal(false);
        setModalContent('');
    };

    if (!foodTruckData) {
        return <div>Cargando información del Food Truck...</div>;
    }

const base64ToBlob = (base64, mimeType = 'application/octet-stream') => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

    return (
        <div className='contenido'>
            <h2>Edición de Food Truck</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label>Nombre fantasía:</label>
                    <input
                        type="text"
                        value={nombreFantasia}
                        onChange={handleInputChange(setNombreFantasia, 'nombreFantasia')}
                        className={errors.nombreFantasia ? 'error-input' : ''}
                    />
                    {errors.nombreFantasia && <div className="error-message">{errors.nombreFantasia}</div>}
                </div>

                <div className="form-group">
                    <label>Titular de la Habilitación:</label>
                    <input
                        type="text"
                        value={titular}
                        onChange={handleInputChange(setTitular, 'titular')}
                        className={errors.titular ? 'error-input' : ''}
                    />
                    {errors.titular && <div className="error-message">{errors.titular}</div>}
                </div>

                <div className="form-group">
                    <label>CUIT/CUIL:</label>
                    <input
                        type="text"
                        value={cuitCuil}
                        onChange={handleInputChange(setCuitCuil, 'cuitCuil')}
                        className={errors.cuitCuil ? 'error-input' : ''}
                    />
                    {errors.cuitCuil && <div className="error-message">{errors.cuitCuil}</div>}
                </div>

                <div className="form-group">
                    <label>Domicilio Legal:</label>
                    <input
                        type="text"
                        value={domicilioLegal}
                        onChange={handleInputChange(setDomicilioLegal, 'domicilioLegal')}
                        className={errors.domicilioLegal ? 'error-input' : ''}
                    />
                    {errors.domicilioLegal && <div className="error-message">{errors.domicilioLegal}</div>}
                </div>

                <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                        type="tel"
                        value={telefono}
                        onChange={handleInputChange(setTelefono, 'telefono')}
                        className={errors.telefono ? 'error-input' : ''}
                    />
                    {errors.telefono && <div className="error-message">{errors.telefono}</div>}
                </div>

                <div className="form-group">
                    <label>Email Titular:</label>
                    <input
                        type="email"
                        value={emailTitular}
                        onChange={handleInputChange(setEmailTitular, 'emailTitular')}
                        className={errors.emailTitular ? 'error-input' : ''}
                    />
                    {errors.emailTitular && <div className="error-message">{errors.emailTitular}</div>}
                </div>

                <div className="form-group">
                    <label>Email Contacto:</label>
                    <input
                        type="email"
                        value={emailContacto}
                        onChange={handleInputChange(setEmailContacto, 'emailContacto')}
                        className={errors.emailContacto ? 'error-input' : ''}
                    />
                    {errors.emailContacto && <div className="error-message">{errors.emailContacto}</div>}
                </div>
                <div className="form-group">
                    <label>Estado:</label>
                    <select
                        value={estado}
                        onChange={handleInputChange(setEstado, 'estado')}
                        className={errors.estado ? 'error-input' : ''}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                        <option value="S">Suspendido</option>
                        <option value="B">Eliminado</option>
                    </select>
                    {errors.estado && <div className="error-message">{errors.estado}</div>}
                </div>
                {estado === 'S' && (
                    <div className="form-group" style={{ gridColumn: '2' }}>
                        <label>Observaciones por suspensión:</label>
                        <textarea
                            value={observaciones}
                            onChange={handleInputChange(setObservaciones, 'observaciones')}
                            rows={4}
                            cols={40}
                            placeholder="Ingrese motivo de suspensión..."
                        />
                    </div>
                )}
                <div className="form-group full-width file-upload">
                    <label>DNI Frente:</label>
                    <div className="current-file-display">
                        {foodTruckData.dniFrente ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.dniFrente, 'dniFrente.jpeg'); }}>Ver DNI Frente Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.dniFrente && <div className="error-message">{errors.dniFrente}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>DNI Dorso:</label>
                    <div className="current-file-display">
                        {foodTruckData.dniDorso ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.dniDorso, 'dniDorso.jpeg'); }}>Ver DNI Dorso Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.dniDorso && <div className="error-message">{errors.dniDorso}</div>}
                </div>

                <div className="form-group">
                    <label>Número de Registro/GDE:</label>
                    <input
                        type="text"
                        value={numeroRegistro}
                        onChange={handleInputChange(setNumeroRegistro, 'numeroRegistro')}
                        className={errors.numeroRegistro ? 'error-input' : ''}
                    />
                    {errors.numeroRegistro && <div className="error-message">{errors.numeroRegistro}</div>}
                </div>

                <div className="form-group">
                    <label>Fecha Vencimiento Habilitación:</label>
                    <input
                        type="date"
                        value={fechaVencimiento}
                        onChange={handleInputChange(setFechaVencimiento, 'fechaVencimiento')}
                        className={errors.fechaVencimiento ? 'error-input' : ''}
                    />
                    {errors.fechaVencimiento && <div className="error-message">{errors.fechaVencimiento}</div>}
                </div>

                <div className="form-group">
                    <label>Consumo (KW/A):</label>
                    <input
                        type="text"
                        value={consumo}
                        onChange={handleInputChange(setConsumo, 'consumo')}
                        placeholder=" Ej: 5KW / 20A "
                        className={errors.consumo ? 'error-input' : ''}
                    />
                    {errors.consumo && <div className="error-message">{errors.consumo}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>Habilitación (PDF):</label>
                    <div className="current-file-display">
                        {foodTruckData.habilitacion ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.habilitacion, 'habilitacion.pdf'); }}>Ver Habilitación Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.fileInputPDF && <div className="error-message">{errors.fileInputPDF}</div>}
                </div>

                <div className="form-group full-width checkbox-section">
                    <label>Categoría:</label>
                    <div className="checkbox-group">
                        {opcionesCategoria.map((opcion) => (
                            <label key={opcion.value}>
                                <input
                                    type="checkbox"
                                    value={opcion.value}
                                    checked={categoriasIds.includes(opcion.value)}
                                    onChange={handleCheckboxChange(opcion.value)}
                                />
                                {opcion.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group full-width file-upload">
                    <label>Carta/Menú (Imagen):</label>
                    <div className="current-file-display">
                        {foodTruckData.cartaMenu ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.cartaMenu, 'cartaMenu.jpeg'); }}>Ver Carta/Menú Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.cartaMenu && <div className="error-message">{errors.cartaMenu}</div>}
                </div>

                <div className="form-group full-width">
                    <label>Descripción Menú:</label>
                    <textarea
                        value={menu}
                        onChange={handleInputChange(setMenu, 'menu')}
                        className={errors.menu ? 'error-input' : ''}
                        maxLength={100}
                        style={{ width: "100%" }}
                        rows={3}
                        placeholder="Breve descripción de tu menú (máx 100 caracteres)"
                    />
                    <div className="character-counter">
                        {menu.length}/100 caracteres
                    </div>
                    {errors.menu && <div className="error-message">{errors.menu}</div>}
                </div>

                <div className="form-group">
                    <label>Emplazado:</label>
                    <select
                        value={emplazado}
                        onChange={handleInputChange(setEmplazado, 'emplazado')}
                        className={errors.emplazado ? 'error-input' : ''}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="S">Sí</option>
                        <option value="N">No</option>
                    </select>
                    {errors.emplazado && <div className="error-message">{errors.emplazado}</div>}
                </div>

                <div className="form-group">
                    <label>Solicitud para ingresar:</label>
                    <select
                        value={solicitudIngreso}
                        onChange={handleInputChange(setSolicitudIngreso, 'solicitudIngreso')}
                        className={errors.solicitudIngreso ? 'error-input' : ''}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="1">Ferias fijas</option>
                        <option value="2">Eventos</option>
                        <option value="3">Ambos</option>
                    </select>
                    {errors.solicitudIngreso && <div className="error-message">{errors.solicitudIngreso}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>Foto Perfil FoodTruck:</label>
                    <div className="current-file-display">
                        {foodTruckData.logo ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.logo, 'logo.jpeg'); }}>Ver Logo Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.imagen && <div className="error-message">{errors.imagen}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>FT Frente:</label>
                    <div className="current-file-display">
                        {foodTruckData.ftFrente ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.ftFrente, 'ftFrente.jpeg'); }}>Ver FT Frente Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.ftFrente && <div className="error-message">{errors.ftFrente}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>FT Trasera:</label>
                    <div className="current-file-display">
                        {foodTruckData.ftTrasera ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.ftTrasera, 'ftTrasera.jpeg'); }}>Ver FT Trasera Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.ftTrasera && <div className="error-message">{errors.ftTrasera}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>FT Izquierda:</label>
                    <div className="current-file-display">
                        {foodTruckData.ftIzquierda ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.ftIzquierda, 'ftIzquierda.jpeg'); }}>Ver FT Izquierda Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.ftIzquierda && <div className="error-message">{errors.ftIzquierda}</div>}
                </div>

                <div className="form-group full-width file-upload">
                    <label>FT Derecha:</label>
                    <div className="current-file-display">
                        {foodTruckData.ftDerecha ?
                            <a href="#" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.ftDerecha, 'ftDerecha.jpeg'); }}>Ver FT Derecha Actual</a>
                            : 'No hay archivo subido'}
                    </div>
                    {errors.ftDerecha && <div className="error-message">{errors.ftDerecha}</div>}
                </div>

                <div className='boton'>
                    <button type='submit' className='btn btn-primary'>Actualizar</button>
                </div>
            </form>

            {/* The Modal Component */}
            <CustomModal show={showModal} onClose={closeModal}>
                {modalContent && <img src={modalContent} alt="Vista Previa" style={{ maxWidth: '100%', height: 'auto' }} />}
            </CustomModal>
        </div>
    );
};

export default EdicionFT;