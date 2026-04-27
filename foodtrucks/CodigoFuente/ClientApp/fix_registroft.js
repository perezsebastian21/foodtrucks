const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'components', 'Contenido', 'RegistroFT.js');

const content = `import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import swal from 'sweetalert';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
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
  const [numeroRegistro, setNumeroRegistro] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [menu, setMenu] = useState('');
  const [emplazado, setEmplazado] = useState('');
  const [solicitudIngreso, setSolicitudIngreso] = useState('');
  const [consumo, setConsumo] = useState('')
  const fileInputRef = useRef(null);
  const dniFrenteRef = useRef(null);
  const fileInputPDF = useRef(null);
  const dniDorsoRef = useRef(null);
  const ftTraseraRef = useRef(null);
  const ftIzquierdaRef = useRef(null);
  const ftDerechaRef = useRef(null);
  const ftFrenteRef = useRef(null);
  const cartaMenuRef = useRef(null);
  const [categoriasIds, setCategoriasIds] = useState([]);
  const [opcionesCategoria, setOpcionesCategoria] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
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
    if (!menu.trim()) { newErrors.menu = 'Campo requerido'; } else if (menu.length > 100) { newErrors.menu = 'Maximo 100 caracteres'; }
    if (!numeroRegistro.trim()) newErrors.numeroRegistro = 'Campo requerido';
    if (!emplazado) newErrors.emplazado = 'Campo requerido';
    if (!solicitudIngreso) newErrors.solicitudIngreso = 'Campo requerido';
    if (!fechaVencimiento.trim()) newErrors.fechaVencimiento = 'Campo requerido';
    if (!consumo.trim()) newErrors.consumo = 'Campo requerido';
    if (!fileInputRef.current.files[0]) newErrors.imagen = 'Campo requerido';
    if (!dniFrenteRef.current.files[0]) newErrors.dniFrente = 'Campo requerido';
    if (!dniDorsoRef.current.files[0]) newErrors.dniDorso = 'Campo requerido';
    if (!cartaMenuRef.current.files[0]) newErrors.cartaMenu = 'Campo requerido';
    if (!ftFrenteRef.current.files[0]) newErrors.ftFrente = 'Campo requerido';
    if (!ftTraseraRef.current.files[0]) newErrors.ftTrasera = 'Campo requerido';
    if (!ftIzquierdaRef.current.files[0]) newErrors.ftIzquierda = 'Campo requerido';
    if (!ftDerechaRef.current.files[0]) newErrors.ftDerecha = 'Campo requerido';
    if (!fileInputPDF.current.files[0]) newErrors.fileInputPDF = 'Campo requerido'
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
    appendFiles(cartaMenuRef, 'CartaMenu');
    appendFiles(ftTraseraRef, 'ftTrasera');
    appendFiles(ftIzquierdaRef, 'ftIzquierda');
    appendFiles(ftDerechaRef, 'ftDerecha');
    appendFiles(fileInputPDF, 'Habilitacion', false);

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + 'foodtruck/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200) {
        swal("Se ha Registrado Exitosamente", "Su registro pasa revision del personal", "success").then(() => {
          navigate('/');
        });
      }
    } catch (error) {
      swal("No se ha podido Registrar", "Algo salio mal", "error");
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
        const response = await axios.get(\`\${process.env.REACT_APP_API_URL}categoria/GetAll\`);
        const categorias = response.data.map(cat => ({
          value: cat.idCategoria.toString(),
          label: cat.nombre
        }));
        setOpcionesCategoria(categorias);
      } catch (error) {
        console.error("Error al cargar las categorias:", error);
      }
    };
    fetchCategorias();
  }, []);

  const SectionHeader = ({ num, title }) => (
    <div className="w-100 mb-3 mt-4 pb-2 border-bottom d-flex align-items-center gap-2">
      <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.85rem' }}>{num}</span>
      <h6 className="mb-0 fw-semibold text-dark">{title}</h6>
    </div>
  );

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh', padding: '2rem 1rem' }}>
      <Container style={{ maxWidth: '700px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Registro Unico FoodTrucks</h2>
          <p className="text-muted">Complete los datos para solicitar su registro</p>
        </div>
        <Card className="shadow border-0 rounded-4 mb-5">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit} noValidate
              style={{ background: 'transparent', padding: 0, boxShadow: 'none', borderRadius: 0, display: 'block' }}>

              <SectionHeader num="1" title="Datos Principales" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={6} controlId="formNombreFantasia">
                  <Form.Label className="fw-semibold small text-muted">Nombre Fantasia</Form.Label>
                  <Form.Control type="text" value={nombreFantasia}
                    onChange={handleInputChange(setNombreFantasia, 'nombreFantasia')}
                    isInvalid={!!errors.nombreFantasia}
                    placeholder="Nombre de fantasia del FoodTruck" />
                  <Form.Control.Feedback type="invalid">{errors.nombreFantasia}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formTitular">
                  <Form.Label className="fw-semibold small text-muted">Titular de la Habilitacion</Form.Label>
                  <Form.Control type="text" value={titular}
                    onChange={handleInputChange(setTitular, 'titular')}
                    isInvalid={!!errors.titular}
                    placeholder="Nombre y apellido del titular" />
                  <Form.Control.Feedback type="invalid">{errors.titular}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={4} controlId="formCuitCuil">
                  <Form.Label className="fw-semibold small text-muted">CUIT / CUIL</Form.Label>
                  <Form.Control type="text" value={cuitCuil}
                    onChange={handleInputChange(setCuitCuil, 'cuitCuil')}
                    isInvalid={!!errors.cuitCuil}
                    placeholder="Sin guiones ni espacios" />
                  <Form.Control.Feedback type="invalid">{errors.cuitCuil}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={8} controlId="formDomicilio">
                  <Form.Label className="fw-semibold small text-muted">Domicilio Legal</Form.Label>
                  <Form.Control type="text" value={domicilioLegal}
                    onChange={handleInputChange(setDomicilioLegal, 'domicilioLegal')}
                    isInvalid={!!errors.domicilioLegal}
                    placeholder="Calle, Numero, Localidad" />
                  <Form.Control.Feedback type="invalid">{errors.domicilioLegal}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <SectionHeader num="2" title="Informacion de Contacto" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={4} controlId="formTelefono">
                  <Form.Label className="fw-semibold small text-muted">Telefono</Form.Label>
                  <Form.Control type="tel" value={telefono}
                    onChange={handleInputChange(setTelefono, 'telefono')}
                    isInvalid={!!errors.telefono}
                    placeholder="Ej: 0351 123-4567" />
                  <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={4} controlId="formEmailTitular">
                  <Form.Label className="fw-semibold small text-muted">Email del Titular</Form.Label>
                  <Form.Control type="email" value={emailTitular}
                    onChange={handleInputChange(setEmailTitular, 'emailTitular')}
                    isInvalid={!!errors.emailTitular}
                    placeholder="titular@correo.com" />
                  <Form.Control.Feedback type="invalid">{errors.emailTitular}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={4} controlId="formEmailContacto">
                  <Form.Label className="fw-semibold small text-muted">Email de Contacto</Form.Label>
                  <Form.Control type="email" value={emailContacto}
                    onChange={handleInputChange(setEmailContacto, 'emailContacto')}
                    isInvalid={!!errors.emailContacto}
                    placeholder="contacto@correo.com" />
                  <Form.Control.Feedback type="invalid">{errors.emailContacto}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <SectionHeader num="3" title="Documentacion General" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={6} controlId="formDniFrente">
                  <Form.Label className="fw-semibold small text-muted">DNI (Frente)</Form.Label>
                  <Form.Control type="file" ref={dniFrenteRef} accept="image/*"
                    onChange={() => errors.dniFrente && setErrors(prev => ({ ...prev, dniFrente: undefined }))}
                    isInvalid={!!errors.dniFrente} />
                  <Form.Control.Feedback type="invalid">{errors.dniFrente}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formDniDorso">
                  <Form.Label className="fw-semibold small text-muted">DNI (Dorso)</Form.Label>
                  <Form.Control type="file" ref={dniDorsoRef} accept="image/*"
                    onChange={() => errors.dniDorso && setErrors(prev => ({ ...prev, dniDorso: undefined }))}
                    isInvalid={!!errors.dniDorso} />
                  <Form.Control.Feedback type="invalid">{errors.dniDorso}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formNumeroRegistro">
                  <Form.Label className="fw-semibold small text-muted">Numero de Registro / GDE</Form.Label>
                  <Form.Control type="text" value={numeroRegistro}
                    onChange={handleInputChange(setNumeroRegistro, 'numeroRegistro')}
                    placeholder="Ej: EX-2024-0001234"
                    isInvalid={!!errors.numeroRegistro} />
                  <Form.Control.Feedback type="invalid">{errors.numeroRegistro}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formFechaVencimiento">
                  <Form.Label className="fw-semibold small text-muted">Fecha Vencimiento Habilitacion</Form.Label>
                  <Form.Control type="date" value={fechaVencimiento}
                    onChange={handleInputChange(setFechaVencimiento, 'fechaVencimiento')}
                    isInvalid={!!errors.fechaVencimiento} />
                  <Form.Control.Feedback type="invalid">{errors.fechaVencimiento}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formConsumo">
                  <Form.Label className="fw-semibold small text-muted">Consumo Estimado (KW/A)</Form.Label>
                  <Form.Control type="text" value={consumo}
                    onChange={handleInputChange(setConsumo, 'consumo')}
                    isInvalid={!!errors.consumo}
                    placeholder="Ej: 5KW / 20A" />
                  <Form.Control.Feedback type="invalid">{errors.consumo}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formHabilitacionPDF">
                  <Form.Label className="fw-semibold small text-muted">Habilitacion Municipal (PDF)</Form.Label>
                  <Form.Control type="file" ref={fileInputPDF} accept="application/pdf"
                    onChange={() => errors.fileInputPDF && setErrors(prev => ({ ...prev, fileInputPDF: undefined }))}
                    isInvalid={!!errors.fileInputPDF} />
                  <Form.Control.Feedback type="invalid">{errors.fileInputPDF}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <SectionHeader num="4" title="Datos del Emprendimiento" />
              <Form.Group className="mb-3" controlId="formCategorias">
                <Form.Label className="fw-semibold small text-muted">Categoria del FoodTruck</Form.Label>
                <div className="d-flex flex-wrap gap-3 p-3 bg-light border rounded-3">
                  {opcionesCategoria.map((opcion) => (
                    <Form.Check key={opcion.value} type="checkbox" id={\`cat-\${opcion.value}\`}
                      label={opcion.label} value={opcion.value}
                      checked={categoriasIds.includes(opcion.value)}
                      onChange={handleCheckboxChange(setCategoriasIds, opcion.value)} />
                  ))}
                </div>
              </Form.Group>
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={6} controlId="formEmplazado">
                  <Form.Label className="fw-semibold small text-muted">Se encuentra emplazado?</Form.Label>
                  <Form.Select value={emplazado} onChange={handleInputChange(setEmplazado, 'emplazado')} isInvalid={!!errors.emplazado}>
                    <option value="">Seleccione...</option>
                    <option value="S">Si</option>
                    <option value="N">No</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.emplazado}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formSolicitudIngreso">
                  <Form.Label className="fw-semibold small text-muted">Solicitud para ingresar a:</Form.Label>
                  <Form.Select value={solicitudIngreso} onChange={handleInputChange(setSolicitudIngreso, 'solicitudIngreso')} isInvalid={!!errors.solicitudIngreso}>
                    <option value="">Seleccione...</option>
                    <option value="1">Ferias fijas</option>
                    <option value="2">Eventos</option>
                    <option value="3">Ambas opciones</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.solicitudIngreso}</Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Form.Group className="mb-3" controlId="formDescripcionMenu">
                <Form.Label className="fw-semibold small text-muted">Descripcion Breve del Menu</Form.Label>
                <Form.Control as="textarea" rows={3} value={menu}
                  onChange={handleInputChange(setMenu, 'menu')}
                  isInvalid={!!errors.menu} maxLength={100}
                  placeholder="Ej: Hamburguesas artesanales, papas fritas y bebidas" />
                <div className="d-flex justify-content-between mt-1">
                  <Form.Control.Feedback type="invalid" className="d-block">{errors.menu}</Form.Control.Feedback>
                  <small className="text-muted ms-auto">{menu.length}/100</small>
                </div>
              </Form.Group>

              <SectionHeader num="5" title="Material Fotografico del Vehiculo" />
              <Row className="g-3 mb-4">
                <Form.Group as={Col} xs={12} sm={6} controlId="formFotoPerfil">
                  <Form.Label className="fw-semibold small text-muted">Foto Principal del FoodTruck</Form.Label>
                  <Form.Control type="file" ref={fileInputRef} accept="image/*"
                    onChange={() => errors.imagen && setErrors(prev => ({ ...prev, imagen: undefined }))}
                    isInvalid={!!errors.imagen} />
                  <Form.Control.Feedback type="invalid">{errors.imagen}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formCartaMenu">
                  <Form.Label className="fw-semibold small text-muted">Carta / Menu (Imagen)</Form.Label>
                  <Form.Control type="file" ref={cartaMenuRef} accept="image/*"
                    onChange={() => errors.cartaMenu && setErrors(prev => ({ ...prev, cartaMenu: undefined }))}
                    isInvalid={!!errors.cartaMenu} />
                  <Form.Control.Feedback type="invalid">{errors.cartaMenu}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formFtFrente">
                  <Form.Label className="fw-semibold small text-muted">Vista Frontal</Form.Label>
                  <Form.Control type="file" ref={ftFrenteRef} accept="image/*"
                    onChange={() => errors.ftFrente && setErrors(prev => ({ ...prev, ftFrente: undefined }))}
                    isInvalid={!!errors.ftFrente} />
                  <Form.Control.Feedback type="invalid">{errors.ftFrente}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formFtTrasera">
                  <Form.Label className="fw-semibold small text-muted">Vista Trasera</Form.Label>
                  <Form.Control type="file" ref={ftTraseraRef} accept="image/*"
                    onChange={() => errors.ftTrasera && setErrors(prev => ({ ...prev, ftTrasera: undefined }))}
                    isInvalid={!!errors.ftTrasera} />
                  <Form.Control.Feedback type="invalid">{errors.ftTrasera}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formFtIzquierda">
                  <Form.Label className="fw-semibold small text-muted">Lateral Izquierdo</Form.Label>
                  <Form.Control type="file" ref={ftIzquierdaRef} accept="image/*"
                    onChange={() => errors.ftIzquierda && setErrors(prev => ({ ...prev, ftIzquierda: undefined }))}
                    isInvalid={!!errors.ftIzquierda} />
                  <Form.Control.Feedback type="invalid">{errors.ftIzquierda}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} controlId="formFtDerecha">
                  <Form.Label className="fw-semibold small text-muted">Lateral Derecho</Form.Label>
                  <Form.Control type="file" ref={ftDerechaRef} accept="image/*"
                    onChange={() => errors.ftDerecha && setErrors(prev => ({ ...prev, ftDerecha: undefined }))}
                    isInvalid={!!errors.ftDerecha} />
                  <Form.Control.Feedback type="invalid">{errors.ftDerecha}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <div className="d-grid">
                <Button variant="primary" size="lg" type="submit" className="rounded-3 shadow-sm fw-bold py-3">
                  Enviar Solicitud de Registro
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegistroFT
`;

fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
console.log('Done! Wrote', content.length, 'chars to', targetPath);
