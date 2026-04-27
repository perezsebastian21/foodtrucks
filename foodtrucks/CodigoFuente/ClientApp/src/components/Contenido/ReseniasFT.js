import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import ReactPaginate from "react-paginate";
import Siguiente from '../../assets/der.png';
import Anterior from '../../assets/izq.png';

function ReseniasFT() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const calificacionMedia = location.state?.calificacionMedia;
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                // Realizamos el GET usando el ID capturado de los params
                const response = await axios.get(`${process.env.REACT_APP_API_URL}Resenias/ByFoodtruck/${id}/Summary`);
                setSummary(response.data);
                setError(null);
            } catch (err) {
                console.error("Error al obtener el resumen de reseñas:", err);
                setError("No se pudo cargar la información de las reseñas en este momento.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSummary();
        }
    }, [id]);

    const commentsPerPage = 9;
    const pages = Math.ceil((summary?.comentarios?.length || 0) / commentsPerPage);
    const indexOfFirstComment = currentPage * commentsPerPage;
    const indexOfLastComment = indexOfFirstComment + commentsPerPage;
    const currentComments = summary?.comentarios?.slice(indexOfFirstComment, indexOfLastComment) || [];
    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50/30 min-h-screen">
            {/* HEADER */}
            <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors text-gray-600 bg-gray-50"
                    title="Volver"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reseñas de {summary?.nombreFT || 'Foodtruck'}</h1>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 w-full flex flex-col">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4 w-full">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Cargando información...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12 px-4 rounded-xl bg-red-50 border border-red-100 w-full">
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : summary ? (
                    <div className="space-y-8 w-full block">

                        {/* SUMMARY CARD PIVOT */}
                        <div className="w-full bg-amber-50 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-amber-100 shadow-sm flex flex-col">

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

                        {/* LISTADO DE RESEÑAS */}
                        <div className="w-full mt-6 md:mt-8">
                            <p className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                Comentarios de clientes
                            </p>

                            {summary.comentarios?.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 md:gap-5">
                                        {currentComments.map((comentario, index) => {
                                            const year = new Date(comentario.fecha).getFullYear();
                                            const fechaStr = year < 2000 || isNaN(year)
                                                ? 'Fecha desconocida'
                                                : new Date(comentario.fecha).toLocaleDateString();

                                            return (
                                                <div key={index} className="w-full flex flex-col items-start justify-start text-left bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all h-full">
                                                    <div className="flex flex-row items-end justify-start gap-3 md:gap-4 mb-3 md:mb-4 w-full">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 text-sm md:text-base bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white shadow-sm rounded-full flex items-center justify-center text-blue-800 font-bold uppercase shrink-0">
                                                            {comentario.usuario?.substring(0, 2)}
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <p className="font-bold text-sm md:text-base text-gray-900 leading-tight text-left">@{comentario.usuario}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full text-left flex-1 mb-3 md:mb-4">
                                                        <p className="text-gray-700 font-medium text-xs md:text-sm leading-relaxed whitespace-pre-line italic text-left">
                                                            "{comentario.comentario}"
                                                        </p>
                                                    </div>
                                                    <div className="w-full pt-3 border-t border-gray-50 mt-auto">
                                                        <p className="text-[10px] md:text-xs font-semibold text-gray-400 text-left uppercase tracking-wide">{fechaStr}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {pages > 1 && (
                                        <div className="flex justify-center mt-12 pb-10">
                                            <ReactPaginate
                                                previousLabel={<span className="flex items-center"><img src={Anterior} className="w-3" alt="Anterior" /></span>}
                                                nextLabel={<span className="flex items-center"><img src={Siguiente} className="w-3" alt="Siguiente" /></span>}
                                                pageCount={pages}
                                                onPageChange={handlePageClick}
                                                forcePage={currentPage}
                                                containerClassName="flex items-center gap-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"
                                                pageClassName="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                                                activeClassName="!bg-blue-600 !text-white shadow-lg shadow-blue-200"
                                                disabledClassName="opacity-30 cursor-not-allowed"
                                                breakClassName="text-gray-300 px-2"
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full text-center py-10 md:py-12 bg-gray-50 border border-gray-100 rounded-2xl">
                                    <p className="text-sm md:text-base text-gray-500 font-medium">Aún no hay comentarios escritos.</p>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        No se encontró información para este Foodtruck.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReseniasFT;
