import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, Eye, EyeOff, Star } from 'lucide-react';
import ReactPaginate from "react-paginate";
import Siguiente from '../../assets/der.png';
import Anterior from '../../assets/izq.png';
import '../Contenido/Contenido.css';

function AdmReseniasFT() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const calificacionMedia = location.state?.calificacionMedia;
    const token = localStorage.getItem('token');
    const [resenias, setResenias] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);

    const fetchResenias = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}Resenias/ByFoodtruck/${id}/SummaryAdmin`);
            let data = response.data;
            setSummary(data);

            // Si el endpoint retorna el mismo formato que el Summary normal, desglosamos 'comentarios'
            if (data && Array.isArray(data.comentarios)) {
                data = data.comentarios;
            } else if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
                data = data.data;
            } else if (!Array.isArray(data)) {
                data = [];
            }
            setResenias(data);
        } catch (err) {
            console.error("Error fetching reseñas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResenias();
    }, []);

    const handleToggleOcultar = async (resenia) => {
        const reseniaId = resenia.idResenia || resenia.id;
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}Resenias/${reseniaId}/CambiarVisibilidad`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchResenias();
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar el estado del comentario.");
        }
    };

    const handleSearchChange = (e) => {
        setKeyword(e.target.value);
        setCurrentPage(0);
    }

    // Buscador local
    const filteredData = resenias.filter(r =>
        (r.comentario || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (r.usuario || '').toLowerCase().includes(keyword.toLowerCase())
    );

    // Paginación local de 9 o 10 items
    const limit = 10;
    const pages = Math.ceil(filteredData.length / limit);
    const currentData = filteredData.slice(currentPage * limit, (currentPage * limit) + limit);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50/30 min-h-screen">
            {/* HEADER */}
            <div className="mb-4 md:mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors text-gray-600 bg-gray-50"
                        title="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestión de Reseñas de {summary?.nombreFT || 'Foodtruck'}</h1>
                </div>
            </div>

            {/* SUMMARY CARD PIVOT */}
            {summary && summary.promediosPorPregunta && (
                <div className="w-full bg-amber-50 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-amber-100 shadow-sm flex flex-col mb-6">
                    {/* TOP ROW: Puntaje (Left) | Bars (Right) on Mobile & Desktop */}
                    <div className="flex flex-row w-full gap-3 md:gap-8 lg:gap-12">
                        {/* Left Side: Puntaje */}
                        <div className="w-1/3 shrink-0 flex flex-col justify-center items-center text-center">
                            <div className="flex flex-row items-center justify-center gap-1.5 md:gap-2">
                                <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-amber-500 fill-amber-500" />
                                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-700 leading-none">
                                    {calificacionMedia
                                        ? Number(calificacionMedia).toFixed(1)
                                        : summary.promediosPorPregunta && summary.promediosPorPregunta.length > 0
                                            ? (summary.promediosPorPregunta.reduce((acc, p) => acc + p.promedio, 0) / summary.promediosPorPregunta.length).toFixed(1)
                                            : "-"}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-amber-800 uppercase tracking-tight md:tracking-widest mt-1.5 md:mt-2 leading-tight">
                                Puntaje General
                            </p>
                            {/* Desktop pill */}
                            <div className="hidden md:block mt-4">
                                <span className="text-sm font-medium text-amber-800 bg-amber-100/80 px-4 py-2 rounded-xl">
                                    Basado en {summary.comentarios?.length || 0} reseñas
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Bars */}
                        <div className="flex-1 space-y-3.5 md:space-y-5 border-l border-amber-200/60 pl-3 sm:pl-5 md:pl-8 lg:pl-12 flex flex-col justify-center">
                            {summary.promediosPorPregunta?.map((pregunta) => (
                                <div key={pregunta.idPregunta} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 w-full">
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-end mb-1 md:mb-1.5">
                                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 text-left leading-none">{pregunta.nombrePregunta}</p>
                                            <span className="block md:hidden text-[11px] sm:text-xs font-black text-amber-600 leading-none">{pregunta.promedio?.toFixed(1)}</span>
                                        </div>
                                        <div className="h-2 md:h-3 w-full bg-amber-200/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${(pregunta.promedio / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block w-8 md:w-10 text-right shrink-0">
                                        <span className="text-lg md:text-xl font-black text-amber-700">{pregunta.promedio?.toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Pill (Bottom) */}
                    <div className="block md:hidden w-full text-center mt-4 pt-3 border-t border-amber-200/60">
                        <span className="text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-100/80 px-4 py-1.5 rounded-lg inline-block">
                            Basado en {summary.comentarios?.length || 0} reseñas
                        </span>
                    </div>
                </div>
            )}

            {/* SECCIÓN DE BÚSQUEDA */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por comentario, usuario..."
                        value={keyword}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all outline-none text-gray-700"
                    />
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden text-left" style={{ boxShadow: 'none' }}>
                <div className="overflow-x-auto">
                    <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: '800px', tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '55%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '15%' }} />
                        </colgroup>
                        <thead>
                            <tr style={{ backgroundColor: '#2563eb' }}>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Usuario</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Comentario</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Fecha</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', borderBottom: 'none' }}>Visibilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '48px 20px', textAlign: 'center', borderBottom: 'none' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Cargando reseñas...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', borderBottom: 'none' }}>
                                        No se encontraron reseñas.
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((resenia, index) => {
                                    const rawDate = resenia.fecha || resenia.Fecha;
                                    const valYear = new Date(rawDate).getFullYear();
                                    const fechaFormat = (!rawDate || isNaN(valYear) || valYear < 2000)
                                        ? "Fecha desconocida"
                                        : new Date(rawDate).toLocaleDateString();

                                    return (
                                        <tr key={resenia.idResenia || resenia.id || index} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 500, color: '#111827', borderBottom: 'none' }}>
                                                @{resenia.usuario || 'Anónimo'}
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4b5563', maxWidth: '400px', borderBottom: 'none' }}>
                                                <p className="line-clamp-2" title={resenia.comentario}>{resenia.comentario}</p>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '13px', color: '#6b7280', borderBottom: 'none' }}>
                                                {fechaFormat}
                                            </td>
                                            <td style={{ padding: '12px 20px', fontSize: '13px', borderBottom: 'none' }}>
                                                <button
                                                    onClick={() => handleToggleOcultar(resenia)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 w-[105px] justify-center ${resenia.visible === 'N'
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                                        }`}
                                                    title={resenia.visible === 'N' ? "Comentario oculto (Click para hacer visible)" : "Comentario visible (Click para ocultar)"}
                                                >
                                                    {resenia.visible === 'N' ? (
                                                        <>
                                                            <EyeOff className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                            <span>Oculto</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                            <span>Visible</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINACIÓN */}
            {pages > 1 && (
                <div className="flex justify-center mt-12 pb-10">
                    <ReactPaginate
                        previousLabel={<span className="flex items-center"><img src={Anterior} className="w-3" alt="Anterior" /></span>}
                        nextLabel={<span className="flex items-center"><img src={Siguiente} className="w-3" alt="Siguiente" /></span>}
                        pageCount={pages}
                        onPageChange={handlePageClick}
                        forcePage={currentPage}
                        containerClassName="flex items-center gap-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"
                        pageClassName="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        activeClassName="!bg-blue-600 !text-white shadow-lg shadow-blue-200"
                        disabledClassName="opacity-30 cursor-not-allowed"
                        breakClassName="text-gray-300 px-2"
                    />
                </div>
            )}
        </div>
    );
}

export default AdmReseniasFT;
