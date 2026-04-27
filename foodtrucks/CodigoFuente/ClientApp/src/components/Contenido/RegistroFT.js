import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import swal from 'sweetalert';
import './RegistroFT.css';

const RegistroFT = () => {
  const navigate = useNavigate()
  const [nombreFantasia, setNombreFantasia] = useState('')
  const [titular, setTitular] = useState('')
  const [cuitCuil, setCuitCuil] = useState('')
  const [domicilioLegal, setDomicilioLegal] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailTitular, setEmailTitular] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [celContacto, setCelContacto] = useState('')
  const [linkRedSocial, setLinkRedSocial] = useState('')
  const [numeroRegistro, setNumeroRegistro] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [menu, setMenu] = useState('');
  const [emplazado, setEmplazado] = useState('');
  const [solicitudIngreso, setSolicitudIngreso] = useState('');
  const [consumo, setConsumo] = useState('')
  const fileInputRef = useRef(null);
  const dniFrenteRef = useRef(null);
  const fileInputPDF = useRef(null);
  const habilitacionImagenesRef = useRef(null);
  const manipulacionAlimentosRef = useRef(null);
  const dniDorsoRef = useRef(null);
  const ftFrenteRef = useRef(null);
  const [habilitacionMode, setHabilitacionMode] = useState('pdf');
  const [categoriasIds, setCategoriasIds] = useState([]);
  const [opcionesCategoria, setOpcionesCategoria] = useState([]);

  // Estado acumulativo para las imágenes de habilitación
  const [habilitacionFiles, setHabilitacionFiles] = useState([]);

  const [errors, setErrors] = useState({});

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleHabilitacionImages = (e) => {
    const nuevos = Array.from(e.target.files);
    setHabilitacionFiles(prev => {
      const combinados = [...prev, ...nuevos];
      return combinados.slice(0, 3);
    });
    // Limpiar el input para permitir volver a seleccionar archivos
    e.target.value = '';
    if (errors.habilitacion) {
      setErrors(prev => ({ ...prev, habilitacion: undefined }));
    }
  };

  const eliminarHabilitacionFile = (index) => {
    setHabilitacionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {};
    if (!nombreFantasia.trim()) newErrors.nombreFantasia = 'Campo requerido';
    if (!titular.trim()) newErrors.titular = 'Campo requerido';
    if (!cuitCuil.trim()) newErrors.cuitCuil = 'Campo requerido';
    if (!domicilioLegal.trim()) newErrors.domicilioLegal = 'Campo requerido';
    if (!telefono.trim()) newErrors.telefono = 'Campo requerido';
    if (!emailTitular.trim()) newErrors.emailTitular = 'Campo requerido';
    if (!emailContacto.trim()) newErrors.emailContacto = 'Campo requerido';
    if (!celContacto.trim()) newErrors.celContacto = 'Campo requerido';
    if (!menu.trim()) { newErrors.menu = 'Campo requerido'; } else if (menu.length > 100) { newErrors.menu = 'Máximo 100 caracteres'; }
    if (!numeroRegistro.trim()) newErrors.numeroRegistro = 'Campo requerido';
    if (!emplazado) newErrors.emplazado = 'Campo requerido';
    if (!solicitudIngreso) newErrors.solicitudIngreso = 'Campo requerido';
    if (!fechaVencimiento.trim()) newErrors.fechaVencimiento = 'Campo requerido';
    if (!consumo.trim()) newErrors.consumo = 'Campo requerido';
    if (!fileInputRef.current.files[0]) newErrors.imagen = 'Campo requerido';
    if (!dniFrenteRef.current.files[0]) newErrors.dniFrente = 'Campo requerido';
    if (!dniDorsoRef.current.files[0]) newErrors.dniDorso = 'Campo requerido';
    if (!ftFrenteRef.current.files[0]) newErrors.ftFrente = 'Campo requerido';
    if (habilitacionMode === 'pdf') {
      if (!fileInputPDF.current.files[0]) newErrors.habilitacion = 'Campo requerido';
    } else {
      if (habilitacionFiles.length === 0) newErrors.habilitacion = 'Campo requerido';
    }
    if (!manipulacionAlimentosRef.current.files[0]) newErrors.manipulacionAlimentos = 'Campo requerido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
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
    formData.append('fechaVencimiento', fechaVencimiento);
    formData.append('emplazado', emplazado);
    formData.append('solicitudIngreso', solicitudIngreso);
    formData.append('consumo', consumo);
    formData.append('menu', menu);
    categoriasIds.forEach(id => {
      formData.append("categoriasIds", id);
    });
    const appendFiles = (ref, fieldName) => {
      if (ref.current?.files) {
        const files = ref.current.files;
        for (let i = 0; i < files.length; i++) {
          formData.append(fieldName, files[i]);
        }
      }
    };
    appendFiles(fileInputRef, 'Logo');
    appendFiles(dniFrenteRef, 'DniFrente');
    appendFiles(dniDorsoRef, 'DniDorso');
    appendFiles(ftFrenteRef, 'ftFrente');

    if (habilitacionMode === 'pdf') {
      appendFiles(fileInputPDF, 'Habilitacion');
    } else {
      // Usar el estado acumulado en lugar del ref
      habilitacionFiles.forEach(file => {
        formData.append('Habilitacion', file);
      });
    }

    appendFiles(manipulacionAlimentosRef, 'ManipulacionAlimentos');

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + 'foodtruck/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        swal("Se ha Registrado Exitosamente", "Su registro pasa revision del personal", "success").then(() => {
          navigate('/');
        });
      }
    } catch (error) {
      swal("No se ha podido Registrar", "Algo salió mal", "error");
      console.error('Error al enviar el formulario:', error);
    }
  }

  const handleCheckboxChange = (setState, value) => (e) => {
    const val = value.toString();
    if (e.target.checked) {
      setState(prev => [...prev, val]);
    } else {
      setState(prev => prev.filter(item => item !== val));
    }
  };

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
        console.error("Error al cargar las categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  return (
    <div className='contenido'>
      <h2>Registro Unico FoodTrucks</h2>
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

        <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">DNI Frente:</label>
          <input
            type="file"
            ref={dniFrenteRef}
            accept="image/*"
            onChange={() => errors.dniFrente && setErrors(prev => ({ ...prev, dniFrente: undefined }))}
            className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.dniFrente ? "ring-2 ring-red-500/50 rounded-lg" : "")}
          />
          {errors.dniFrente && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.dniFrente}</div>}
        </div>

        <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">DNI Dorso:</label>
          <input
            type="file"
            ref={dniDorsoRef}
            accept="image/*"
            onChange={() => errors.dniDorso && setErrors(prev => ({ ...prev, dniDorso: undefined }))}
            className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.dniDorso ? "ring-2 ring-red-500/50 rounded-lg" : "")}
          />
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

          {habilitacionMode === 'pdf' ? (
            <input
              type="file"
              ref={fileInputPDF}
              accept="application/pdf"
              onChange={() => errors.habilitacion && setErrors(prev => ({ ...prev, habilitacion: undefined }))}
              className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.habilitacion ? "ring-2 ring-red-500/50 rounded-lg" : "")}
            />
          ) : (
            <>
              {/* Input para agregar imágenes de a una o varias */}
              <input
                type="file"
                ref={habilitacionImagenesRef}
                accept="image/*"
                multiple
                disabled={habilitacionFiles.length >= 3}
                onChange={handleHabilitacionImages}
                className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed " + (errors.habilitacion ? "ring-2 ring-red-500/50 rounded-lg" : "")}
              />

              {/* Contador */}
              <p className="text-[11px] text-gray-400 mt-1">
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
            </>
          )}

          {errors.habilitacion && (
            <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">
              {errors.habilitacion}
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Manipulación de Alimentos (PDF):</label>
          <input
            type="file"
            ref={manipulacionAlimentosRef}
            accept="application/pdf"
            onChange={() => errors.manipulacionAlimentos && setErrors(prev => ({ ...prev, manipulacionAlimentos: undefined }))}
            className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.manipulacionAlimentos ? "ring-2 ring-red-500/50 rounded-lg" : "")}
          />
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
                  onChange={handleCheckboxChange(setCategoriasIds, opcion.value)}
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
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={() => errors.imagen && setErrors(prev => ({ ...prev, imagen: undefined }))}
            className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.imagen ? "ring-2 ring-red-500/50 rounded-lg" : "")}
          />
          {errors.imagen && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.imagen}</div>}
        </div>

        <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">FT Frente:</label>
          <input
            type="file"
            ref={ftFrenteRef}
            accept="image/*"
            onChange={() => errors.ftFrente && setErrors(prev => ({ ...prev, ftFrente: undefined }))}
            className={"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 " + (errors.ftFrente ? "ring-2 ring-red-500/50 rounded-lg" : "")}
          />
          {errors.ftFrente && <div className="text-red-500 text-[11px] mt-1.5 font-semibold flex items-center gap-1">{errors.ftFrente}</div>}
        </div>

        <div className="md:col-span-2 pt-6 border-t border-gray-100 mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 border hover:bg-gray-200 transition-all">Cancelar</button>
          <button type="submit" className="flex items-center gap-2 border bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroFT;
