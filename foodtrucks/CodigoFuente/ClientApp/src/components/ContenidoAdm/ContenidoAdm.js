import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import ReactPaginate from "react-paginate";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Siguiente from '../../assets/der.png';
import Anterior from '../../assets/izq.png';
import User from '../../assets/user.png';
import Ver from '../../assets/ver.png';
import Menu from '../../assets/restaurant.png';
import Editar from '../../assets/edit.png';
import LogOut from '../../assets/logout.png'
import NoDisponible from '../../assets/NoDisponible.png'
import Mail from '../../assets/mail.png';
import Ubicacion from '../../assets/ubicacion.png';
import Telefono from '../../assets/phone.png'
import Eliminar from '../../assets/delete.png';
import Carousel from 'react-bootstrap/Carousel';
import { Star } from 'lucide-react';
import '../Contenido/Contenido.css';
import { Buffer } from "buffer";

function ContenidoAdm() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [limit, setLimit] = useState(8);
  const [rows, setRows] = useState(0);
  const [emplazado, setEmplazado] = useState('');
  const [searched, setSearched] = useState(false);
  const [estado, setEstado] = useState('');
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(true)

  const [estadoOpen, setEstadoOpen] = useState(false)
  const [emplazadoOpen, setEmplazadoOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)

  const dropdownRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setEstadoOpen(false)
        setEmplazadoOpen(false)
        setCategoriaOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const searchFoodTrucks = async (selectedPage) => {
    setLoading(true);
    const categoriasParams = categoriasSeleccionadas.map(id => `CategoriasIds=${id}`).join("&");
    const url = `${process.env.REACT_APP_API_URL}foodtruck/FindQP?IdFT=&IdCategoria=&searchString=${keyword}&page=${selectedPage}&limit=${limit}&emplazado=${emplazado}&estado=${estado}&${categoriasParams}`;
    try {
      const response = await axios.get(url);
      setFoodTrucks(response.data.data.data);
      setSearched(true);
      setPage(response.data.data.page);
      setPages(response.data.data.totalPage);
      setRows(response.data.data.totalRows);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate('/user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLimit(8);
    setCurrentPage(0);
    searchFoodTrucks(0);
  };
  const toggleCategoria = (id) => {
    const idStr = id.toString();
    setCategoriasSeleccionadas(prev =>
      prev.includes(idStr)
        ? prev.filter(c => c !== idStr)
        : [...prev, idStr]
    );
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}categoria/GetAll`);
        setCategorias(response.data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate('/user'); // Opcional, pero App.js lo maneja si se borra de otra pestaña. Al ser React Router, navigate es mejor
        }
      }
    };

    fetchCategorias();
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    searchFoodTrucks(selected);
  };

  const resetInput = () => {
    setKeyword("");
    setRows("");
    setPage(0);
    setPages(0);
    setLimit(8);
    setEmplazado("");
    setEstado("");
    setFoodTrucks([]);
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedFoodtruck, setSelectedFoodtruck] = useState(null);

  // --- QR States ---
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [qrModalLoading, setQrModalLoading] = useState(false);
  const [qrCurrentId, setQrCurrentId] = useState(null);
  const [qrCurrentName, setQrCurrentName] = useState('');

  const handleModalShow = (foodtruck) => {
    setSelectedFoodtruck(foodtruck);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleDelete = async (idFT) => {
    if (window.confirm("¿Está seguro que desea eliminar este FoodTruck?")) {
      try {
        await axios.delete(process.env.REACT_APP_API_URL + `foodtruck/${idFT}`);
        searchFoodTrucks(currentPage);
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el FoodTruck");
      }
    }
  };

  // --- QR Handlers ---

  const handleVerQR = async (foodtruck) => {
    const idFT = foodtruck.idFT;
    setQrModalLoading(true);
    setShowQrModal(true);
    setQrImageUrl(null);
    setQrCurrentId(idFT);
    setQrCurrentName(foodtruck.nombreFantasia);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}Foodtruck/${idFT}/QR`,
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setQrImageUrl(imageUrl);
    } catch (error) {
      console.error("Error al obtener QR:", error);
      alert("No se pudo obtener el QR");
      setShowQrModal(false);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate('/user');
      }
    } finally {
      setQrModalLoading(false);
    }
  };

  const FoodtruckModal = ({ show, handleClose, foodtruck }) => {
    if (!foodtruck) {
      return null;
    }

    const downloadDniImage = (base64Data, fileName) => {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${base64Data}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handlePdf = (base64Data, fileName, action = 'download') => {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank');
      }

      setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const images = [
      { field: 'logo', label: 'Logo' },
      { field: 'ftDerecha', label: 'Vista Derecha' },
      { field: 'ftFrente', label: 'Vista Frontal' },
      { field: 'ftIzquierda', label: 'Vista Izquierda' },
      { field: 'ftTrasera', label: 'Vista Trasera' }
    ].filter(item => foodtruck[item.field]);

    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{foodtruck.nombreFantasia}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Carrusel de imágenes */}
            <div className="w-full md:w-96">
              {images.length > 0 ? (
                <Carousel interval={null}>
                  {images.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="rounded-lg w-full object-contain max-h-[300px]"
                        src={`data:image/*;base64,${Buffer.from(foodtruck[img.field])}`}
                        alt={img.label}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="flex justify-center items-center bg-gray-100 rounded-lg h-48">
                  <img src={NoDisponible} className="h-24" alt="No disponible" />
                </div>
              )}
            </div>

            {/* Información del foodtruck */}
            <div className="space-y-3 text-sm flex-1">
              {/* CALIFICACIÓN Y RESEÑAS */}
              <div className="bg-amber-50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-amber-100 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-xl font-black text-amber-700">
                      {foodtruck.calificacionMedia ? Number(foodtruck.calificacionMedia).toFixed(1) : "-"}
                    </span>
                  </div>
                  {foodtruck.cantidadResenias > 0 ? (
                    <span className="text-xs text-amber-800 opacity-80 font-medium">
                      Basado en {foodtruck.cantidadResenias} {foodtruck.cantidadResenias === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-800 opacity-80 font-medium shrink-0">
                      Aún no tiene reseñas
                    </span>
                  )}
                </div>

                <button
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 border rounded-xl text-sm font-bold transition-all shadow-sm shrink-0"
                  onClick={() => { handleClose(); navigate(`/AdmReseniasFT/${foodtruck.idFT}`, { state: { calificacionMedia: foodtruck.calificacionMedia } }); }}
                >
                  Ver reseñas
                </button>
              </div>

              <div className="flex items-center gap-2">
                <img src={User} className="w-4" alt="" />
                <p><b>Titular:</b> {foodtruck.titular}</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={Mail} className="w-4" alt="" />
                <p><b>Correo Electrónico:</b> {foodtruck.emailContacto}</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={Telefono} className="w-4" alt="" />
                <p><b>Teléfono:</b> {foodtruck.celContacto}</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={Menu} className="w-4" alt="" />
                <p><b>Menú:</b> {foodtruck.menu}</p>
              </div>
              <div className="flex items-center gap-2">
                <img src={Ubicacion} className="w-4" alt="" />
                <p><b>Emplazado:</b> {foodtruck.emplazado === "S" ? "Sí" : "No"}</p>
              </div>

              {/* Documentos DNI */}
              {(foodtruck.dniFrente || foodtruck.dniDorso) && (
                <div className="border-t pt-3 mt-3">
                  <p className="font-bold mb-2">Documentos:</p>
                  {foodtruck.dniFrente && (
                    <button
                      onClick={() => downloadDniImage(foodtruck.dniFrente, 'dni_frente.jpg')}
                      className="text-blue-600 border hover:underline text-sm mr-3"
                    >
                      DNI Frente
                    </button>
                  )}
                  {foodtruck.dniDorso && (
                    <button
                      onClick={() => downloadDniImage(foodtruck.dniDorso, 'dni_dorso.jpg')}
                      className="text-blue-600 border mt-2 hover:underline text-sm"
                    >
                      DNI Dorso
                    </button>
                  )}
                </div>
              )}

              {/* Habilitación PDF */}
              {foodtruck.habilitacion && (
                <div className="border-t pt-3 mt-3">
                  <p className="font-bold mb-2">Habilitación:</p>
                  <button
                    onClick={() => handlePdf(foodtruck.habilitacion, 'habilitacion.pdf', 'download')}
                    className="text-blue-600 border hover:underline text-sm mr-3"
                  >
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => handlePdf(foodtruck.habilitacion, 'habilitacion.pdf', 'open')}
                    className="text-blue-600 border mt-2 hover:underline text-sm"
                  >
                    Ver en nueva pestaña
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/user")
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50/30 min-h-screen">

      {/* --- LOGOUT --- */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Cerrar Sesión
          <img src={LogOut} className="w-4 h-4" alt="Logout" />
        </button>
      </div>

      {/* --- SECCIÓN DE BÚSQUEDA --- */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleSearch}
            className="flex-1 md:flex-none border bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
          >
            Buscar
          </button>

          <button
            onClick={resetInput}
            className="p-2.5 bg-gray-100 border text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
            title="Resetear"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium ${showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 shadow-sm'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtros
          </button>
        </div>
      </div>

      {/* --- SECCIÓN DE FILTROS --- */}
      {showFilters && (
        <div
          ref={dropdownRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white border border-gray-100 shadow-xl rounded-2xl p-6"
        >
          {/* FILTRO: ESTADO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</label>
            <div className="relative">
              <button
                onClick={() => setEstadoOpen(!estadoOpen)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center hover:bg-white transition-all text-gray-700"
              >
                <span className="font-medium text-sm">
                  {estado === '' && "Todos los estados"}
                  {estado === 'A' && "Activo"}
                  {estado === 'I' && "Inactivo"}
                  {estado === 'S' && "Suspendido"}
                  {estado === 'B' && "Eliminado"}
                </span>
                <svg className={`w-4 h-4 transition-transform ${estadoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {estadoOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto flex flex-col">
                  {[
                    { val: '', lab: 'Todos los estados' },
                    { val: 'A', lab: 'Activo' },
                    { val: 'I', lab: 'Inactivo' },
                    { val: 'S', lab: 'Suspendido' },
                    { val: 'B', lab: 'Eliminado' }
                  ].map((item) => (
                    <label
                      key={item.val}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors group"
                    >
                      <input
                        type="radio"
                        name="estado_filter"
                        value={item.val}
                        checked={estado === item.val}
                        onChange={() => { setEstado(item.val); setEstadoOpen(false); }}
                        className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{item.lab}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FILTRO: EMPLAZADO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">¿Emplazado?</label>
            <div className="relative">
              <button
                onClick={() => setEmplazadoOpen(!emplazadoOpen)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center hover:bg-white transition-all text-gray-700"
              >
                <span className="font-medium text-sm">
                  {emplazado === '' && "Todos"}
                  {emplazado === 'S' && "Sí"}
                  {emplazado === 'N' && "No"}
                </span>
                <svg className={`w-4 h-4 transition-transform ${emplazadoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {emplazadoOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto flex flex-col">
                  {[
                    { val: '', lab: 'Todos' },
                    { val: 'S', lab: 'Sí' },
                    { val: 'N', lab: 'No' }
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors group"
                    >
                      <input
                        type="radio"
                        name="emplazado_filter"
                        value={opt.val}
                        checked={emplazado === opt.val}
                        onChange={() => { setEmplazado(opt.val); setEmplazadoOpen(false); }}
                        className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{opt.lab}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FILTRO: CATEGORÍAS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categorías</label>
            <div className="relative">
              <button
                onClick={() => setCategoriaOpen(!categoriaOpen)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center hover:bg-white transition-all text-gray-700"
              >
                <span className="font-medium text-sm">
                  Seleccionadas ({categoriasSeleccionadas.length})
                </span>
                <svg className={`w-4 h-4 transition-transform ${categoriaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {categoriaOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto flex flex-col">
                  {categorias.map(cat => (
                    <label
                      key={cat.idCategoria}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={categoriasSeleccionadas.includes(cat.idCategoria.toString())}
                        onChange={() => toggleCategoria(cat.idCategoria)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{cat.nombre}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- BOTÓN DESCARGAR EXCEL --- */}
      <div className="flex justify-end mb-4">
        <a
          href={`${process.env.REACT_APP_API_URL}foodtruck/ExportXLS?IdFT=&IdCategoria=&searchString=${keyword}&page=&limit=&emplazado=${emplazado}`}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 active:scale-95 transition-all border text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar Excel
        </a>
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style={{ boxShadow: 'none' }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: '#2563eb' }}>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Nombre Fantasía</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Titular</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Correo Electrónico</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Fecha Vencimiento</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Emplazado</th>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Estado</th>
                <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr style={{ backgroundColor: 'transparent' }}>
                  <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <svg style={{ width: '36px', height: '36px', animation: 'spin 1s linear infinite', color: '#2563eb' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {searched && foodTrucks.length === 0 && (
                    <tr style={{ backgroundColor: 'transparent' }}>
                      <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', borderBottom: 'none' }}>
                        No se encontraron resultados.
                      </td>
                    </tr>
                  )}
                  {foodTrucks.map((foodtruck) => (
                    <tr key={foodtruck.idFT} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: 'transparent' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: '#111827', borderBottom: 'none' }}>
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="truncate max-w-[150px]">{foodtruck.nombreFantasia}</span>
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg w-max border border-amber-100" title="Calificación Media">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-700 leading-none">
                              {foodtruck.calificacionMedia ? Number(foodtruck.calificacionMedia).toFixed(1) : "-"}
                            </span>
                            {foodtruck.cantidadResenias > 0 && (
                              <span className="text-[10px] text-amber-800/80 font-medium ml-1">
                                ({foodtruck.cantidadResenias})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 20px', fontSize: '13px', color: '#4b5563', borderBottom: 'none' }}>{foodtruck.titular}</td>
                      <td style={{ padding: '10px 20px', fontSize: '13px', color: '#4b5563', borderBottom: 'none' }}>{foodtruck.emailContacto}</td>
                      <td style={{ padding: '10px 20px', fontSize: '13px', color: '#4b5563', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderBottom: 'none' }}>{foodtruck.fechaVencimiento ? new Date(foodtruck.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
                      <td style={{ padding: '10px 20px', borderBottom: 'none' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: foodtruck.emplazado === 'S' ? '#d1fae5' : '#f3f4f6',
                          color: foodtruck.emplazado === 'S' ? '#047857' : '#4b5563'
                        }}>
                          {foodtruck.emplazado === 'S' ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 20px', borderBottom: 'none' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: foodtruck.estado === 'A' ? '#d1fae5' : foodtruck.estado === 'S' ? '#fef3c7' : foodtruck.estado === 'B' ? '#fee2e2' : '#f3f4f6',
                          color: foodtruck.estado === 'A' ? '#047857' : foodtruck.estado === 'S' ? '#92400e' : foodtruck.estado === 'B' ? '#dc2626' : '#4b5563'
                        }}>
                          {foodtruck.estado === 'A' ? 'Activo' : foodtruck.estado === 'I' ? 'Inactivo' : foodtruck.estado === 'S' ? 'Suspendido' : foodtruck.estado === 'B' ? 'Eliminado' : foodtruck.estado}
                        </span>
                      </td>
                      <td style={{ padding: '10px 20px', borderBottom: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleModalShow(foodtruck)}
                            style={{ padding: '6px', backgroundColor: '#69a7f7ff', borderRadius: '8px', border: '1px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Ver detalle"
                          >
                            <img src={Ver} style={{ width: '18px', height: '18px' }} alt="Ver" />
                          </button>

                          <Link
                            to={`/edit/${foodtruck.idFT}`}
                            style={{ padding: '6px', backgroundColor: '#faae66ff', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Editar"
                          >
                            <img src={Editar} style={{ width: '18px', height: '18px' }} alt="Editar" />
                          </Link>

                          <button
                            onClick={() => handleDelete(foodtruck.idFT)}
                            style={{ padding: '6px', backgroundColor: '#ff5252ff', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Eliminar"
                          >
                            <img src={Eliminar} style={{ width: '18px', height: '18px' }} alt="Eliminar" />
                          </button>

                          <button
                            onClick={() => handleVerQR(foodtruck)}
                            style={{ padding: '6px', backgroundColor: '#8b5cf6', borderRadius: '8px', border: '1px solid #c4b5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Ver QR"
                          >
                            <svg style={{ width: '18px', height: '18px' }} fill="white" viewBox="0 0 24 24">
                              <path d="M3 11h2v2H3v-2zm0-4h2v2H3V7zm4 4h2v2H7v-2zm0-4h2v2H7V7zm-4 8h2v2H3v-2zm4 0h2v2H7v-2zm8-8h2v2h-2V7zm0 4h2v2h-2v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zM3 13h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      <FoodtruckModal
        show={showModal}
        handleClose={handleModalClose}
        foodtruck={selectedFoodtruck}
      />

      {/* --- MODAL QR --- */}
      <Modal show={showQrModal} onHide={() => { setShowQrModal(false); if (qrImageUrl) { URL.revokeObjectURL(qrImageUrl); } setQrImageUrl(null); setQrCurrentId(null); setQrCurrentName(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Código QR - {qrCurrentName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrModalLoading ? (
            <div className="flex justify-center items-center py-8">
              <svg style={{ width: '36px', height: '36px', animation: 'spin 1s linear infinite', color: '#6366f1' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
              </svg>
            </div>
          ) : qrImageUrl ? (
            <img src={qrImageUrl} alt="QR Code" style={{ maxWidth: '100%', margin: '0 auto', display: 'block' }} />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {qrImageUrl && (
            <Button variant="primary" onClick={() => {
              const link = document.createElement('a');
              link.href = qrImageUrl;
              link.download = `qr_foodtruck_${qrCurrentId}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              Descargar QR
            </Button>
          )}
          <Button variant="secondary" onClick={() => { setShowQrModal(false); if (qrImageUrl) { URL.revokeObjectURL(qrImageUrl); } setQrImageUrl(null); setQrCurrentId(null); setQrCurrentName(''); }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- PAGINACIÓN --- */}
      <div className="flex justify-center mt-12 pb-10">
        <ReactPaginate
          previousLabel={<span className="flex items-center"><img src={Anterior} className="w-3" alt="Anterior" /></span>}
          nextLabel={<span className="flex items-center"><img src={Siguiente} className="w-3" alt="Siguiente" /></span>}
          pageCount={Math.min(10, pages)}
          onPageChange={handlePageClick}
          forcePage={currentPage}
          containerClassName="flex items-center gap-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"
          pageClassName="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition-colors"
          activeClassName="!bg-blue-600 !text-white shadow-lg shadow-blue-200"
          disabledClassName="opacity-30 cursor-not-allowed"
          breakClassName="text-gray-300 px-2"
        />
      </div>

    </div>
  );
}

export default ContenidoAdm;