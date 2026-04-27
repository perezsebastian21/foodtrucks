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
    const [celContacto, setCelContacto] = useState('');
    const [linkRedSocial, setLinkRedSocial] = useState('');
    const [numeroRegistro, setNumeroRegistro] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [menu, setMenu] = useState('');
    const [emplazado, setEmplazado] = useState('');
    const [solicitudIngreso, setSolicitudIngreso] = useState('');
    const [consumo, setConsumo] = useState('');
    const [estado, setEstado] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [categoriasIds, setCategoriasIds] = useState([]);
    const [opcionesCategoria, setOpcionesCategoria] = useState([]);
    const [errors, setErrors] = useState({});
    const [habilitacionMode, setHabilitacionMode] = useState('pdf');
    const [habilitacionFiles, setHabilitacionFiles] = useState([]);

    const [selectedFiles, setSelectedFiles] = useState({});

    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFiles(prev => ({
                ...prev,
                [field]: e.target.files[0]
            }));
        }
    };

    const handleHabilitacionImages = (e) => {
        const nuevos = Array.from(e.target.files);
        setHabilitacionFiles(prev => {
            const combinados = [...prev, ...nuevos];
            return combinados.slice(0, 3);
        });
        e.target.value = '';
        if (errors.habilitacion) {
            setErrors(prev => ({ ...prev, habilitacion: undefined }));
        }
    };

    const eliminarHabilitacionFile = (index) => {
        setHabilitacionFiles(prev => prev.filter((_, i) => i !== index));
    };

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
                setCelContacto(data.celContacto || '');
                setLinkRedSocial(data.linkRedSocial || '');
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
        if (menu && menu.length > 100) { newErrors.menu = 'Máximo 100 caracteres'; }
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
        formData.append('celContacto', celContacto);
        if (linkRedSocial.trim()) formData.append('linkRedSocial', linkRedSocial.trim());
        formData.append('numeroRegistro', numeroRegistro);
        formData.append('estado', estado);
        if (fechaVencimiento) {
            formData.append('fechaVencimiento', fechaVencimiento);
        }
        if (emplazado) {
            formData.append('emplazado', emplazado);
        }
        if (solicitudIngreso) {
            formData.append('solicitudIngreso', solicitudIngreso);
        }
        formData.append('consumo', consumo);
        formData.append('menu', menu);
        formData.append('observaciones', estado === 'S' && observaciones.trim() ? observaciones.trim() : '');
        // DNI Frente
        if (selectedFiles.dniFrente) {
            formData.append('DniFrente', selectedFiles.dniFrente);
        } else if (foodTruckData.dniFrente) {
            formData.append('DniFrente', base64ToBlob(foodTruckData.dniFrente, 'image/jpeg'), 'dniFrente.jpeg');
        }

        // DNI Dorso
        if (selectedFiles.dniDorso) {
            formData.append('DniDorso', selectedFiles.dniDorso);
        } else if (foodTruckData.dniDorso) {
            formData.append('DniDorso', base64ToBlob(foodTruckData.dniDorso, 'image/jpeg'), 'dniDorso.jpeg');
        }

        // Habilitacion
        if (habilitacionMode === 'pdf') {
            if (selectedFiles.habilitacion) {
                formData.append('Habilitacion', selectedFiles.habilitacion);
            } else if (foodTruckData.habilitacion) {
                formData.append('Habilitacion', base64ToBlob(foodTruckData.habilitacion, 'application/pdf'), 'habilitacion.pdf');
            }
        } else {
            habilitacionFiles.forEach((file) => {
                formData.append('Habilitacion', file);
            });
        }
        // Manipulacion Alimentos
        if (selectedFiles.manipulacionAlimentos) {
            formData.append('ManipulacionAlimentos', selectedFiles.manipulacionAlimentos);
        } else if (foodTruckData.manipulacionAlimentos) {
            formData.append('ManipulacionAlimentos', base64ToBlob(foodTruckData.manipulacionAlimentos, 'application/pdf'), 'manipulacionAlimentos.pdf');
        }

        // Logo
        if (selectedFiles.logo) {
            formData.append('Logo', selectedFiles.logo);
        } else if (foodTruckData.logo) {
            formData.append('Logo', base64ToBlob(foodTruckData.logo, 'image/jpeg'), 'logo.jpeg');
        }

        // FT Frente
        if (selectedFiles.ftFrente) {
            formData.append('ftFrente', selectedFiles.ftFrente);
        } else if (foodTruckData.ftFrente) {
            formData.append('ftFrente', base64ToBlob(foodTruckData.ftFrente, 'image/jpeg'), 'ftFrente.jpeg');
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
                    navigate('/adm');
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
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre fantasía:</label>
                    <input
                        type="text"
                        value={nombreFantasia}
                        onChange={handleInputChange(setNombreFantasia, 'nombreFantasia')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.nombreFantasia ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.nombreFantasia && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.nombreFantasia}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Titular de la Habilitación:</label>
                    <input
                        type="text"
                        value={titular}
                        onChange={handleInputChange(setTitular, 'titular')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.titular ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.titular && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.titular}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">CUIT/CUIL:</label>
                    <input
                        type="text"
                        value={cuitCuil}
                        onChange={handleInputChange(setCuitCuil, 'cuitCuil')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.cuitCuil ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.cuitCuil && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.cuitCuil}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Domicilio Legal:</label>
                    <input
                        type="text"
                        value={domicilioLegal}
                        onChange={handleInputChange(setDomicilioLegal, 'domicilioLegal')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.domicilioLegal ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.domicilioLegal && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.domicilioLegal}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Teléfono:</label>
                    <input
                        type="tel"
                        value={telefono}
                        onChange={handleInputChange(setTelefono, 'telefono')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.telefono ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.telefono && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.telefono}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Email Titular:</label>
                    <input
                        type="email"
                        value={emailTitular}
                        onChange={handleInputChange(setEmailTitular, 'emailTitular')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.emailTitular ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.emailTitular && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.emailTitular}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Email Contacto:</label>
                    <input
                        type="email"
                        value={emailContacto}
                        onChange={handleInputChange(setEmailContacto, 'emailContacto')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.emailContacto ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.emailContacto && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.emailContacto}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Celular Contacto:</label>
                    <input
                        type="tel"
                        value={celContacto}
                        onChange={handleInputChange(setCelContacto, 'celContacto')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.celContacto ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.celContacto && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.celContacto}</div>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Link Red Social <span className="text-gray-300 font-normal normal-case">(opcional)</span>:
                    </label>
                    <input
                        type="url"
                        value={linkRedSocial}
                        onChange={handleInputChange(setLinkRedSocial, 'linkRedSocial')}
                        placeholder="https://instagram.com/mi-foodtruck"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Estado:</label>
                    <select
                        value={estado}
                        onChange={handleInputChange(setEstado, 'estado')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.estado ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                        <option value="S">Suspendido</option>
                        <option value="B">Eliminado</option>
                    </select>
                    {errors.estado && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.estado}</div>}
                </div>

                {estado === 'S' && (
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Observaciones:</label>
                        <textarea
                            value={observaciones}
                            onChange={handleInputChange(setObservaciones, 'observaciones')}
                            className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm resize-none " + (errors.observaciones ? "ring-2 ring-red-500/50 border-red-500" : "")}
                            rows={3}
                            placeholder="Ingrese las observaciones de la suspensión"
                        />
                        {errors.observaciones && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.observaciones}</div>}
                    </div>
                )}
                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">DNI Frente:</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center min-h-[40px]">
                            {foodTruckData.dniFrente ?
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.dniFrente, 'dniFrente.jpeg'); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 border hover:underline font-medium text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Ver DNI Frente Actual</button>
                                : <span className="text-gray-400 text-sm italic py-1.5 block">No hay archivo subido</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'dniFrente')}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                {selectedFiles.dniFrente ? selectedFiles.dniFrente.name : 'Ningún archivo seleccionado'}
                            </span>
                        </div>
                    </div>
                    {errors.dniFrente && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.dniFrente}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">DNI Dorso:</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center min-h-[40px]">
                            {foodTruckData.dniDorso ?
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.dniDorso, 'dniDorso.jpeg'); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 border hover:underline font-medium text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Ver DNI Dorso Actual</button>
                                : <span className="text-gray-400 text-sm italic py-1.5 block">No hay archivo subido</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'dniDorso')}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                {selectedFiles.dniDorso ? selectedFiles.dniDorso.name : 'Ningún archivo seleccionado'}
                            </span>
                        </div>
                    </div>
                    {errors.dniDorso && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.dniDorso}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Número de Registro/GDE:</label>
                    <input
                        type="text"
                        value={numeroRegistro}
                        onChange={handleInputChange(setNumeroRegistro, 'numeroRegistro')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.numeroRegistro ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.numeroRegistro && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.numeroRegistro}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Fecha Vencimiento Habilitación:</label>
                    <input
                        type="date"
                        value={fechaVencimiento}
                        onChange={handleInputChange(setFechaVencimiento, 'fechaVencimiento')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.fechaVencimiento ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.fechaVencimiento && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.fechaVencimiento}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Consumo (KW/A):</label>
                    <input
                        type="text"
                        value={consumo}
                        onChange={handleInputChange(setConsumo, 'consumo')}
                        placeholder=" Ej: 5KW / 20A "
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.consumo ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    />
                    {errors.consumo && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.consumo}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Habilitación:</label>
                    {/* Toggle PDF / Imágenes */}
                    <div className="flex gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input
                                type="radio"
                                name="habilitacionMode"
                                value="pdf"
                                checked={habilitacionMode === 'pdf'}
                                onChange={() => {
                                    setHabilitacionMode('pdf');
                                    setHabilitacionFiles([]);
                                }}
                                className="accent-blue-600"
                            />
                            PDF
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                            <input
                                type="radio"
                                name="habilitacionMode"
                                value="imagenes"
                                checked={habilitacionMode === 'imagenes'}
                                onChange={() => setHabilitacionMode('imagenes')}
                                className="accent-blue-600"
                            />
                            Imágenes (hasta 3)
                        </label>
                    </div>
                    <div className="flex flex-col gap-3">
                        {foodTruckData.habilitacion && (
                            <div className="flex items-center min-h-[40px]">
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.habilitacion, habilitacionMode === 'pdf' ? 'habilitacion.pdf' : 'habilitacion.jpeg'); }} className="inline-flex items-center border text-blue-600 hover:text-blue-800 hover:underline font-medium text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Ver Habilitación Actual</button>
                            </div>
                        )}
                        {habilitacionMode === 'pdf' ? (
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                    Seleccionar PDF
                                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'habilitacion')} className="hidden" />
                                </label>
                                <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                    {selectedFiles.habilitacion ? selectedFiles.habilitacion.name : 'Ningún archivo seleccionado'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <label className={"cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0 " + (habilitacionFiles.length >= 3 ? "opacity-40 cursor-not-allowed" : "hover:bg-blue-100")}>
                                        Seleccionar imágenes (máx. 3)
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            disabled={habilitacionFiles.length >= 3}
                                            onChange={handleHabilitacionImages}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Contador */}
                                <p className="text-[11px] text-gray-400 mt-2">
                                    {habilitacionFiles.length}/3 imágenes seleccionadas
                                    {habilitacionFiles.length >= 3 && (
                                        <span className="text-amber-500 ml-1 font-medium">— límite alcanzado</span>
                                    )}
                                </p>

                                {/* Lista de archivos acumulados */}
                                {habilitacionFiles.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {habilitacionFiles.map((file, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700"
                                            >
                                                <span className="truncate max-w-[80%]">
                                                    <span className="text-blue-500 mr-1">&#128247;</span>
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarHabilitacionFile(index)}
                                                    className="text-red-400 hover:text-red-600 font-bold ml-2 leading-none"
                                                    title="Eliminar"
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    {errors.habilitacion && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.habilitacion}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Manipulación de Alimentos (PDF):</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center min-h-[40px]">
                            {foodTruckData.manipulacionAlimentos ?
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.manipulacionAlimentos, 'manipulacionAlimentos.pdf'); }} className="inline-flex items-center border text-blue-600 hover:text-blue-800 hover:underline font-medium text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">Ver Manipulación de Alimentos Actual</button>
                                : <span className="text-gray-400 text-sm italic py-1.5 block">No hay archivo subido</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'manipulacionAlimentos')}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                {selectedFiles.manipulacionAlimentos ? selectedFiles.manipulacionAlimentos.name : 'Ningún archivo seleccionado'}
                            </span>
                        </div>
                    </div>
                    {errors.manipulacionAlimentos && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.manipulacionAlimentos}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Categoría:</label>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {opcionesCategoria.map((opcion) => (
                            <label key={opcion.value} className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all select-none shadow-sm">
                                <input
                                    type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    value={opcion.value}
                                    checked={categoriasIds.includes(opcion.value)}
                                    onChange={handleCheckboxChange(opcion.value)}
                                />
                                {opcion.label}
                            </label>
                        ))}
                    </div>
                </div>



                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Descripción Menú:</label>
                    <textarea
                        value={menu}
                        onChange={handleInputChange(setMenu, 'menu')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm resize-none " + (errors.menu ? "ring-2 ring-red-500/50 border-red-500" : "")}
                        maxLength={100}
                        style={{ width: "100%" }}
                        rows={3}
                        placeholder="Breve descripción de tu menú (máx 100 caracteres)"
                    />
                    <div className="text-[11px] text-gray-400 text-right mt-1.5 font-medium">
                        {menu.length}/100 caracteres
                    </div>
                    {errors.menu && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.menu}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Emplazado:</label>
                    <select
                        value={emplazado}
                        onChange={handleInputChange(setEmplazado, 'emplazado')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.emplazado ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="S">Sí</option>
                        <option value="N">No</option>
                    </select>
                    {errors.emplazado && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.emplazado}</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Solicitud para ingresar:</label>
                    <select
                        value={solicitudIngreso}
                        onChange={handleInputChange(setSolicitudIngreso, 'solicitudIngreso')}
                        className={"w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700 text-sm " + (errors.solicitudIngreso ? "ring-2 ring-red-500/50 border-red-500" : "")}
                    >
                        <option value="">Seleccione una opción</option>
                        <option value="1">Ferias fijas</option>
                        <option value="2">Eventos</option>
                        <option value="3">Ambos</option>
                    </select>
                    {errors.solicitudIngreso && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.solicitudIngreso}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Foto Perfil FoodTruck:</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center min-h-[40px]">
                            {foodTruckData.logo ?
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.logo, 'logo.jpeg'); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium text-[13px] bg-blue-50 px-3 border py-1.5 rounded-lg transition-colors">Ver Logo Actual</button>
                                : <span className="text-gray-400 text-sm italic py-1.5 block">No hay archivo subido</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'logo')}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                {selectedFiles.logo ? selectedFiles.logo.name : 'Ningún archivo seleccionado'}
                            </span>
                        </div>
                    </div>
                    {errors.imagen && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.imagen}</div>}
                </div>

                <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">FT Frente:</label>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center min-h-[40px]">
                            {foodTruckData.ftFrente ?
                                <button type="button" onClick={(e) => { e.preventDefault(); handleViewFile(foodTruckData.ftFrente, 'ftFrente.jpeg'); }} className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium text-[13px] bg-blue-50 px-3 border py-1.5 rounded-lg transition-colors">Ver FT Frente Actual</button>
                                : <span className="text-gray-400 text-sm italic py-1.5 block">No hay archivo subido</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <label className="cursor-pointer inline-flex justify-center items-center text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-xl transition-all sm:mr-4 mb-2 sm:mb-0">
                                Seleccionar archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'ftFrente')}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500 font-medium truncate max-w-[250px]">
                                {selectedFiles.ftFrente ? selectedFiles.ftFrente.name : 'Ningún archivo seleccionado'}
                            </span>
                        </div>
                    </div>
                    {errors.ftFrente && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.ftFrente}</div>}
                </div>



                <div className="md:col-span-2 pt-6 border-t border-gray-100 mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 border hover:bg-gray-200 transition-all">Cancelar</button><button type="submit" className="flex items-center gap-2 border bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Actualizar</button>
                </div>
            </form>
            <CustomModal show={showModal} onClose={closeModal}>
                {modalContent && <img src={modalContent} alt="Vista Previa" style={{ maxWidth: '100%', height: 'auto' }} />}
            </CustomModal>
        </div>
    );
};

export default EdicionFT;