import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, SlidersHorizontal, ChevronDown, Check, Star } from 'lucide-react';
import ReactPaginate from "react-paginate";
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import { Buffer } from "buffer";

import Siguiente from '../../assets/der.png';
import Anterior from '../../assets/izq.png';
import User from '../../assets/user.png';
import Menu from '../../assets/restaurant.png';
import Mail from '../../assets/mail.png';
import Ubicacion from '../../assets/ubicacion.png';
import Telefono from '../../assets/phone.png'
import NoDisponible from '../../assets/NoDisponible.png'

function ContenidoClient() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [limit, setLimit] = useState(4);
  const [rows, setRows] = useState(0);
  const [emplazado, setEmplazado] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showFilters, setShowFilters] = useState(true)

  const [emplazadoOpen, setEmplazadoOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)

  const dropdownRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setEmplazadoOpen(false)
        setCategoriaOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const url = window.location.href;
  const categoryId = url.split("/").pop();

  useEffect(() => {

    if (categoryId) {

      const searchFoodTrucksByCategoria = async (selectedPage) => {

        setLoading(true)

        try {

          const response = await axios.get(
            process.env.REACT_APP_API_URL +
            `foodtruck/FindQP?IdFT=&IdCategoria=${categoryId}&searchString=${keyword}&page=${selectedPage}&limit=${limit}&emplazado=${emplazado}&estado=A`
          );

          setFoodTrucks(response.data.data.data);
          setSearched(true);
          setPage(response.data.data.page);
          setPages(response.data.data.totalPage);
          setRows(response.data.data.totalRows);

        } catch (error) {
          console.log(error)
        }

        finally {
          setTimeout(() => setLoading(false), 1200)
        }

      };

      searchFoodTrucksByCategoria(0)

    }

  }, [])

  const searchFoodTrucks = async (selectedPage) => {

    setLoading(true)

    const categoriasParams = categoriasSeleccionadas
      .map(id => `CategoriasIds=${id}`)
      .join("&");

    const url =
      `${process.env.REACT_APP_API_URL}foodtruck/FindQP?IdFT=&IdCategoria=&searchString=${keyword}&page=${selectedPage}&limit=${limit}&emplazado=${emplazado}&estado=&${categoriasParams}`;

    try {

      const response = await axios.get(url)

      setFoodTrucks(response.data.data.data)
      setSearched(true)
      setPage(response.data.data.page)
      setPages(response.data.data.totalPage)
      setRows(response.data.data.totalRows)

    } catch (error) {
      console.log(error)
    }

    finally {
      setTimeout(() => setLoading(false), 1200)
    }

  }

  const handleSearch = () => {
    setLimit(4)
    setCurrentPage(0)
    searchFoodTrucks(0)
  }

  const toggleCategoria = (id) => {
    const idStr = id.toString()

    setCategoriasSeleccionadas(prev =>
      prev.includes(idStr)
        ? prev.filter(c => c !== idStr)
        : [...prev, idStr]
    )
  }

  useEffect(() => {

    const fetchCategorias = async () => {

      try {

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}categoria/GetAll`
        );

        setCategorias(response.data)

      } catch (error) {
        console.error(error)
      }

    }

    fetchCategorias()

  }, [])

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected)
    searchFoodTrucks(selected)
  }

  const resetInput = () => {
    setKeyword("")
    setRows("")
    setPage(0)
    setPages(0)
    setLimit(4)
    setEmplazado("")
    setFoodTrucks([])
  }

  const [showModal, setShowModal] = useState(false)
  const [selectedFoodtruck, setSelectedFoodtruck] = useState(null)

  const handleModalShow = (foodtruck) => {
    setSelectedFoodtruck(foodtruck)
    setShowModal(true)
  }

  const handleModalClose = () => setShowModal(false)

  const FoodtruckModal = ({ show, handleClose, foodtruck }) => {

    if (!foodtruck) return null

    const images = [
      { field: 'logo' },
      { field: 'ftDerecha' },
      { field: 'ftFrente' },
      { field: 'ftIzquierda' },
      { field: 'ftTrasera' }
    ].filter(item => foodtruck[item.field])

    return (

      <Modal show={show} onHide={handleClose} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>{foodtruck.nombreFantasia}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div className="flex flex-col md:flex-row gap-6">

            <div className="w-full md:w-96">

              {images.length > 0 ? (
                <Carousel interval={null}>
                  {images.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="rounded-lg w-full object-contain max-h-[300px]"
                        src={`data:image/*;base64,${Buffer.from(foodtruck[img.field])}`}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="flex justify-center items-center bg-gray-100 rounded-lg h-48">
                  <img src={NoDisponible} className="h-24" />
                </div>
              )}

            </div>

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
                  onClick={() => navigate(`/ReseniasFT/${foodtruck.idFT}`, { state: { calificacionMedia: foodtruck.calificacionMedia } })}
                >
                  Ver reseñas
                </button>
              </div>

              <div className="flex items-center gap-2">
                <img src={User} className="w-4 shrink-0" />
                <p><b>Titular:</b> {foodtruck.titular}</p>
              </div>

              <div className="flex items-center gap-2">
                <img src={Mail} className="w-4" />
                <p><b>Email:</b> {foodtruck.emailContacto}</p>
              </div>

              <div className="flex items-center gap-2">
                <img src={Telefono} className="w-4" />
                <p><b>Teléfono:</b> {foodtruck.celContacto}</p>
              </div>

              <div className="flex items-center gap-2">
                <img src={Menu} className="w-4" />
                <p><b>Menú:</b> {foodtruck.menu}</p>
              </div>

              <div className="flex items-center gap-2">
                <img src={Ubicacion} className="w-4" />
                <p><b>Emplazado:</b> {foodtruck.emplazado === "S" ? "Sí" : "No"}</p>
              </div>

            </div>

          </div>

        </Modal.Body>

      </Modal>

    )

  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50/30 min-h-screen">

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

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
          className="relative z-40 flex flex-col md:flex-row flex-wrap gap-6 mb-8 bg-white border border-gray-100 shadow-xl rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {/* FILTRO: EMPLAZADO */}
          <div className="flex-1 w-full min-w-[220px] space-y-2 relative z-[20]">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">¿Emplazado?</label>
            <div className="relative">
              <button
                onClick={() => { setEmplazadoOpen(!emplazadoOpen); setCategoriaOpen(false); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center hover:bg-white transition-all text-gray-700"
              >
                <span className="font-medium text-sm truncate pr-2">
                  {emplazado === '' && "Todos"}
                  {emplazado === 'S' && "Sí"}
                  {emplazado === 'N' && "No"}
                </span>
                <svg className={`w-4 h-4 transition-transform ${emplazadoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {emplazadoOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col">
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
          <div className="flex-1 w-full min-w-[220px] space-y-2 relative z-[10]">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categorías</label>
            <div className="relative">
              <button
                onClick={() => { setCategoriaOpen(!categoriaOpen); setEmplazadoOpen(false); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex justify-between items-center hover:bg-white transition-all text-gray-700"
              >
                <span className="font-medium text-sm truncate pr-2">
                  Seleccionadas ({categoriasSeleccionadas.length})
                </span>
                <svg className={`w-4 h-4 transition-transform ${categoriaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {categoriaOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col">
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

      {/* --- GRID DE RESULTADOS --- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] bg-white rounded-3xl border border-gray-100 p-6 animate-pulse"
            >
              <div className="h-40 bg-gray-100 rounded-2xl mb-6"></div>
              <div className="h-5 bg-gray-100 rounded-full w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded-full w-1/2 mb-4"></div>

              <div className="flex gap-2 mb-6">
                <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
                <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
              </div>

              <div className="mt-auto h-10 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {foodTrucks.map((foodtruck) => (
            <div
              key={foodtruck.idFT}
              className="group bg-white rounded-3xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* BADGES */}
              <div className="absolute mt-4 ml-4 flex flex-col gap-2 z-10">
                {foodtruck.emplazado === "S" && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    EMPLAZADO
                  </span>
                )}
              </div>

              {/* LOGO ZOOM AREA */}
              <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                {foodtruck.logo ? (
                  <img
                    src={`data:image/*;base64,${foodtruck.logo}`}
                    alt={foodtruck.nombreFantasia}
                    className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500"
                  />
                ) : (
                  <img src={NoDisponible} className="h-16 opacity-40" />
                )}
              </div>

              {/* CONTENT */}
              <div className="p-6 flex flex-col flex-1">
                {/* NOMBRE Y CALIFICACIÓN */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {foodtruck.nombreFantasia}
                  </p>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl" title="Calificación Media">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-amber-700">
                        {foodtruck.calificacionMedia ? Number(foodtruck.calificacionMedia).toFixed(1) : "-"}
                      </span>
                    </div>
                    {foodtruck.cantidadResenias > 0 && (
                      <span className="text-[11px] text-gray-500 mt-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md" title="Cantidad de reseñas">
                        {foodtruck.cantidadResenias} {foodtruck.cantidadResenias === 1 ? 'reseña' : 'reseñas'}
                      </span>
                    )}
                  </div>
                </div>

                {/* CATEGORIAS */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {foodtruck.foodtrucksCategorias?.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-semibold"
                    >
                      {item.categoria.nombre.split(",")[0]}
                    </span>
                  ))}

                  {foodtruck.foodtrucksCategorias?.length > 3 && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      +{foodtruck.foodtrucksCategorias.length - 3}
                    </span>
                  )}
                </div>

                {/* MENU */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                  {foodtruck.menu || "Explora nuestras opciones gastronómicas."}
                </p>

                {/* CTA */}
                <button
                  onClick={() => handleModalShow(foodtruck)}
                  className="mt-auto w-full py-2.5 justify-center border rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL --- */}
      <FoodtruckModal
        show={showModal}
        handleClose={handleModalClose}
        foodtruck={selectedFoodtruck}
      />

      {/* --- PAGINACIÓN --- */}
      <div className="flex justify-center mt-12 pb-10">
        <ReactPaginate
          previousLabel={<span className="flex items-center"><img src={Anterior} className="w-3" /></span>}
          nextLabel={<span className="flex items-center"><img src={Siguiente} className="w-3" /></span>}
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

export default ContenidoClient