const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'components', 'Acciones', 'EditRegistroFT.js');

const content = `import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import swal from 'sweetalert';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';

/* ───── Modal simple para previsualizar imagenes ───── */
const ImageModal = ({ show, src, onClose }) => {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 12, padding: 20,
        maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 8, right: 12,
          background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1
        }}>&times;</button>
        <img src={src} alt="Vista previa" style={{ maxWidth: '100%', height: 'auto', marginTop: 28 }} />
      </div>
    </div>
  );
};

/* ───── Encabezado de seccion reutilizable ───── */
const SectionHeader = ({ num, title }) => (
  <div className="w-100 mb-3 mt-4 pb-2 border-bottom d-flex align-items-center gap-2">
    <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.85rem' }}>{num}</span>
    <h6 className="mb-0 fw-semibold text-dark">{title}</h6>
  </div>
);

/* ───── Fila de archivo existente con link de preview ───── */
const FileRow = ({ label, data, fileName, onView, hasError, errorMsg }) => (
  <Form.Group className="mb-2">
    <Form.Label className="fw-semibold small text-muted">{label}</Form.Label>
    <div className="d-flex align-items-center gap-2 p-2 rounded-3 border bg-white">
      {data ? (
        <button type="button" className="btn btn-sm btn-outline-primary rounded-3 text-nowrap"
          onClick={() => onView(data, fileName)}>
          Ver archivo actual
        </button>
      ) : (
        <span className="text-muted small">Sin archivo subido</span>
      )}
    </div>
    {hasError && <div className="text-danger small mt-1">{errorMsg}</div>}
  </Form.Group>
);

/* ═══════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════ */
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
  const [categoriasIds, setCategoriasIds] = useState([]);
  const [opcionesCategoria, setOpcionesCategoria] = useState([]);
  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [modalSrc, setModalSrc] = useState('');

  /* ── cargar categorias ── */
  useEffect(() => {
    axios.get(\`\${process.env.REACT_APP_API_URL}categoria/GetAll\`)
      .then(r => setOpcionesCategoria(r.data.map(c => ({ value: c.idCategoria.toString(), label: c.nombre }))))
      .catch(e => console.error('Error al cargar categorias:', e));
  }, []);

  /* ── cargar datos del foodtruck ── */
  useEffect(() => {
    if (!id) return;
    axios.get(\`\${process.env.REACT_APP_API_URL}foodtruck/GetById?idFT=\${id}\`)
      .then(r => {
        const d = r.data;
        setFoodTruckData(d);
        setNombreFantasia(d.nombreFantasia || '');
        setTitular(d.titular || '');
        setCuitCuil(d.cuitCuil || '');
        setDomicilioLegal(d.domicilioLegal || '');
        setTelefono(d.telefono || '');
        setEmailTitular(d.emailTitular || '');
        setEmailContacto(d.emailContacto || '');
        setNumeroRegistro(d.numeroRegistro || '');
        setEstado(d.estado || '');
        setFechaVencimiento(d.fechaVencimiento ? d.fechaVencimiento.split('T')[0] : '');
        setMenu(d.menu || '');
        setEmplazado(d.emplazado || '');
        setSolicitudIngreso(d.solicitudIngreso || '');
        setConsumo(d.consumo || '');
        setCategoriasIds(d.foodtrucksCategorias?.length
          ? d.foodtrucksCategorias.map(c => c.idCategoria.toString())
          : []);
      })
      .catch(() => {
        swal('Error', 'No se pudo cargar la informacion del Food Truck.', 'error').then(() => navigate('/'));
      });
  }, [id, navigate]);

  const handleInputChange = (setter, field) => e => {
    setter(e.target.value);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleCheckboxChange = value => e => {
    const v = value.toString();
    setCategoriasIds(prev => e.target.checked ? [...prev, v] : prev.filter(x => x !== v));
  };

  const base64ToBlob = (b64, mime = 'application/octet-stream') => {
    const chars = atob(b64);
    const bytes = new Uint8Array(chars.length);
    for (let i = 0; i < chars.length; i++) bytes[i] = chars.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  };

  const handleViewFile = (b64, fileName) => {
    if (!b64) { swal('', 'No hay archivo para mostrar.', 'info'); return; }
    const ext = fileName?.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      const url = URL.createObjectURL(base64ToBlob(b64, 'application/pdf'));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      setModalSrc(\`data:image/\${ext};base64,\${b64}\`);
      setShowModal(true);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = {};
    if (!nombreFantasia.trim()) err.nombreFantasia = 'Campo requerido';
    if (!titular.trim()) err.titular = 'Campo requerido';
    if (!cuitCuil.trim()) err.cuitCuil = 'Campo requerido';
    if (!domicilioLegal.trim()) err.domicilioLegal = 'Campo requerido';
    if (!telefono.trim()) err.telefono = 'Campo requerido';
    if (!emailTitular.trim()) err.emailTitular = 'Campo requerido';
    if (!emailContacto.trim()) err.emailContacto = 'Campo requerido';
    if (!estado) err.estado = 'Campo requerido';
    if (!menu.trim()) err.menu = 'Campo requerido';
    else if (menu.length > 100) err.menu = 'Maximo 100 caracteres';
    if (!numeroRegistro.trim()) err.numeroRegistro = 'Campo requerido';
    if (!emplazado) err.emplazado = 'Campo requerido';
    if (!solicitudIngreso) err.solicitudIngreso = 'Campo requerido';
    if (!fechaVencimiento.trim()) err.fechaVencimiento = 'Campo requerido';
    if (!consumo.trim()) err.consumo = 'Campo requerido';
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    const fd = new FormData();
    fd.append('idFT', id);
    fd.append('nombreFantasia', nombreFantasia);
    fd.append('titular', titular);
    fd.append('cuitCuil', cuitCuil);
    fd.append('domicilioLegal', domicilioLegal);
    fd.append('telefono', telefono);
    fd.append('emailTitular', emailTitular);
    fd.append('emailContacto', emailContacto);
    fd.append('numeroRegistro', numeroRegistro);
    fd.append('estado', estado);
    fd.append('fechaVencimiento', fechaVencimiento);
    fd.append('emplazado', emplazado);
    fd.append('solicitudIngreso', solicitudIngreso);
    fd.append('consumo', consumo);
    fd.append('menu', menu);

    const appendB64 = (field, b64, name, mime) => {
      if (b64) fd.append(field, base64ToBlob(b64, mime), name);
    };
    appendB64('dniFrente', foodTruckData.dniFrente, 'dniFrente.jpeg', 'image/jpeg');
    appendB64('dniDorso', foodTruckData.dniDorso, 'dniDorso.jpeg', 'image/jpeg');
    appendB64('habilitacion', foodTruckData.habilitacion, 'habilitacion.pdf', 'application/pdf');
    appendB64('cartaMenu', foodTruckData.cartaMenu, 'cartaMenu.jpeg', 'image/jpeg');
    appendB64('logo', foodTruckData.logo, 'logo.jpeg', 'image/jpeg');
    appendB64('ftFrente', foodTruckData.ftFrente, 'ftFrente.jpeg', 'image/jpeg');
    appendB64('ftTrasera', foodTruckData.ftTrasera, 'ftTrasera.jpeg', 'image/jpeg');
    appendB64('ftIzquierda', foodTruckData.ftIzquierda, 'ftIzquierda.jpeg', 'image/jpeg');
    appendB64('ftDerecha', foodTruckData.ftDerecha, 'ftDerecha.jpeg', 'image/jpeg');
    categoriasIds.forEach(cid => fd.append('categoriasIds', cid));

    try {
      const r = await axios.put(\`\${process.env.REACT_APP_API_URL}foodtruck/\`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (r.status === 200) {
        swal('Food Truck Actualizado', 'La informacion ha sido modificada correctamente.', 'success')
          .then(() => navigate('/'));
      }
    } catch {
      swal('Error', 'No se pudo actualizar el Food Truck.', 'error');
    }
  };

  if (!foodTruckData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6fb' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">Cargando informacion del Food Truck...</p>
        </div>
      </div>
    );
  }

  const estadoBadge = { A: 'success', I: 'secondary', S: 'warning', B: 'danger' };

  return (
    <div style={{ background: '#f4f6fb', minHeight: '100vh', padding: '2rem 1rem' }}>
      <Container style={{ maxWidth: '700px' }}>

        {/* Encabezado */}
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Edicion de Food Truck</h2>
          <p className="text-muted">
            Modifique los datos y confirme los cambios{' '}
            {estado && <Badge bg={estadoBadge[estado] || 'secondary'} className="ms-1">{
              { A: 'Activo', I: 'Inactivo', S: 'Suspendido', B: 'Eliminado' }[estado] || estado
            }</Badge>}
          </p>
        </div>

        <Card className="shadow border-0 rounded-4 mb-5">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit} noValidate
              style={{ background: 'transparent', padding: 0, boxShadow: 'none', borderRadius: 0, display: 'block' }}>

              {/* ── 1 Datos Principales ── */}
              <SectionHeader num="1" title="Datos Principales" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={6} controlId="formNombreFantasia">
                  <Form.Label className="fw-semibold small text-muted">Nombre Fantasia</Form.Label>
                  <Form.Control type="text" value={nombreFantasia}
                    onChange={handleInputChange(setNombreFantasia, 'nombreFantasia')}
                    isInvalid={!!errors.nombreFantasia} placeholder="Nombre de fantasia del FoodTruck" />
                  <Form.Control.Feedback type="invalid">{errors.nombreFantasia}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={6} controlId="formTitular">
                  <Form.Label className="fw-semibold small text-muted">Titular de la Habilitacion</Form.Label>
                  <Form.Control type="text" value={titular}
                    onChange={handleInputChange(setTitular, 'titular')}
                    isInvalid={!!errors.titular} placeholder="Nombre y apellido del titular" />
                  <Form.Control.Feedback type="invalid">{errors.titular}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={4} controlId="formCuitCuil">
                  <Form.Label className="fw-semibold small text-muted">CUIT / CUIL</Form.Label>
                  <Form.Control type="text" value={cuitCuil}
                    onChange={handleInputChange(setCuitCuil, 'cuitCuil')}
                    isInvalid={!!errors.cuitCuil} placeholder="Sin guiones ni espacios" />
                  <Form.Control.Feedback type="invalid">{errors.cuitCuil}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={8} controlId="formDomicilio">
                  <Form.Label className="fw-semibold small text-muted">Domicilio Legal</Form.Label>
                  <Form.Control type="text" value={domicilioLegal}
                    onChange={handleInputChange(setDomicilioLegal, 'domicilioLegal')}
                    isInvalid={!!errors.domicilioLegal} placeholder="Calle, Numero, Localidad" />
                  <Form.Control.Feedback type="invalid">{errors.domicilioLegal}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              {/* ── 2 Contacto ── */}
              <SectionHeader num="2" title="Informacion de Contacto" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={4} controlId="formTelefono">
                  <Form.Label className="fw-semibold small text-muted">Telefono</Form.Label>
                  <Form.Control type="tel" value={telefono}
                    onChange={handleInputChange(setTelefono, 'telefono')}
                    isInvalid={!!errors.telefono} placeholder="Ej: 0351 123-4567" />
                  <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={4} controlId="formEmailTitular">
                  <Form.Label className="fw-semibold small text-muted">Email del Titular</Form.Label>
                  <Form.Control type="email" value={emailTitular}
                    onChange={handleInputChange(setEmailTitular, 'emailTitular')}
                    isInvalid={!!errors.emailTitular} placeholder="titular@correo.com" />
                  <Form.Control.Feedback type="invalid">{errors.emailTitular}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={4} controlId="formEmailContacto">
                  <Form.Label className="fw-semibold small text-muted">Email de Contacto</Form.Label>
                  <Form.Control type="email" value={emailContacto}
                    onChange={handleInputChange(setEmailContacto, 'emailContacto')}
                    isInvalid={!!errors.emailContacto} placeholder="contacto@correo.com" />
                  <Form.Control.Feedback type="invalid">{errors.emailContacto}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              {/* ── 3 Documentacion ── */}
              <SectionHeader num="3" title="Documentacion y Registro" />
              <Row className="g-3 mb-2">
                <Form.Group as={Col} xs={12} sm={6} controlId="formNumeroRegistro">
                  <Form.Label className="fw-semibold small text-muted">Numero de Registro / GDE</Form.Label>
                  <Form.Control type="text" value={numeroRegistro}
                    onChange={handleInputChange(setNumeroRegistro, 'numeroRegistro')}
                    isInvalid={!!errors.numeroRegistro} placeholder="Ej: EX-2024-0001234" />
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
                    isInvalid={!!errors.consumo} placeholder="Ej: 5KW / 20A" />
                  <Form.Control.Feedback type="invalid">{errors.consumo}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} sm={6} controlId="formEstado">
                  <Form.Label className="fw-semibold small text-muted">Estado del Registro</Form.Label>
                  <Form.Select value={estado} onChange={handleInputChange(setEstado, 'estado')} isInvalid={!!errors.estado}>
                    <option value="">Seleccione...</option>
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                    <option value="S">Suspendido</option>
                    <option value="B">Eliminado</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.estado}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              {/* Archivos de documentacion */}
              <p className="small text-muted mt-3 mb-2">Documentos adjuntos (solo lectura — se guardan automaticamente)</p>
              <Row className="g-3 mb-2">
                <Col xs={12} sm={6}>
                  <FileRow label="DNI Frente" data={foodTruckData.dniFrente} fileName="dniFrente.jpeg"
                    onView={handleViewFile} hasError={!!errors.dniFrente} errorMsg={errors.dniFrente} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="DNI Dorso" data={foodTruckData.dniDorso} fileName="dniDorso.jpeg"
                    onView={handleViewFile} hasError={!!errors.dniDorso} errorMsg={errors.dniDorso} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Habilitacion Municipal (PDF)" data={foodTruckData.habilitacion} fileName="habilitacion.pdf"
                    onView={handleViewFile} hasError={!!errors.fileInputPDF} errorMsg={errors.fileInputPDF} />
                </Col>
              </Row>

              {/* ── 4 Emprendimiento ── */}
              <SectionHeader num="4" title="Datos del Emprendimiento" />
              <Form.Group className="mb-3" controlId="formCategorias">
                <Form.Label className="fw-semibold small text-muted">Categoria del FoodTruck</Form.Label>
                <div className="d-flex flex-wrap gap-3 p-3 bg-light border rounded-3">
                  {opcionesCategoria.map(op => (
                    <Form.Check key={op.value} type="checkbox" id={\`cat-\${op.value}\`}
                      label={op.label} value={op.value}
                      checked={categoriasIds.includes(op.value)}
                      onChange={handleCheckboxChange(op.value)} />
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
                    <option value="3">Ambos</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.solicitudIngreso}</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" controlId="formMenu">
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

              {/* ── 5 Fotos del vehiculo ── */}
              <SectionHeader num="5" title="Material Fotografico del Vehiculo" />
              <p className="small text-muted mb-3">Vista previa de las fotos registradas</p>
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6}>
                  <FileRow label="Foto Principal (Logo)" data={foodTruckData.logo} fileName="logo.jpeg"
                    onView={handleViewFile} hasError={!!errors.imagen} errorMsg={errors.imagen} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Carta / Menu (Imagen)" data={foodTruckData.cartaMenu} fileName="cartaMenu.jpeg"
                    onView={handleViewFile} hasError={!!errors.cartaMenu} errorMsg={errors.cartaMenu} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Vista Frontal" data={foodTruckData.ftFrente} fileName="ftFrente.jpeg"
                    onView={handleViewFile} hasError={!!errors.ftFrente} errorMsg={errors.ftFrente} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Vista Trasera" data={foodTruckData.ftTrasera} fileName="ftTrasera.jpeg"
                    onView={handleViewFile} hasError={!!errors.ftTrasera} errorMsg={errors.ftTrasera} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Lateral Izquierdo" data={foodTruckData.ftIzquierda} fileName="ftIzquierda.jpeg"
                    onView={handleViewFile} hasError={!!errors.ftIzquierda} errorMsg={errors.ftIzquierda} />
                </Col>
                <Col xs={12} sm={6}>
                  <FileRow label="Lateral Derecho" data={foodTruckData.ftDerecha} fileName="ftDerecha.jpeg"
                    onView={handleViewFile} hasError={!!errors.ftDerecha} errorMsg={errors.ftDerecha} />
                </Col>
              </Row>

              {/* Boton submit */}
              <div className="d-grid">
                <Button variant="primary" size="lg" type="submit" className="rounded-3 shadow-sm fw-bold py-3">
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal imagen */}
      <ImageModal show={showModal} src={modalSrc} onClose={() => { setShowModal(false); setModalSrc(''); }} />
    </div>
  );
};

export default EdicionFT;
`;

fs.writeFileSync(targetPath, content, { encoding: 'utf8' });
console.log('Done! Wrote', content.length, 'chars to', targetPath);
