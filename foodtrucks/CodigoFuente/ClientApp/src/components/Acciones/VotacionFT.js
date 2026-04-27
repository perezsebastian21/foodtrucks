import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import jwt_decode from 'jwt-decode';
import './VotacionFT.css';

// ─────────────────────────────────────────────────────────────────────────────
// RenderStars está definida FUERA del componente padre a propósito.
//
// Problema original en Android:
//   Cuando un componente se declara DENTRO de otro (como función anidada),
//   React lo trata como un tipo nuevo en cada render. Esto provoca que el
//   nodo DOM sea desmontado y remontado cada vez que el padre renderiza.
//   En Android (Chrome/WebView), el ciclo touchstart → touchend → click
//   ocurre sobre el nodo original; si ese nodo fue destruido antes de que
//   el evento click se sintetice, el toque queda sin efecto y la estrella
//   no se registra.
//
// Solución:
//   1. Extraer RenderStars al scope del módulo → identidad de tipo estable.
//   2. Envolver con React.memo → evita re-renders innecesarios cuando las
//      props no cambian.
//   3. Agregar onTouchEnd explícito → en algunos navegadores/WebViews de
//      Android el evento click sintético no se dispara si hay un
//      preventDefault() en el flujo de touch. onTouchEnd lo garantiza.
//   4. Handlers con useCallback en el padre → las referencias de función son
//      estables entre renders, lo que potencia el memo de RenderStars.
// ─────────────────────────────────────────────────────────────────────────────
const RenderStars = memo(({ idPregunta, currentRating, currentHover, onRate, onMouseEnter, onMouseLeave }) => {
    return (
        <div className="flex justify-between items-center gap-1 sm:gap-2 mt-1 w-full max-w-[260px] sm:max-w-[300px] mx-auto">
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (currentHover || currentRating);
                return (
                    <button
                        type="button"
                        key={star}
                        className="bg-transparent border-none p-0 m-0 outline-none focus:outline-none touch-manipulation transform transition-transform active:scale-95 flex-1 min-w-0 max-w-[40px] sm:max-w-[48px] flex items-center justify-center"
                        style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
                        onMouseEnter={() => onMouseEnter(idPregunta, star)}
                        onMouseLeave={() => onMouseLeave(idPregunta)}
                        onClick={(e) => {
                            e.preventDefault();
                            onRate(idPregunta, star);
                        }}
                        // Android fix: algunos navegadores/WebViews no sintetizan click
                        // cuando hay preventDefault() en el flujo de touch.
                        // onTouchEnd garantiza el registro del toque.
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            onRate(idPregunta, star);
                        }}
                        aria-label={`Calificar con ${star} estrellas`}
                    >
                        <svg
                            className={`w-full h-full block cursor-pointer transition-all duration-200 ${isActive ? 'text-yellow-400 scale-110 drop-shadow-md' : 'text-gray-300 hover:text-yellow-200'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const VotacionFT = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [preguntas, setPreguntas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cuitVotante, setCuitVotante] = useState(null);
    const [searchParams] = useSearchParams();
    const [ratings, setRatings] = useState({});
    const [foodTruck, setFoodTruck] = useState(null);
    const [hoveredRatings, setHoveredRatings] = useState({});
    const [comentario, setComentario] = useState('');
    const [errores, setErrores] = useState({});
    const [nombreVotante, setNombreVotante] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        let isTokenValid = false;
        let extractedCuit = null;
        let extractedNombre = null;

        if (token) {
            try {
                const decoded = jwt_decode(token);
                if (decoded && decoded.cuit) {
                    isTokenValid = true;
                    extractedCuit = decoded.cuit;
                    extractedNombre = decoded.nombreUsuario;
                }
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }

        if (!isTokenValid) {
            swal("Votación inválida", "El enlace no es válido o no contiene los datos requeridos.", "error").then(() => {
                navigate('/');
            });
            return;
        }

        setCuitVotante(extractedCuit);
        setNombreVotante(extractedNombre);

        const fetchPreguntas = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}preguntas/getall`);
                const preguntasActivas = response.data.filter(p => p.isActive !== false);
                const preguntasData = preguntasActivas.map(p => ({
                    ...p,
                    idPregunta: p.idPregunta,
                    texto: p.name
                }));
                setPreguntas(preguntasData);
                setCargando(false);
            } catch (error) {
                console.error("Error al obtener las preguntas", error);
                swal("Error", "No se pudieron cargar las preguntas.", "error").then(() => navigate('/'));
                setCargando(false);
            }
        };

        const fetchFoodTruck = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}foodtruck/GetById?IdFT=${id}`
                );
                setFoodTruck(response.data);
            } catch (error) {
                console.error("Error al obtener el Food Truck", error);
                swal("Error", "No se pudo cargar la información del Food Truck.", "error")
                    .then(() => navigate('/'));
            }
        };

        if (id) {
            fetchPreguntas();
            fetchFoodTruck();
        } else {
            swal("Error", "No se especificó un Food Truck para votar.", "error").then(() => navigate('/'));
        }
    }, [id, navigate, searchParams]);

    const handleMouseEnter = useCallback((idPregunta, starValue) => {
        setHoveredRatings(prev => ({ ...prev, [idPregunta]: starValue }));
    }, []);

    const handleMouseLeave = useCallback((idPregunta) => {
        setHoveredRatings(prev => ({ ...prev, [idPregunta]: 0 }));
    }, []);

    const handleRate = useCallback((idPregunta, starValue) => {
        setRatings(prev => ({ ...prev, [idPregunta]: starValue }));
        setErrores(prev => {
            if (!prev[idPregunta]) return prev;
            const newErrors = { ...prev };
            delete newErrors[idPregunta];
            return newErrors;
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrores = {};
        preguntas.forEach(p => {
            if (!ratings[p.idPregunta]) {
                newErrores[p.idPregunta] = 'Debe seleccionar una puntuación';
            }
        });

        if (Object.keys(newErrores).length > 0) {
            setErrores(newErrores);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            swal("Campos incompletos", "Por favor califique todas las preguntas antes de enviar.", "warning");
            return;
        }

        const scores = preguntas.map(p => ({
            idPregunta: p.idPregunta,
            score: ratings[p.idPregunta]
        }));

        const payload = {
            cuil: cuitVotante,
            idFT: id,
            comment: comentario.trim(),
            puntajes: scores,
            nombreUsuario: nombreVotante
        };

        try {
            const token = searchParams.get('token');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}resenias`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Enviando votación...", response.data);

            swal("¡Gracias por tu reseña!", "La calificación se ha enviado exitosamente.", "success").then(() => {
                navigate('/');
            });

        } catch (error) {
            console.error("Error al enviar la votación", error);
            if (error.response && error.response.status === 400 && error.response.data && error.response.data.error) {
                swal("Error", error.response.data.error, "error");
            } else {
                swal("Error", "Ocurrió un problema al enviar su calificación. Intente nuevamente.", "error");
            }
        }
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 font-medium tracking-wide">Cargando preguntas...</span>
            </div>
        );
    }

    return (
        <div className="votacion-container mx-auto px-3 sm:px-6 py-5 md:py-8 mb-10 w-full max-w-4xl flex flex-col">
            <div className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-2xl p-4 sm:p-6 md:p-10 border border-gray-100 justify-center flex flex-col">

                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Dejanos tu opinión</h2>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg mx-auto leading-relaxed px-2">
                        Tu feedback nos ayuda a mejorar. Dedicá unos segundos a calificar este Food Truck y contanos tu experiencia.
                    </p>
                    {foodTruck && (
                        <p className="text-blue-600 font-semibold mt-2 text-sm sm:text-base">
                            FoodTruck: {foodTruck.nombreFantasia}
                        </p>
                    )}
                    <div className="h-1 w-16 md:w-20 bg-blue-500 mx-auto mt-5 md:mt-6 rounded-full opacity-80"></div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-6 md:gap-8 w-full"
                >
                    <div className="flex flex-col gap-5 md:gap-6 w-full">
                        {preguntas.map((pregunta, index) => (
                            <div
                                key={pregunta.idPregunta}
                                className={`flex flex-col gap-3 md:gap-4 p-4 sm:p-5 md:p-6 rounded-2xl border transition-all duration-300 w-full ${errores[pregunta.idPregunta]
                                    ? "bg-red-50/50 border-red-200"
                                    : "bg-gray-50/50 border-transparent hover:border-blue-100 hover:shadow-sm"
                                    }`}
                            >
                                {/* Pregunta */}
                                <div className="flex items-start sm:items-center gap-3">
                                    <span className="flex items-center justify-center shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm shadow-sm mt-0.5 sm:mt-0">
                                        {index + 1}
                                    </span>
                                    <p className="text-[15px] sm:text-base font-semibold text-gray-800 leading-snug">
                                        {pregunta.texto}
                                    </p>
                                </div>

                                {/* Estrellas */}
                                <div className="flex justify-center w-full bg-white px-2 sm:px-6 py-3 sm:py-4 rounded-xl shadow-sm border border-gray-100">
                                    <RenderStars
                                        idPregunta={pregunta.idPregunta}
                                        currentRating={ratings[pregunta.idPregunta] || 0}
                                        currentHover={hoveredRatings[pregunta.idPregunta] || 0}
                                        onRate={handleRate}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                </div>

                                {/* Error */}
                                {errores[pregunta.idPregunta] && (
                                    <span className="text-red-500 text-[13px] font-semibold px-1 sm:px-2">
                                        {errores[pregunta.idPregunta]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 md:mt-10 bg-blue-50/30 p-4 sm:p-6 rounded-2xl border border-blue-100 flex flex-col">
                        <label htmlFor="comentario" className="text-sm font-bold text-gray-700 uppercase tracking-wider block mb-3">
                            Comentario (Opcional)
                        </label>
                        <textarea
                            id="comentario"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            className="w-full block px-5 py-4 bg-white border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl outline-none text-gray-700 text-sm resize-y min-h-[120px]"
                            placeholder="Escribí aquí los detalles de tu experiencia..."
                        />
                        <div className="text-[11px] text-gray-400 text-right mt-2 font-medium">
                            {comentario.length} caracteres
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 w-full">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 border py-3.5 sm:py-2.5 text-[15px] sm:text-base font-semibold text-gray-600 rounded-xl sm:rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 border sm:w-auto px-6 py-3.5 sm:py-2.5 text-[15px] sm:text-base font-bold text-white rounded-xl sm:rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            Enviar Calificación
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default VotacionFT;