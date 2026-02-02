import React, { useState, useEffect } from 'react';
import {
  Home, FolderKanban, Clock, FileSpreadsheet, Users, Plus,
  ChevronRight, ChevronDown, ChevronLeft, TrendingUp, Calendar, Lock, Eye, EyeOff,
  Building2, User, DollarSign, FileText, Check, X, Pencil, Trash2, Settings,
  BarChart3, AlertTriangle, Printer, FileDown, UserPlus, Save, LogOut
} from 'lucide-react';

// ============================================
// SISTEMA DE USUARIOS Y ROLES
// ============================================
const USUARIOS = [
  { id: 'admin', nombre: 'Seba', email: 'sebastianvizcarra@gmail.com', password: 'admin123', rol: 'admin', colaboradorId: null },
  { id: 'user1', nombre: 'Cristóbal Ríos', email: 'cristobal@matriz.cl', password: 'crios123', rol: 'colaborador', colaboradorId: 1 },
  { id: 'user2', nombre: 'Dominique Thompson', email: 'dominique@matriz.cl', password: 'dthompson123', rol: 'colaborador', colaboradorId: 2 },
];

// Estilos de impresión
const PrintStyles = () => (
  <style>{`
    @media print {
      /* Ocultar todo excepto contenido de impresión */
      body * {
        visibility: hidden;
      }
      
      /* Mostrar solo el contenido del PDF */
      .print-content,
      .print-content * {
        visibility: visible;
      }
      
      /* Posicionar el contenido para impresión */
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
      }
      
      /* Ocultar elementos no imprimibles */
      .no-print {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Página 1 - salto de página después */
      .print-page-1 {
        page-break-after: always;
        padding: 10mm !important;
        margin: 0 !important;
        background: white !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      /* Página 2 - salto de página antes */
      .print-page-2 {
        page-break-before: always;
        padding: 10mm !important;
        margin: 0 !important;
        background: white !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      /* Asegurar fondos y colores se impriman */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Quitar fondos oscuros del modal */
      .fixed {
        position: static !important;
        background: transparent !important;
      }
      
      /* Tablas */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      
      th, td {
        border: 1px solid #ccc !important;
      }
      
      /* Tamaño de página carta */
      @page {
        size: letter portrait;
        margin: 10mm;
      }
    }
  `}</style>
);

// ============================================
// DATOS BASE
// ============================================

const COLABORADORES_INICIAL = [
  { id: 1, nombre: 'Cristóbal Ríos', cargo: 'Arquitecto', categoria: 'Ingeniero Senior', tarifaInterna: 0.75, iniciales: 'CR' },
  { id: 2, nombre: 'Dominique Thompson', cargo: 'Arquitecta', categoria: 'Proyectista', tarifaInterna: 0.5, iniciales: 'DT' },
];

// Entregables del proyecto (35 documentos)
const ENTREGABLES_PROYECTO = [
  { id: 1, name: "CRITERIOS DE DISEÑO", weekStart: 2 },
  { id: 2, name: "PLANTA DISPOSICIÓN GENERAL", weekStart: 2 },
  { id: 3, name: "PLANTA DEMOLICIÓN 1 DE 2", weekStart: 3 },
  { id: 4, name: "PLANTA DEMOLICIÓN 2 DE 2", weekStart: 3 },
  { id: 5, name: "EETT DEMOLICIONES", weekStart: 4 },
  { id: 6, name: "PLANTA TERMINACIONES 1", weekStart: 5 },
  { id: 7, name: "PLANTA TERMINACIONES 2", weekStart: 5 },
  { id: 8, name: "PLANTA PAVIMENTOS 1", weekStart: 5 },
  { id: 9, name: "PLANTA PAVIMENTOS 2", weekStart: 6 },
  { id: 10, name: "TABIQUES VIDRIADOS 1", weekStart: 6 },
  { id: 11, name: "TABIQUES VIDRIADOS 2", weekStart: 6 },
  { id: 12, name: "TABIQUES VIDRIADOS 3", weekStart: 7 },
  { id: 13, name: "TABIQUES VIDRIADOS 4", weekStart: 7 },
  { id: 14, name: "CIELOS E ILUMINACIÓN 1", weekStart: 7 },
  { id: 15, name: "CIELOS E ILUMINACIÓN 2", weekStart: 8 },
  { id: 16, name: "DETALLES TABIQUES TIPO", weekStart: 8 },
  { id: 17, name: "DETALLES REVESTIMIENTOS 1", weekStart: 8 },
  { id: 18, name: "DETALLES REVESTIMIENTOS 2", weekStart: 9 },
  { id: 19, name: "DETALLES PAVIMENTOS", weekStart: 9 },
  { id: 20, name: "PUERTAS Y QUINCALLERÍA", weekStart: 9 },
  { id: 21, name: "DETALLES COCINA", weekStart: 10 },
  { id: 22, name: "DETALLES CAFETERÍA", weekStart: 10 },
  { id: 23, name: "DETALLES SALA CONTROL", weekStart: 10 },
  { id: 24, name: "ACCESIBILIDAD Y RAMPA", weekStart: 11 },
  { id: 25, name: "PLANTA SEÑALÉTICA", weekStart: 11 },
  { id: 26, name: "DETALLES SEÑALÉTICA", weekStart: 11 },
  { id: 27, name: "EETT GENERALES", weekStart: 12 },
  { id: 28, name: "MTO (MATERIALES)", weekStart: 13 },
  { id: 29, name: "MOBILIARIO 1", weekStart: 14 },
  { id: 30, name: "MOBILIARIO 2", weekStart: 14 },
  { id: 31, name: "ELEVACIÓN INT. NORTE/SUR", weekStart: 15 },
  { id: 32, name: "ELEVACIÓN INT. ORIE/PON", weekStart: 15 },
  { id: 33, name: "SECCIÓN A-A / B-B", weekStart: 16 },
  { id: 34, name: "SECCIÓN C-C / D-D", weekStart: 16 },
  { id: 35, name: "IMÁGENES OBJETIVO", weekStart: 17 },
];

const PROYECTOS_INICIALES = [
  { 
    id: 'P2600', 
    nombre: 'Spence SGO - Obras Tempranas',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-01-06',
    avance: 8.6,
    tarifaVenta: 1.2, // UF/Hr para EDP
  },
  { 
    id: 'P2601', 
    nombre: 'Escondida MEL - Fase 2',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-02-01',
    avance: 0,
    tarifaVenta: 1.1,
  },
];

// Obtener semanas del mes actual
const getWeeksOfMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const weeks = [];
  let weekStart = new Date(firstDay);
  // Ajustar al lunes
  const dayOfWeek = weekStart.getDay();
  if (dayOfWeek !== 1) {
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  }
  
  let weekNum = 1;
  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Viernes
    weeks.push({
      num: weekNum,
      start: new Date(weekStart),
      end: weekEnd,
      label: `Semana ${weekNum} (${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1})`
    });
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }
  return weeks;
};

// ============================================
// COMPONENTES UI
// ============================================

const Card = ({ children, className = '', onClick }) => (
  <div 
    className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${onClick ? 'cursor-pointer hover:border-orange-400 hover:shadow-md active:bg-neutral-50 active:scale-[0.98] transition-all touch-manipulation select-none' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-700',
    ghost: 'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-600',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  };
  const sizes = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`rounded font-medium transition-colors inline-flex items-center justify-center touch-manipulation ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-neutral-600 font-medium">{label}</label>}
    <input 
      className="w-full bg-white border border-neutral-300 rounded px-3 py-2.5 sm:py-2 text-neutral-800 text-base sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      {...props}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-neutral-600 font-medium">{label}</label>}
    <select 
      className="w-full bg-white border border-neutral-300 rounded px-3 py-2.5 sm:py-2 text-neutral-800 text-base sm:text-sm focus:outline-none focus:border-orange-500 appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '36px' }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Componentes del Dashboard
const DashboardCheckbox = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!checked); }}
    disabled={disabled}
    className={`w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 hover:border-orange-400 active:border-orange-500'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {checked && <Check className="w-4 h-4 sm:w-3 sm:h-3 text-white" />}
  </button>
);

const DashboardBadge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-600',
    success: 'bg-green-100 text-green-700 border border-green-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-orange-100 text-orange-700 border border-orange-200',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-500">{label}</span>
        <span className="text-neutral-800">{value} / {total} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const Accordion = ({ title, count, color, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${color}`} />
          <span className="text-neutral-800 text-sm">{title}</span>
          <span className="text-neutral-500 text-xs">({count})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3 bg-white text-sm">{children}</div>}
    </div>
  );
};

// Funciones helper para el dashboard
const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateShort = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
};

const formatDateFull = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const calculateDeadlines = (projectStart, weekStart) => {
  const start = new Date(projectStart);
  const deadlineRevA = addWeeks(start, weekStart);
  const deadlineRevB = addWeeks(deadlineRevA, 2);
  const deadlineRev0 = addWeeks(deadlineRevB, 3);
  return { deadlineRevA, deadlineRevB, deadlineRev0 };
};

const calculateStatus = (status, deadlines) => {
  const today = new Date();
  if (status.sentRev0) return { status: 'TERMINADO', color: 'bg-green-500' };
  if (status.sentRevB || status.sentRevA || status.sentIniciado) {
    const nextDeadline = !status.sentRevA ? deadlines.deadlineRevA : 
                       !status.sentRevB ? deadlines.deadlineRevB : deadlines.deadlineRev0;
    if (today > nextDeadline) return { status: 'ATRASADO', color: 'bg-red-500' };
    return { status: 'En Proceso', color: 'bg-orange-500' };
  }
  if (today > deadlines.deadlineRevA) return { status: 'ATRASADO', color: 'bg-red-500' };
  return { status: 'Pendiente', color: 'bg-neutral-500' };
};

const getDocumentSuffix = (status) => {
  if (status.sentRev0 || status.comentariosBRecibidos) return "_0";
  if (status.comentariosARecibidos) return "_B";
  if (status.sentIniciado || status.sentRevA) return "_A";
  return "";
};

// Logo MATRIZ
const MatrizLogo = ({ size = 'md' }) => {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' };
  return (
    <div className={`font-light tracking-widest ${sizes[size]}`}>
      <span className="text-neutral-800">M</span>
      <span className="text-orange-500">A</span>
      <span className="text-neutral-800">TRIZ</span>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL - INTRANET
// ============================================

export default function MatrizIntranet() {
  // ============================================
  // ESTADOS DE AUTENTICACIÓN
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Helpers de rol
  const isAdmin = currentUser?.rol === 'admin';
  const canEdit = () => currentUser?.rol === 'admin';

  // Login handlers
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Ingresa email y contraseña');
      setTimeout(() => setLoginError(''), 3000);
      return;
    }
    const user = USUARIOS.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      if (user.rol === 'admin') setEdpUnlocked(true);
    } else {
      setLoginError('Email o contraseña incorrectos');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    setEdpUnlocked(false);
  };

  // ============================================
  // ESTADOS DE LA APP (con persistencia localStorage)
  // ============================================
  const [currentPage, setCurrentPage] = useState('home');
  const [proyectos, setProyectos] = useState(() => {
    const saved = localStorage.getItem('matriz_proyectos');
    return saved ? JSON.parse(saved) : PROYECTOS_INICIALES;
  });
  const [colaboradores, setColaboradores] = useState(() => {
    const saved = localStorage.getItem('matriz_colaboradores');
    return saved ? JSON.parse(saved) : COLABORADORES_INICIAL;
  });
  const [horasRegistradas, setHorasRegistradas] = useState(() => {
    const saved = localStorage.getItem('matriz_horas');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProject, setSelectedProject] = useState(null);

  // Estados para EDP
  const [edpUnlocked, setEdpUnlocked] = useState(false);
  const [edpPassword, setEdpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentEdpPassword, setCurrentEdpPassword] = useState(''); // Para verificar antes de cambiar
  const [newEdpPassword, setNewEdpPassword] = useState('');
  const [edpStoredPassword, setEdpStoredPassword] = useState('matriz2026'); // Contraseña guardada
  
  // Estados para formularios
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ id: '', nombre: '', cliente: '', tarifaVenta: 1.2 });
  
  // Estados para eliminar proyectos
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Estados para editar proyectos
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ id: '', nombre: '', cliente: '', estado: '' });
  
  // Estados para configuración
  const [configTab, setConfigTab] = useState('colaboradores');
  const [showNewColaborador, setShowNewColaborador] = useState(false);
  const [newColaborador, setNewColaborador] = useState({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5 });
  const [editColaboradorOpen, setEditColaboradorOpen] = useState(false);
  const [colaboradorToEdit, setColaboradorToEdit] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Función para mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Estados para Dashboard del proyecto
  const [dashboardTab, setDashboardTab] = useState('resumen');
  const [dashboardStartDate, setDashboardStartDate] = useState('2026-01-05');
  const [statusData, setStatusData] = useState(() => {
    const saved = localStorage.getItem('matriz_statusData');
    if (saved) return JSON.parse(saved);
    // Datos iniciales de ejemplo
    const status = {};
    ENTREGABLES_PROYECTO.forEach(d => {
      status[d.id] = {
        sentIniciado: d.id <= 4,
        sentRevA: d.id <= 3,
        sentRevADate: d.id <= 3 ? '2026-01-20' : null,
        comentariosARecibidos: d.id <= 2,
        comentariosARecibidosDate: d.id <= 2 ? '2026-01-22' : null,
        sentRevB: d.id <= 2,
        sentRevBDate: d.id <= 2 ? '2026-01-25' : null,
        comentariosBRecibidos: d.id === 1,
        comentariosBRecibidosDate: d.id === 1 ? '2026-01-26' : null,
        sentRev0: false,
        sentRev0Date: null,
      };
    });
    return status;
  });
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // ============================================
  // PERSISTENCIA - Guardar datos en localStorage
  // ============================================
  useEffect(() => {
    localStorage.setItem('matriz_proyectos', JSON.stringify(proyectos));
  }, [proyectos]);

  useEffect(() => {
    localStorage.setItem('matriz_colaboradores', JSON.stringify(colaboradores));
  }, [colaboradores]);

  useEffect(() => {
    localStorage.setItem('matriz_horas', JSON.stringify(horasRegistradas));
  }, [horasRegistradas]);

  useEffect(() => {
    localStorage.setItem('matriz_statusData', JSON.stringify(statusData));
  }, [statusData]);

  // Función para manejar checkboxes del dashboard
  const handleCheck = (id, field, value) => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    setStatusData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        ...((field.startsWith('sent') || field.startsWith('comentarios')) 
          ? { [`${field}Date`]: value ? localDate : null }
          : {})
      }
    }));
  };
  
  // Actualizar fecha de inicio cuando se selecciona un proyecto
  React.useEffect(() => {
    if (selectedProject) {
      const proyecto = proyectos.find(p => p.id === selectedProject);
      if (proyecto) {
        setDashboardStartDate(proyecto.inicio || '2026-01-05');
        setDashboardTab('resumen');
      }
    }
  }, [selectedProject]);

  // Función para eliminar proyecto
  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProyectos(prev => prev.filter(p => p.id !== projectToDelete.id));
      // Si el proyecto eliminado era el seleccionado, deseleccionar
      if (selectedProject === projectToDelete.id) {
        setSelectedProject(null);
      }
      // También eliminar horas registradas de ese proyecto
      setHorasRegistradas(prev => prev.filter(h => h.proyecto !== projectToDelete.id));
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  // Función para abrir modal de edición
  const openEditProject = (proyecto) => {
    setProjectToEdit(proyecto);
    setEditProjectData({
      id: proyecto.id,
      nombre: proyecto.nombre,
      cliente: proyecto.cliente,
      estado: proyecto.estado
    });
    setEditProjectOpen(true);
  };

  // Función para guardar cambios del proyecto
  const handleSaveProject = () => {
    if (projectToEdit && editProjectData.nombre.trim() && editProjectData.id.trim()) {
      const oldId = projectToEdit.id;
      const newId = editProjectData.id.trim().toUpperCase();
      
      // Actualizar proyecto
      setProyectos(prev => prev.map(p => 
        p.id === oldId 
          ? { ...p, id: newId, nombre: editProjectData.nombre.trim(), cliente: editProjectData.cliente.trim(), estado: editProjectData.estado }
          : p
      ));
      
      // Si cambió el id, actualizar referencias en horas registradas
      if (oldId !== newId) {
        setHorasRegistradas(prev => prev.map(h => 
          h.proyecto === oldId ? { ...h, proyecto: newId } : h
        ));
        
        // Si era el proyecto seleccionado, actualizar selección
        if (selectedProject === oldId) {
          setSelectedProject(newId);
        }
      }
      
      setEditProjectOpen(false);
      setProjectToEdit(null);
    }
  };

  // Categorías de colaboradores
  const categoriasColaborador = ['Ingeniero Senior', 'Proyectista', 'Dibujante', 'Administrativo'];
  
  // Función para obtener iniciales
  const getIniciales = (nombre) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Funciones para gestión de colaboradores
  const handleAddColaborador = () => {
    if (newColaborador.nombre.trim() && newColaborador.cargo.trim()) {
      const newId = Math.max(...colaboradores.map(c => c.id), 0) + 1;
      setColaboradores(prev => [...prev, {
        id: newId,
        nombre: newColaborador.nombre.trim(),
        cargo: newColaborador.cargo.trim(),
        categoria: newColaborador.categoria,
        tarifaInterna: parseFloat(newColaborador.tarifaInterna) || 0.5,
        iniciales: getIniciales(newColaborador.nombre.trim())
      }]);
      setNewColaborador({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5 });
      setShowNewColaborador(false);
      showNotification('success', 'Colaborador agregado');
    }
  };
  
  const handleDeleteColaborador = (id) => {
    const tieneHoras = horasRegistradas.some(h => h.colaboradorId === id);
    if (tieneHoras) {
      showNotification('error', 'No se puede eliminar: este colaborador tiene horas registradas.');
      return;
    }
    setColaboradores(prev => prev.filter(c => c.id !== id));
    showNotification('success', 'Colaborador eliminado');
  };
  
  const handleSaveColaborador = () => {
    if (colaboradorToEdit) {
      setColaboradores(prev => prev.map(c => 
        c.id === colaboradorToEdit.id 
          ? { 
              ...c, 
              nombre: colaboradorToEdit.nombre,
              cargo: colaboradorToEdit.cargo,
              categoria: colaboradorToEdit.categoria,
              tarifaInterna: parseFloat(colaboradorToEdit.tarifaInterna) || 0.5,
              iniciales: getIniciales(colaboradorToEdit.nombre)
            }
          : c
      ));
      setEditColaboradorOpen(false);
      setColaboradorToEdit(null);
      showNotification('success', 'Colaborador actualizado');
    }
  };

  // Navegación (filtrada según rol)
  const allNavItems = [
    { id: 'home', label: 'Home', icon: Home, adminOnly: false },
    { id: 'proyectos', label: 'Proyectos', icon: FolderKanban, adminOnly: false },
    { id: 'horas', label: 'Carga de Horas', icon: Clock, adminOnly: false },
    { id: 'edp', label: 'EDP', icon: FileSpreadsheet, locked: true, adminOnly: true },
    { id: 'config', label: 'Config', icon: Settings, adminOnly: true },
  ];
  const navItems = isAdmin ? allNavItems : allNavItems.filter(item => !item.adminOnly);

  // Calcular resumen de horas del mes
  const resumenHorasMes = () => {
    const now = new Date();
    const horasMes = horasRegistradas.filter(h => {
      const fecha = new Date(h.fecha);
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    });
    
    const totalHoras = horasMes.reduce((sum, h) => sum + h.horas, 0);
    const costoInterno = horasMes.reduce((sum, h) => {
      const colaborador = colaboradores.find(c => c.id === h.colaboradorId);
      return sum + (h.horas * (colaborador?.tarifaInterna || 0));
    }, 0);
    
    return { totalHoras, costoInterno, registros: horasMes.length };
  };

  const resumen = resumenHorasMes();

  // ============================================
  // PÁGINA: HOME
  // ============================================
  const HomePage = () => (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl text-neutral-800 font-light mb-1">Bienvenido, {currentUser?.nombre}</h1>
        <p className="text-neutral-500 text-sm">{isAdmin ? 'Administrador • Acceso completo' : 'Colaborador • Carga de horas'}</p>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">{proyectos.filter(p => p.estado === 'Activo').length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500">Proyectos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">{colaboradores.length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500">Colaboradores</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">{resumen.totalHoras}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500">Horas mes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Proyectos Activos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-neutral-800 text-sm font-medium">Proyectos Activos</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('proyectos')}>
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {proyectos.filter(p => p.estado === 'Activo').map(proyecto => (
            <Card 
              key={proyecto.id} 
              className="p-3 sm:p-4"
              onClick={() => {
                setSelectedProject(proyecto.id);
                setCurrentPage('proyecto-detail');
              }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-mono text-xs sm:text-sm">{proyecto.id}</span>
                    <Badge variant="success">Activo</Badge>
                  </div>
                  <h3 className="text-neutral-800 font-medium mt-1 text-sm sm:text-base truncate">{proyecto.nombre}</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">{proyecto.cliente}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0 ml-2" />
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(proyecto.inicio).toLocaleDateString('es-CL')}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {proyecto.avance.toFixed(1)}%
                </span>
              </div>
              
              {/* Barra de avance */}
              <div className="mt-2 sm:mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${proyecto.avance}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-neutral-700 text-sm font-medium mb-3">Accesos Rápidos</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card 
            className="p-3 sm:p-4 text-center"
            onClick={() => setCurrentPage('horas')}
          >
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-neutral-800 text-xs sm:text-sm">Cargar Horas</p>
          </Card>
          
          <Card 
            className="p-3 sm:p-4 text-center"
            onClick={() => setShowNewProject(true)}
          >
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-neutral-800 text-xs sm:text-sm">Nuevo Proyecto</p>
          </Card>
          
          <Card 
            className="p-3 sm:p-4 text-center"
            onClick={() => setCurrentPage('edp')}
          >
            <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-neutral-800 text-xs sm:text-sm">Generar EDP</p>
          </Card>
        </div>
      </div>
    </div>
  );

  // ============================================
  // PÁGINA: PROYECTOS
  // ============================================
  const ProyectosPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-neutral-800 font-light">Proyectos</h1>
          <p className="text-neutral-500 text-sm">Gestión de proyectos activos e históricos</p>
        </div>
        <Button onClick={() => setShowNewProject(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="space-y-3">
        {proyectos.map(proyecto => (
          <Card 
            key={proyecto.id} 
            className="p-4"
            onClick={() => {
              setSelectedProject(proyecto.id);
              setCurrentPage('proyecto-detail');
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-mono">{proyecto.id}</span>
                    <Badge variant={proyecto.estado === 'Activo' ? 'success' : 'default'}>
                      {proyecto.estado}
                    </Badge>
                  </div>
                  <h3 className="text-neutral-800 font-medium">{proyecto.nombre}</h3>
                  <p className="text-neutral-500 text-xs">{proyecto.cliente}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-neutral-800 font-medium">{proyecto.avance.toFixed(1)}%</p>
                  <p className="text-neutral-500 text-xs">Avance</p>
                </div>
                <div className="w-24 sm:w-32 h-2 bg-neutral-100 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${proyecto.avance}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditProject(proyecto);
                  }}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                  title="Editar proyecto"
                >
                  <Pencil className="w-4 h-4 text-neutral-400 group-hover:text-blue-500" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete(proyecto);
                    setDeleteConfirmOpen(true);
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-500" />
                </button>
                <ChevronRight className="w-5 h-5 text-neutral-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============================================
  // PÁGINA: CARGA DE HORAS
  // ============================================
  const HorasPage = () => {
    const [colaborador, setColaborador] = useState('');
    const [proyecto, setProyecto] = useState('');
    const [semana, setSemana] = useState('');
    const [entregable, setEntregable] = useState('');
    const [horas, setHoras] = useState('');
    const [revision, setRevision] = useState('REV_A');
    
    const weeks = getWeeksOfMonth();
    
    // Entregables de ejemplo (en producción vendrían del proyecto)
    const entregables = [
      'Planta General Nivel 0',
      'Planta General Nivel 1',
      'Cortes y Elevaciones',
      'Detalles Constructivos',
      'Cuadro de Superficies',
      'Memoria Descriptiva',
    ];
    
    const registrarHoras = () => {
      if (!colaborador || !proyecto || !semana || !entregable || !horas) {
        showNotification('error', 'Por favor completa todos los campos');
        return;
      }
      const nuevoRegistro = {
        id: Date.now(),
        colaboradorId: parseInt(colaborador),
        proyectoId: proyecto,
        semana: parseInt(semana),
        entregable,
        revision,
        horas: parseFloat(horas),
        fecha: new Date().toISOString(),
      };
      setHorasRegistradas(prev => [...prev, nuevoRegistro]);
      setHoras('');
      setEntregable('');
      setSemana('');
      showNotification('success', 'Horas registradas correctamente');
    };
    
    const horasDelMes = horasRegistradas.filter(h => {
      const fecha = new Date(h.fecha);
      const now = new Date();
      return fecha.getMonth() === now.getMonth();
    });
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl text-neutral-800 font-medium">Carga de Horas</h1>
          <p className="text-neutral-500 text-sm">Registro semanal por proyecto</p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Formulario */}
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-3 sm:p-4 lg:col-span-1">
            <h2 className="text-neutral-800 text-sm font-medium mb-3 sm:mb-4">Registrar Horas</h2>
            <div className="space-y-3 sm:space-y-4">
              <Select label="Colaborador" value={colaborador} onChange={e => setColaborador(e.target.value)}>
                <option value="">Seleccionar...</option>
                {colaboradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
              
              <Select label="Proyecto" value={proyecto} onChange={e => setProyecto(e.target.value)}>
                <option value="">Seleccionar...</option>
                {proyectos.filter(p => p.estado === 'Activo').map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                ))}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                <Select label="Semana" value={semana} onChange={e => setSemana(e.target.value)}>
                  <option value="">Sem...</option>
                  {weeks.map(w => (
                    <option key={w.num} value={w.num}>S{w.num}</option>
                  ))}
                </Select>
                
                <Select label="Revisión" value={revision} onChange={e => setRevision(e.target.value)}>
                  <option value="REV_A">REV_A</option>
                  <option value="REV_B">REV_B</option>
                  <option value="REV_0">REV_0</option>
                </Select>
              </div>
              
              <Select label="Entregable" value={entregable} onChange={e => setEntregable(e.target.value)}>
                <option value="">Seleccionar...</option>
                {entregables.map(ent => (
                  <option key={ent} value={ent}>{ent}</option>
                ))}
              </Select>
              
              <Input 
                label="Horas" 
                type="number" 
                step="0.5" 
                min="0" 
                value={horas}
                onChange={e => setHoras(e.target.value)}
                placeholder="Ej: 8"
              />
              
              <button 
                type="button"
                onClick={registrarHoras}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded font-medium text-sm transition-colors cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Plus className="w-4 h-4" />
                Registrar Horas
              </button>
            </div>
          </div>
          
          {/* Resumen del mes */}
          <Card className="p-3 sm:p-4 lg:col-span-2">
            <h2 className="text-neutral-800 text-sm font-medium mb-3 sm:mb-4">
              Horas - {new Date().toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
            </h2>
            
            {horasDelMes.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-neutral-500">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <p className="text-sm">No hay horas registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr className="text-neutral-500 text-xs uppercase border-b border-neutral-200">
                      <th className="text-left p-2">Col</th>
                      <th className="text-left p-2">Proy</th>
                      <th className="text-left p-2">Entregable</th>
                      <th className="text-center p-2">Rev</th>
                      <th className="text-center p-2">Sem</th>
                      <th className="text-right p-2">Hrs</th>
                      <th className="text-right p-2">UF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horasDelMes.map(h => {
                      const col = colaboradores.find(c => c.id === h.colaboradorId);
                      return (
                        <tr key={h.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="p-2 text-neutral-800">{col?.iniciales}</td>
                          <td className="p-2 text-orange-600 font-mono text-xs">{h.proyectoId}</td>
                          <td className="p-2 text-neutral-600 truncate max-w-[120px]">{h.entregable}</td>
                          <td className="p-2 text-center"><Badge>{h.revision}</Badge></td>
                          <td className="p-2 text-center text-neutral-500">S{h.semana}</td>
                          <td className="p-2 text-right text-neutral-800">{h.horas}</td>
                          <td className="p-2 text-right text-green-600">{(h.horas * (col?.tarifaInterna || 0)).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-neutral-300 font-medium bg-neutral-50">
                      <td colSpan={5} className="p-2 text-right text-neutral-500">Total:</td>
                      <td className="p-2 text-right text-neutral-800">{horasDelMes.reduce((s, h) => s + h.horas, 0)}</td>
                      <td className="p-2 text-right text-green-600">
                        {horasDelMes.reduce((s, h) => {
                          const col = colaboradores.find(c => c.id === h.colaboradorId);
                          return s + (h.horas * (col?.tarifaInterna || 0));
                        }, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
        
        {/* Resumen por colaborador */}
        <Card className="p-3 sm:p-4">
          <h2 className="text-neutral-800 text-sm font-medium mb-3 sm:mb-4">Resumen por Colaborador</h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {colaboradores.map(col => {
              const horasCol = horasDelMes.filter(h => h.colaboradorId === col.id);
              const totalHoras = horasCol.reduce((s, h) => s + h.horas, 0);
              const totalCosto = totalHoras * col.tarifaInterna;
              
              return (
                <div key={col.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-500 font-bold text-sm sm:text-base">{col.iniciales}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-800 font-medium text-sm truncate">{col.nombre}</p>
                    <p className="text-neutral-500 text-xs">{col.categoria}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-neutral-800 font-medium text-sm">{totalHoras} hrs</p>
                    <p className="text-green-600 text-xs">{totalCosto.toFixed(2)} UF</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================
  // PÁGINA: EDP (PROTEGIDA) - Solo contenido desbloqueado
  // ============================================
  const EDPPage = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showPreview, setShowPreview] = useState(false);
    
    // Calcular EDP para el mes seleccionado
    const calcularEDP = () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const horasMes = horasRegistradas.filter(h => {
        const fecha = new Date(h.fecha);
        return fecha.getMonth() === month - 1 && fecha.getFullYear() === year;
      });
      
      // Agrupar por proyecto
      const porProyecto = {};
      horasMes.forEach(h => {
        if (!porProyecto[h.proyectoId]) {
          porProyecto[h.proyectoId] = [];
        }
        porProyecto[h.proyectoId].push(h);
      });
      
      return porProyecto;
    };
    
    const edpData = calcularEDP();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-neutral-800 font-light">Estados de Pago (EDP)</h1>
            <p className="text-neutral-500 text-sm">Generación automática de estados de pago mensuales</p>
          </div>
          <Button variant="ghost" onClick={() => setEdpUnlocked(false)}>
            <Lock className="w-4 h-4 mr-2" />
            Bloquear
          </Button>
        </div>

        {/* Selector de mes */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Input 
              label="Mes a facturar"
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
            <Button onClick={() => setShowPreview(true)} className="mt-5">
              <Printer className="w-4 h-4 mr-2" />
              Generar EDP
            </Button>
          </div>
        </Card>

        {/* Configuración de tarifas */}
        <Card className="p-4">
          <h2 className="text-neutral-800 text-sm font-medium mb-4">Tarifas de Venta por Proyecto</h2>
          <div className="space-y-3">
            {proyectos.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 bg-neutral-100 rounded-lg">
                <span className="text-orange-500 font-mono">{p.id}</span>
                <span className="text-neutral-800 flex-1">{p.nombre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-sm">Tarifa venta:</span>
                  <input 
                    type="number"
                    step="0.1"
                    className="w-20 bg-white border border-neutral-300 rounded px-2 py-1 text-neutral-800 text-sm"
                    value={p.tarifaVenta}
                    onChange={e => {
                      setProyectos(proyectos.map(pr => 
                        pr.id === p.id ? { ...pr, tarifaVenta: parseFloat(e.target.value) || 0 } : pr
                      ));
                    }}
                  />
                  <span className="text-neutral-500 text-sm">UF/Hr</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resumen EDP */}
        <Card className="p-4">
          <h2 className="text-neutral-800 text-sm font-medium mb-4">
            Resumen EDP - {new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h2>
          
          {Object.keys(edpData).length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay horas registradas para este período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(edpData).map(([proyectoId, horas]) => {
                const proyecto = proyectos.find(p => p.id === proyectoId);
                const totalHoras = horas.reduce((s, h) => s + h.horas, 0);
                const montoVenta = totalHoras * (proyecto?.tarifaVenta || 0);
                const costoInterno = horas.reduce((s, h) => {
                  const col = colaboradores.find(c => c.id === h.colaboradorId);
                  return s + (h.horas * (col?.tarifaInterna || 0));
                }, 0);
                const margen = montoVenta - costoInterno;
                
                return (
                  <div key={proyectoId} className="p-4 bg-neutral-100 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-orange-500 font-mono">{proyectoId}</span>
                        <span className="text-neutral-800 ml-2">{proyecto?.nombre}</span>
                      </div>
                      <Badge variant={margen > 0 ? 'success' : 'danger'}>
                        Margen: {((margen / montoVenta) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Horas</p>
                        <p className="text-neutral-800 font-medium">{totalHoras}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Venta (UF)</p>
                        <p className="text-green-600 font-medium">{montoVenta.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Costo (UF)</p>
                        <p className="text-red-600 font-medium">{costoInterno.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Margen (UF)</p>
                        <p className={`font-medium ${margen > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {margen.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Detalle por entregable */}
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <p className="text-neutral-500 text-xs mb-2">Detalle:</p>
                      <div className="space-y-1">
                        {horas.map(h => {
                          const col = colaboradores.find(c => c.id === h.colaboradorId);
                          return (
                            <div key={h.id} className="flex justify-between text-xs">
                              <span className="text-neutral-600">
                                {h.entregable} {h.revision} ({col?.iniciales})
                              </span>
                              <span className="text-neutral-800">{h.horas} hrs • {(h.horas * (proyecto?.tarifaVenta || 0)).toFixed(2)} UF</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Total general */}
              <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-800 font-medium">TOTAL EDP</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">
                      {Object.entries(edpData).reduce((total, [proyectoId, horas]) => {
                        const proyecto = proyectos.find(p => p.id === proyectoId);
                        const totalHoras = horas.reduce((s, h) => s + h.horas, 0);
                        return total + (totalHoras * (proyecto?.tarifaVenta || 0));
                      }, 0).toFixed(2)} UF
                    </p>
                    <p className="text-neutral-500 text-sm">
                      {Object.values(edpData).flat().reduce((s, h) => s + h.horas, 0)} horas totales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };


  // ============================================
  // MODAL: NUEVO PROYECTO
  // ============================================
  const NewProjectModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-neutral-800 text-base sm:text-lg font-medium">Nuevo Proyecto</h2>
          <button 
            onClick={() => setShowNewProject(false)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <Input 
            label="Código de Proyecto"
            placeholder="Ej: P2602"
            value={newProject.id}
            onChange={e => setNewProject({ ...newProject, id: e.target.value.toUpperCase() })}
          />
          
          <Input 
            label="Nombre del Proyecto"
            placeholder="Ej: Escondida - Fase 3"
            value={newProject.nombre}
            onChange={e => setNewProject({ ...newProject, nombre: e.target.value })}
          />
          
          <Input 
            label="Cliente"
            placeholder="Ej: BHP Billiton"
            value={newProject.cliente}
            onChange={e => setNewProject({ ...newProject, cliente: e.target.value })}
          />
          
          <Input 
            label="Tarifa de Venta (UF/Hr)"
            type="number"
            step="0.1"
            value={newProject.tarifaVenta}
            onChange={e => setNewProject({ ...newProject, tarifaVenta: parseFloat(e.target.value) || 0 })}
          />
          
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button 
              onClick={() => setShowNewProject(false)}
              className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button 
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium text-sm transition-colors"
              onClick={() => {
                if (newProject.id && newProject.nombre) {
                  setProyectos([...proyectos, {
                    ...newProject,
                    estado: 'Activo',
                    inicio: new Date().toISOString().split('T')[0],
                    avance: 0,
                  }]);
                  setNewProject({ id: '', nombre: '', cliente: '', tarifaVenta: 1.2 });
                  setShowNewProject(false);
                }
              }}
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  // ============================================
  // PANTALLA DE LOGIN (si no está autenticado)
  // ============================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl font-light tracking-widest mb-2">
              <span className="text-neutral-800">M</span>
              <span className="text-orange-500">A</span>
              <span className="text-neutral-800">TRIZ</span>
            </div>
            <p className="text-neutral-400 text-xs tracking-wider">ARCHITECTURE FOR ENGINEERING</p>
            <h1 className="text-xl text-neutral-700 font-medium mt-4">Intranet</h1>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600 font-medium block mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-600 font-medium block mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-800 focus:outline-none focus:border-orange-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 text-center mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-neutral-600">
              <p><strong>Admin:</strong> sebastianvizcarra@gmail.com / admin123</p>
              <p><strong>Colaborador:</strong> cristobal@matriz.cl / crios123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL (usuario autenticado)
  // ============================================
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-3 sm:px-4 py-3 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MatrizLogo />
            <span className="text-neutral-400 text-xs hidden sm:block">INTRANET</span>
          </div>
          
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm transition-colors touch-manipulation ${
                  currentPage === item.id || (item.id === 'proyectos' && currentPage === 'proyecto-detail')
                    ? 'bg-orange-600 text-white active:bg-orange-700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.locked && <Lock className="w-3 h-3" />}
              </button>
            ))}
            {/* Botón de logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-red-600 hover:bg-red-50 ml-2 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'proyectos' && <ProyectosPage />}
        {currentPage === 'horas' && <HorasPage />}
        {currentPage === 'edp' && !edpUnlocked && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 sm:p-8 max-w-sm w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-neutral-800 text-lg font-medium">Acceso Restringido</h2>
                <p className="text-neutral-500 text-sm mt-1">Esta sección requiere autenticación</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-600 font-medium">Contraseña</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={edpPassword}
                      onChange={e => setEdpPassword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (edpPassword === edpStoredPassword) {
                            setEdpUnlocked(true);
                            setEdpPassword('');
                          } else {
                            showNotification('error', 'Contraseña incorrecta');
                          }
                        }
                      }}
                      placeholder="Ingresa la contraseña"
                      autoComplete="off"
                      className="w-full bg-white border border-neutral-300 rounded px-3 py-2.5 text-neutral-800 text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    if (edpPassword === edpStoredPassword) {
                      setEdpUnlocked(true);
                      setEdpPassword('');
                    } else {
                      showNotification('error', 'Contraseña incorrecta');
                    }
                  }}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded font-medium text-sm transition-colors"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'edp' && edpUnlocked && <EDPPage />}
        {currentPage === 'config' && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">Configuración</h1>
                <p className="text-neutral-500 text-sm">Administra colaboradores y ajustes del sistema</p>
              </div>
            </div>
            
            {/* Tabs de configuración */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200 overflow-x-auto">
              {[
                { id: 'colaboradores', label: 'Colaboradores', icon: Users },
                { id: 'seguridad', label: 'Seguridad', icon: Lock },
                { id: 'sistema', label: 'Sistema', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    configTab === tab.id 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab: Colaboradores */}
            {configTab === 'colaboradores' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-600 text-sm">
                    {colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''} registrado{colaboradores.length !== 1 ? 's' : ''}
                  </p>
                  <Button onClick={() => setShowNewColaborador(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                
                {/* Formulario nuevo colaborador */}
                {showNewColaborador && (
                  <Card className="p-4 border-2 border-orange-200 bg-orange-50/50">
                    <h3 className="font-medium text-neutral-800 mb-3">Nuevo Colaborador</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          value={newColaborador.nombre}
                          onChange={e => setNewColaborador(prev => ({ ...prev, nombre: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cargo</label>
                        <input
                          type="text"
                          placeholder="Ej: Arquitecto"
                          value={newColaborador.cargo}
                          onChange={e => setNewColaborador(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
                        <select
                          value={newColaborador.categoria}
                          onChange={e => setNewColaborador(prev => ({ ...prev, categoria: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                        >
                          {categoriasColaborador.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Tarifa Interna (UF/hr)</label>
                        <input
                          type="number"
                          step="0.05"
                          placeholder="0.5"
                          value={newColaborador.tarifaInterna}
                          onChange={e => setNewColaborador(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" onClick={() => setShowNewColaborador(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddColaborador} disabled={!newColaborador.nombre.trim() || !newColaborador.cargo.trim()}>
                        <Check className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </Card>
                )}
                
                {/* Lista de colaboradores */}
                <div className="space-y-2">
                  {colaboradores.map(col => (
                    <Card key={col.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium text-sm">{col.iniciales}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{col.nombre}</p>
                            <p className="text-sm text-neutral-500">{col.cargo} • {col.categoria}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-500 hidden sm:block">
                            {col.tarifaInterna} UF/hr
                          </span>
                          <button
                            onClick={() => {
                              setColaboradorToEdit({ ...col });
                              setEditColaboradorOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-neutral-400 hover:text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteColaborador(col.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tab: Seguridad */}
            {configTab === 'seguridad' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cambiar Contraseña EDP
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Para cambiar la contraseña del módulo EDP, ingresa tu contraseña actual.
                  </p>
                  <div className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña Actual</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentEdpPassword}
                        onChange={e => setCurrentEdpPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newEdpPassword}
                        onChange={e => setNewEdpPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (currentEdpPassword !== edpStoredPassword) {
                          showNotification('error', 'La contraseña actual es incorrecta');
                          return;
                        }
                        if (newEdpPassword.trim().length < 4) {
                          showNotification('error', 'La nueva contraseña debe tener al menos 4 caracteres');
                          return;
                        }
                        setEdpStoredPassword(newEdpPassword.trim());
                        showNotification('success', 'Contraseña actualizada correctamente');
                        setCurrentEdpPassword('');
                        setNewEdpPassword('');
                      }}
                      disabled={!currentEdpPassword.trim() || !newEdpPassword.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Contraseña
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Tab: Sistema */}
            {configTab === 'sistema' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 mb-3">Información del Sistema</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-500">Versión</span>
                      <span className="text-neutral-800 font-mono">MATRIZ v1.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-500">Proyectos</span>
                      <span className="text-neutral-800">{proyectos.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-500">Colaboradores</span>
                      <span className="text-neutral-800">{colaboradores.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-neutral-500">Horas Registradas</span>
                      <span className="text-neutral-800">{horasRegistradas.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500">Última actualización</span>
                      <span className="text-neutral-800">{new Date().toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 border-red-200 bg-red-50">
                  <h3 className="font-medium text-red-800 mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-red-600 mb-3">
                    Estas acciones son irreversibles. Procede con precaución.
                  </p>
                  <Button 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => setResetConfirmOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reiniciar Datos
                  </Button>
                </Card>
              </div>
            )}
            
            {/* Modal editar colaborador */}
            {editColaboradorOpen && colaboradorToEdit && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pencil className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-800">Editar Colaborador</h2>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={colaboradorToEdit.nombre}
                        onChange={e => setColaboradorToEdit(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={colaboradorToEdit.cargo}
                        onChange={e => setColaboradorToEdit(prev => ({ ...prev, cargo: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
                      <select
                        value={colaboradorToEdit.categoria}
                        onChange={e => setColaboradorToEdit(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {categoriasColaborador.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Tarifa Interna (UF/hr)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={colaboradorToEdit.tarifaInterna}
                        onChange={e => setColaboradorToEdit(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => {
                      setEditColaboradorOpen(false);
                      setColaboradorToEdit(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleSaveColaborador}>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Modal confirmar reinicio */}
            {resetConfirmOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-800">¿Reiniciar todos los datos?</h2>
                      <p className="text-sm text-neutral-500">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      Se eliminarán permanentemente:
                    </p>
                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                      <li>• Todos los proyectos ({proyectos.length})</li>
                      <li>• Todas las horas registradas ({horasRegistradas.length})</li>
                      <li>• Colaboradores se restablecerán a valores iniciales</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => setResetConfirmOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setProyectos([]);
                        setHorasRegistradas([]);
                        setColaboradores(COLABORADORES_INICIAL);
                        setResetConfirmOpen(false);
                        setCurrentPage('home');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sí, Reiniciar
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
        {currentPage === 'proyecto-detail' && (() => {
          const proyecto = proyectos.find(p => p.id === selectedProject);
          if (!proyecto) {
            return (
              <div className="text-center py-12">
                <p className="text-neutral-500">Proyecto no encontrado</p>
                <button onClick={() => setCurrentPage('home')} className="mt-4 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded">
                  ← Volver al inicio
                </button>
              </div>
            );
          }
          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-3">
                <button 
                  onClick={() => setCurrentPage('home')} 
                  className="flex items-center gap-1 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded text-sm text-neutral-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-orange-500 font-mono text-sm sm:text-lg font-semibold">{proyecto.id}</span>
                      <Badge variant="success">{proyecto.estado}</Badge>
                    </div>
                    <h1 className="text-sm sm:text-xl text-neutral-800 font-medium mt-1">{proyecto.nombre}</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">{proyecto.cliente}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setTempDate(dashboardStartDate); setEditDateOpen(true); }} 
                    className="flex items-center gap-1 px-2 py-2 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded text-xs text-neutral-600 transition-colors shrink-0"
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">Inicio:</span>
                    <span>{dashboardStartDate.split('-').reverse().join('/')}</span>
                    <Pencil className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-neutral-100 p-1 rounded-lg">
                <button
                  onClick={() => setDashboardTab('resumen')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'resumen' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Resumen</span>
                </button>
                <button
                  onClick={() => setDashboardTab('control')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'control' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Control</span>
                </button>
                <button
                  onClick={() => setDashboardTab('log')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'log' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Log</span>
                </button>
                <button
                  onClick={() => setDashboardTab('gantt')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'gantt' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Carta</span>
                </button>
              </div>
              
              {/* Contenido de tabs */}
              {(() => {
                // Calcular deliverables y stats
                const deliverables = ENTREGABLES_PROYECTO.map(d => {
                  const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart);
                  const status = statusData[d.id];
                  const statusInfo = calculateStatus(status, deadlines);
                  return { ...d, ...deadlines, status, statusInfo };
                });
                
                const stats = {
                  total: deliverables.length,
                  completed: deliverables.filter(d => d.statusInfo.status === 'TERMINADO').length,
                  inProgress: deliverables.filter(d => d.statusInfo.status === 'En Proceso').length,
                  delayed: deliverables.filter(d => d.statusInfo.status === 'ATRASADO').length,
                  pending: deliverables.filter(d => d.statusInfo.status === 'Pendiente').length,
                };

                return (
                  <>
                    {/* Tab: Resumen */}
                    {dashboardTab === 'resumen' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-neutral-800">{stats.total}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500">Total</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500">Listos</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-orange-500">{stats.inProgress}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500">Proceso</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.delayed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500">Atrasados</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 text-sm mb-1">Progreso General</h3>
                          <p className="text-neutral-500 text-xs mb-3">Estado de entregables</p>
                          <div className="space-y-2">
                            <ProgressBar label="Completados" value={stats.completed} total={stats.total} color="bg-green-500" />
                            <ProgressBar label="En Proceso" value={stats.inProgress} total={stats.total} color="bg-orange-500" />
                            <ProgressBar label="Atrasados" value={stats.delayed} total={stats.total} color="bg-red-500" />
                            <ProgressBar label="Pendientes" value={stats.pending} total={stats.total} color="bg-neutral-400" />
                          </div>
                        </Card>
                        
                        {/* Curva S */}
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 text-sm mb-1">Curva S - Avance del Proyecto</h3>
                          <p className="text-neutral-500 text-xs mb-3">Comparación avance proyectado vs real</p>
                          {(() => {
                            const weeksToShow = 20;
                            const chartWidth = 500;
                            const chartHeight = 200;
                            const padding = { top: 30, right: 80, bottom: 40, left: 50 };
                            
                            // Calcular avance proyectado (curva S típica)
                            const projectedData = [];
                            for (let w = 0; w <= weeksToShow; w++) {
                              // Curva S usando función sigmoide
                              const progress = 100 / (1 + Math.exp(-0.5 * (w - weeksToShow / 2)));
                              projectedData.push({ week: w, value: progress });
                            }
                            
                            // Calcular semana actual
                            const startDate = new Date(dashboardStartDate);
                            const today = new Date();
                            const diffTime = today - startDate;
                            const currentWeek = Math.max(0, Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)));
                            
                            // Calcular avance real basado en entregas completadas por semana
                            const realData = [];
                            let cumulativeReal = 0;
                            for (let w = 0; w <= Math.min(currentWeek, weeksToShow); w++) {
                              // Contar entregables completados hasta esta semana
                              const completedThisWeek = deliverables.filter(d => {
                                if (!d.status.sentRev0Date) return false;
                                const completedDate = new Date(d.status.sentRev0Date);
                                const weeksSinceStart = Math.floor((completedDate - startDate) / (7 * 24 * 60 * 60 * 1000));
                                return weeksSinceStart <= w;
                              }).length;
                              cumulativeReal = (completedThisWeek / stats.total) * 100;
                              realData.push({ week: w, value: cumulativeReal });
                            }
                            
                            // Escalas
                            const xScale = (w) => padding.left + (w / weeksToShow) * (chartWidth - padding.left - padding.right);
                            const yScale = (v) => chartHeight - padding.bottom - (v / 100) * (chartHeight - padding.top - padding.bottom);
                            
                            // Generar path para curva proyectada
                            const projectedPath = projectedData.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${xScale(p.week)} ${yScale(p.value)}`
                            ).join(' ');
                            
                            // Generar path para curva real
                            const realPath = realData.length > 0 ? realData.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${xScale(p.week)} ${yScale(p.value)}`
                            ).join(' ') : null;
                            
                            // Valores para mostrar
                            const projectedAtCurrentWeek = currentWeek <= weeksToShow 
                              ? projectedData.find(p => p.week === currentWeek)?.value || 0 
                              : 100;
                            const realFinal = realData.length > 0 ? realData[realData.length - 1].value : 0;
                            const difference = realFinal - projectedAtCurrentWeek;
                            
                            return (
                              <div>
                                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                                  {/* Grid horizontal */}
                                  {[0, 25, 50, 75, 100].map(v => (
                                    <g key={v}>
                                      <line x1={padding.left} y1={yScale(v)} x2={chartWidth - padding.right} y2={yScale(v)} stroke="#e5e7eb" strokeWidth="1" />
                                      <text x={padding.left - 10} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#6b7280">{v}%</text>
                                    </g>
                                  ))}
                                  
                                  {/* Etiquetas semanas */}
                                  {Array.from({ length: Math.floor(weeksToShow / 2) + 1 }, (_, i) => i * 2).filter(w => w <= weeksToShow).map(w => (
                                    <text key={w} x={xScale(w)} y={chartHeight - 18} textAnchor="middle" fontSize="10" fill="#6b7280">S{w}</text>
                                  ))}
                                  
                                  {/* Línea vertical HOY */}
                                  {currentWeek > 0 && currentWeek <= weeksToShow && (
                                    <>
                                      <line x1={xScale(currentWeek)} y1={padding.top} x2={xScale(currentWeek)} y2={chartHeight - padding.bottom} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
                                      <text x={xScale(currentWeek)} y={padding.top - 8} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">HOY</text>
                                    </>
                                  )}
                                  
                                  {/* Curva proyectada */}
                                  <path d={projectedPath} fill="none" stroke="#f97316" strokeWidth="3" />
                                  
                                  {/* Curva real */}
                                  {realPath && currentWeek > 0 && <path d={realPath} fill="none" stroke="#22c55e" strokeWidth="3" />}
                                  
                                  {/* Leyenda */}
                                  <g transform={`translate(${chartWidth - padding.right + 12}, ${padding.top + 15})`}>
                                    <line x1="0" y1="0" x2="18" y2="0" stroke="#f97316" strokeWidth="3" />
                                    <text x="24" y="4" fontSize="11" fill="#374151">Proyectado</text>
                                    <line x1="0" y1="22" x2="18" y2="22" stroke="#22c55e" strokeWidth="3" />
                                    <text x="24" y="26" fontSize="11" fill="#374151">Real</text>
                                  </g>
                                </svg>
                                
                                {/* Resumen numérico */}
                                <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-neutral-200">
                                  <div className="text-center">
                                    <div className="text-xs text-neutral-500 uppercase">Proyectado</div>
                                    <div className="text-xl font-bold text-orange-500">{projectedAtCurrentWeek.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-neutral-500 uppercase">Real</div>
                                    <div className="text-xl font-bold text-green-500">{realFinal.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-neutral-500 uppercase">Diferencia</div>
                                    <div className={`text-xl font-bold ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </Card>
                        
                        <div className="space-y-2">
                          <h3 className="text-neutral-800 text-sm">Detalle por Estado</h3>
                          <Accordion title="Completados" count={stats.completed} color="bg-green-500">
                            {deliverables.filter(d => d.statusInfo.status === 'TERMINADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 flex justify-between">
                                <span>{d.name}<span className="text-green-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-green-600 text-xs">✓ Completado</span>
                              </div>
                            ))}
                            {stats.completed === 0 && <p className="text-neutral-500">Ninguno</p>}
                          </Accordion>
                          <Accordion title="En Proceso" count={stats.inProgress} color="bg-orange-500">
                            {deliverables.filter(d => d.statusInfo.status === 'En Proceso').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 flex justify-between">
                                <span>{d.name}<span className="text-orange-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-orange-600 text-xs">En proceso</span>
                              </div>
                            ))}
                            {stats.inProgress === 0 && <p className="text-neutral-500">Ninguno</p>}
                          </Accordion>
                          <Accordion title="Atrasados" count={stats.delayed} color="bg-red-500">
                            {deliverables.filter(d => d.statusInfo.status === 'ATRASADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 flex justify-between">
                                <span>{d.name}<span className="text-red-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-red-600 text-xs">⚠ Atrasado</span>
                              </div>
                            ))}
                            {stats.delayed === 0 && <p className="text-neutral-500">Ninguno</p>}
                          </Accordion>
                        </div>
                      </div>
                    )}
                    
                    {/* Tab: Control de Avance */}
                    {dashboardTab === 'control' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200">
                          <h3 className="text-neutral-800 text-sm font-medium">Control de Avance</h3>
                          <p className="text-neutral-500 text-xs">Marca los checkboxes para actualizar estados</p>
                          <p className="text-orange-500 text-xs mt-1 sm:hidden">← Desliza para ver más →</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                            <thead>
                              <tr className="bg-neutral-100 text-neutral-500 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium min-w-[120px]">Entregable</th>
                                <th className="p-2 text-center font-medium">Sem</th>
                                <th className="p-2 text-center font-medium">Ini</th>
                                <th className="p-2 text-center font-medium">A</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Com</th>
                                <th className="p-2 text-center font-medium">B</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Com</th>
                                <th className="p-2 text-center font-medium">0</th>
                                <th className="p-2 text-center font-medium">Deadline</th>
                                <th className="p-2 text-center font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliverables.map((d, i) => (
                                <tr key={d.id} className={`border-b border-neutral-200 ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}>
                                  <td className="p-2 text-center text-neutral-500">{d.id}</td>
                                  <td className="p-2 text-neutral-800 font-medium text-xs">{d.name}</td>
                                  <td className="p-2 text-center text-neutral-500">S{d.weekStart}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.sentIniciado} onChange={v => handleCheck(d.id, 'sentIniciado', v)} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.sentRevA} onChange={v => handleCheck(d.id, 'sentRevA', v)} /></td>
                                  <td className="p-2 text-center text-neutral-500">{formatDateShort(d.deadlineRevA)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.comentariosARecibidos} onChange={v => handleCheck(d.id, 'comentariosARecibidos', v)} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.sentRevB} onChange={v => handleCheck(d.id, 'sentRevB', v)} /></td>
                                  <td className="p-2 text-center text-neutral-500">{formatDateShort(d.deadlineRevB)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.comentariosBRecibidos} onChange={v => handleCheck(d.id, 'comentariosBRecibidos', v)} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status.sentRev0} onChange={v => handleCheck(d.id, 'sentRev0', v)} /></td>
                                  <td className="p-2 text-center text-neutral-500">{formatDateShort(d.deadlineRev0)}</td>
                                  <td className="p-2 text-center">
                                    <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                      {d.statusInfo.status}
                                    </DashboardBadge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                    
                    {/* Tab: Log de Avance */}
                    {dashboardTab === 'log' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-neutral-800 text-sm font-medium">Log de Avance</h3>
                            <p className="text-neutral-500 text-xs">Fechas de envío por revisión</p>
                          </div>
                          <button 
                            onClick={() => setPdfPreviewOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded text-xs font-medium transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                            <span>Exportar PDF</span>
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-neutral-100 text-neutral-500 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium">Entregable</th>
                                <th className="p-2 text-center font-medium">REV_A</th>
                                <th className="p-2 text-center font-medium">REV_B</th>
                                <th className="p-2 text-center font-medium">REV_0</th>
                                <th className="p-2 text-center font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliverables.map((d, i) => (
                                <tr key={d.id} className={`border-b border-neutral-200 ${i % 2 === 0 ? 'bg-neutral-50' : ''}`}>
                                  <td className="p-2 text-center text-neutral-500">{d.id}</td>
                                  <td className="p-2 text-neutral-800">{d.name}</td>
                                  <td className={`p-2 text-center ${d.status.sentRevADate ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {d.status.sentRevADate ? formatDateFull(d.status.sentRevADate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.status.sentRevBDate ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {d.status.sentRevBDate ? formatDateFull(d.status.sentRevBDate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.status.sentRev0Date ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {d.status.sentRev0Date ? formatDateFull(d.status.sentRev0Date) : '-'}
                                  </td>
                                  <td className="p-2 text-center">
                                    <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                      {d.statusInfo.status}
                                    </DashboardBadge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                    
                    {/* Tab: Gantt */}
                    {dashboardTab === 'gantt' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200">
                          <h3 className="text-neutral-800 text-sm font-medium">Carta Gantt</h3>
                          <p className="text-neutral-500 text-xs">Visualización temporal del proyecto</p>
                          <p className="text-orange-500 text-xs mt-1 sm:hidden">← Desliza para ver más →</p>
                        </div>
                        <div className="overflow-x-auto p-3">
                          <div style={{ minWidth: '800px' }}>
                            {(() => {
                              const startDate = new Date(dashboardStartDate);
                              const weeksToShow = 24;
                              const weekWidth = 30;
                              const rowHeight = 28;
                              const labelWidth = 150;
                              
                              const weeks = Array.from({ length: weeksToShow }, (_, i) => {
                                const weekDate = addWeeks(startDate, i);
                                return { num: i + 1, date: weekDate };
                              });
                              
                              // Función para determinar el estado visual de cada entregable
                              const getGanttBars = (d) => {
                                const bars = [];
                                const revAWeek = d.weekStart;
                                const revBWeek = revAWeek + 2;
                                const rev0Week = revBWeek + 3;
                                
                                // Si está TERMINADO (sentRev0 = true), mostrar barra verde completa
                                if (d.status.sentRev0) {
                                  bars.push({
                                    start: revAWeek,
                                    width: rev0Week - revAWeek + 1,
                                    color: 'bg-green-500',
                                    label: 'TERMINADO'
                                  });
                                  return bars;
                                }
                                
                                // REV_A: desde weekStart hasta deadline REV_A (2 semanas)
                                if (d.status.sentIniciado || d.status.sentRevA) {
                                  bars.push({
                                    start: revAWeek,
                                    width: 2,
                                    color: d.status.sentRevA ? 'bg-green-500' : 'bg-orange-400',
                                    label: d.status.sentRevA ? 'REV_A ✓' : 'REV_A en proceso'
                                  });
                                }
                                
                                // REV_B: solo si ya se envió REV_A Y se recibieron comentarios A
                                if (d.status.comentariosARecibidos) {
                                  bars.push({
                                    start: revBWeek,
                                    width: 3,
                                    color: d.status.sentRevB ? 'bg-green-500' : 'bg-blue-400',
                                    label: d.status.sentRevB ? 'REV_B ✓' : 'REV_B en proceso'
                                  });
                                }
                                
                                // REV_0: solo si ya se envió REV_B Y se recibieron comentarios B
                                if (d.status.comentariosBRecibidos) {
                                  bars.push({
                                    start: rev0Week,
                                    width: 2,
                                    color: 'bg-purple-400',
                                    label: 'REV_0 en proceso'
                                  });
                                }
                                
                                return bars;
                              };
                              
                              return (
                                <div>
                                  {/* Header de semanas */}
                                  <div className="flex border-b border-neutral-200 bg-neutral-50">
                                    <div style={{ width: labelWidth, minWidth: labelWidth }} className="p-2 text-xs font-medium text-neutral-600">Entregable</div>
                                    <div className="flex">
                                      {weeks.map(w => (
                                        <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className="p-1 text-center text-[10px] text-neutral-500 border-l border-neutral-200">
                                          S{w.num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Filas de entregables */}
                                  {deliverables.map((d, i) => {
                                    const bars = getGanttBars(d);
                                    
                                    return (
                                      <div key={d.id} className={`flex border-b border-neutral-100 ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}>
                                        <div style={{ width: labelWidth, minWidth: labelWidth }} className="p-2 text-[10px] text-neutral-700 truncate flex items-center gap-1">
                                          <div className={`w-2 h-2 rounded-full ${d.statusInfo.color}`} />
                                          {d.name}
                                        </div>
                                        <div className="flex relative" style={{ height: rowHeight }}>
                                          {/* Grid de semanas */}
                                          {weeks.map(w => (
                                            <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className="border-l border-neutral-100" />
                                          ))}
                                          
                                          {/* Barras de progreso */}
                                          {bars.map((bar, idx) => (
                                            bar.start <= weeksToShow && (
                                              <div 
                                                key={idx}
                                                className={`absolute h-4 rounded-sm ${bar.color} flex items-center justify-center`}
                                                style={{ 
                                                  left: (bar.start - 1) * weekWidth, 
                                                  width: Math.min(bar.width, weeksToShow - bar.start + 1) * weekWidth - 4,
                                                  top: (rowHeight - 16) / 2
                                                }}
                                                title={bar.label}
                                              >
                                                {bar.width >= 2 && (
                                                  <span className="text-[8px] text-white font-medium truncate px-1">
                                                    {bar.color === 'bg-green-500' ? '✓' : ''}
                                                  </span>
                                                )}
                                              </div>
                                            )
                                          ))}
                                          
                                          {/* Si no tiene ninguna barra, mostrar indicador de pendiente */}
                                          {bars.length === 0 && (
                                            <div 
                                              className="absolute h-4 rounded-sm bg-neutral-200 flex items-center"
                                              style={{ 
                                                left: (d.weekStart - 1) * weekWidth, 
                                                width: weekWidth * 2 - 4,
                                                top: (rowHeight - 16) / 2
                                              }}
                                              title="Pendiente"
                                            >
                                              <span className="text-[8px] text-neutral-500 px-1">Pendiente</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Leyenda */}
                                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-neutral-200">
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-neutral-200 rounded-sm" />
                                      <span className="text-xs text-neutral-600">Pendiente</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-orange-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600">REV_A en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-blue-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600">REV_B en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-purple-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600">REV_0 en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-green-500 rounded-sm" />
                                      <span className="text-xs text-neutral-600">Completado</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })()}
      </main>

      {/* Modal Nuevo Proyecto */}
      {showNewProject && <NewProjectModal />}

      {/* Modal Editar Fecha de Inicio */}
      {editDateOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-800 text-lg font-medium">Editar Fecha de Inicio</h2>
              <button onClick={() => setEditDateOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <Input 
              label="Fecha de Inicio del Proyecto"
              type="date"
              value={tempDate}
              onChange={e => setTempDate(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setEditDateOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => {
                setDashboardStartDate(tempDate);
                setEditDateOpen(false);
              }}>
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Preview PDF */}
      {pdfPreviewOpen && (
        <>
          <PrintStyles />
          <div className="fixed inset-0 bg-black/80 z-50 overflow-auto p-4">
            <div className="min-h-full flex flex-col items-center py-4">
              {/* Header del modal - sticky - NO IMPRIMIR */}
              <div className="no-print bg-white w-full max-w-2xl rounded-t-lg border-b border-neutral-200 p-2 flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-neutral-800 text-sm font-medium">Vista Previa PDF (2 páginas)</h2>
                <div className="flex gap-2">
                  <Button onClick={() => window.print()}>
                    <FileDown className="w-4 h-4 mr-1" />
                    Imprimir
                  </Button>
                  <button 
                    type="button"
                    onClick={() => setPdfPreviewOpen(false)} 
                    className="p-1.5 hover:bg-neutral-200 rounded-full"
                  >
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
              </div>
              
              {/* Contenedor de páginas para imprimir */}
              <div className="print-content">
                {/* PÁGINA 1 */}
                <div className="print-page-1 bg-white shadow-xl w-full max-w-2xl" style={{ padding: '24px' }}>
                  {/* Header Página 1 */}
                  <div className="flex justify-between items-start border-b-2 border-orange-500 pb-3 mb-4">
                    <div>
                      <div className="text-xl font-light tracking-widest">
                        <span className="text-neutral-800">M</span>
                        <span className="text-orange-500">A</span>
                        <span className="text-neutral-800">TRIZ</span>
                      </div>
                      <span className="text-[8px] text-neutral-400 tracking-wider">ARCHITECTURE FOR ENGINEERING</span>
                    </div>
                    <div className="text-right">
                      <h1 className="text-sm font-bold text-neutral-800 uppercase">Log de Avance</h1>
                      <p className="text-[9px] text-neutral-500">Informe de Estado</p>
                    </div>
                  </div>
                  
                  {/* Info del proyecto */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-neutral-50 rounded text-[9px]">
                    <div>
                      <p><span className="text-neutral-500">Código:</span> <span className="font-bold text-orange-600">{selectedProject}</span></p>
                      <p><span className="text-neutral-500">Nombre:</span> {proyectos.find(p => p.id === selectedProject)?.nombre}</p>
                      <p><span className="text-neutral-500">Cliente:</span> {proyectos.find(p => p.id === selectedProject)?.cliente}</p>
                    </div>
                    <div>
                      <p><span className="text-neutral-500">Fecha:</span> {new Date().toLocaleDateString('es-CL')}</p>
                      <p><span className="text-neutral-500">Inicio:</span> {dashboardStartDate.split('-').reverse().join('/')}</p>
                    </div>
                  </div>
                  
                  {/* Resumen */}
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    <div className="text-center p-1.5 bg-neutral-100 rounded">
                      <p className="text-base font-bold text-neutral-800">{ENTREGABLES_PROYECTO.length}</p>
                  <p className="text-[7px] text-neutral-500">TOTAL</p>
                </div>
                <div className="text-center p-1.5 bg-green-50 rounded border border-green-200">
                  <p className="text-base font-bold text-green-600">{ENTREGABLES_PROYECTO.filter(d => statusData[d.id]?.sentRev0).length}</p>
                  <p className="text-[7px] text-green-600">LISTOS</p>
                </div>
                <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                  <p className="text-base font-bold text-orange-500">{ENTREGABLES_PROYECTO.filter(d => statusData[d.id]?.sentIniciado && !statusData[d.id]?.sentRev0).length}</p>
                  <p className="text-[7px] text-orange-500">PROCESO</p>
                </div>
                <div className="text-center p-1.5 bg-red-50 rounded border border-red-200">
                  <p className="text-base font-bold text-red-500">{ENTREGABLES_PROYECTO.filter(d => {
                    const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart);
                    return !statusData[d.id]?.sentRev0 && new Date() > deadlines.deadlineRevA;
                  }).length}</p>
                  <p className="text-[7px] text-red-500">ATRASO</p>
                </div>
                <div className="text-center p-1.5 bg-blue-50 rounded border border-blue-200">
                  <p className="text-base font-bold text-blue-600">{((ENTREGABLES_PROYECTO.filter(d => statusData[d.id]?.sentRev0).length / ENTREGABLES_PROYECTO.length) * 100).toFixed(0)}%</p>
                  <p className="text-[7px] text-blue-600">AVANCE</p>
                </div>
              </div>
              
              {/* Tabla Página 1 - Entregables 1-18 */}
              <p className="text-[8px] font-semibold text-neutral-400 uppercase mb-1">Entregables 1-18</p>
              <table className="w-full text-[8px] border-collapse mb-3">
                <thead>
                  <tr className="bg-neutral-800 text-white">
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-5">#</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-left">Entregable</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_A</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_B</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_0</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-14">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTREGABLES_PROYECTO.slice(0, 18).map((d, i) => {
                    const status = statusData[d.id];
                    const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart);
                    const info = calculateStatus(status, deadlines);
                    return (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                        <td className="border border-neutral-300 px-1 py-0.5 text-center">{d.id}</td>
                        <td className="border border-neutral-300 px-1 py-0.5">{d.name}</td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevADate ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRevADate || '-'}
                        </td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRevBDate || '-'}
                        </td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRev0Date || '-'}
                        </td>
                        <td className="border border-neutral-300 px-1 py-0.5 text-center">
                          <span className={`px-1 rounded text-[6px] ${
                            info.status === 'TERMINADO' ? 'bg-green-100 text-green-700' :
                            info.status === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                            info.status === 'En Proceso' ? 'bg-orange-100 text-orange-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>{info.status === 'En Proceso' ? 'Proceso' : info.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="flex justify-between text-[7px] text-neutral-400 pt-2 border-t border-neutral-200">
                <span>MATRIZ © 2026</span>
                <span>Página 1 de 2</span>
              </div>
            </div>
            
            {/* Separador entre páginas - NO IMPRIMIR */}
            <div className="no-print h-4 w-full max-w-2xl bg-neutral-500 flex items-center justify-center">
              <span className="text-[8px] text-white">--- Corte de página ---</span>
            </div>
            
            {/* PÁGINA 2 */}
            <div className="print-page-2 bg-white shadow-xl w-full max-w-2xl" style={{ padding: '24px' }}>
              {/* Header Página 2 */}
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2 mb-3">
                <div className="text-sm font-light tracking-widest">
                  <span className="text-neutral-800">M</span>
                  <span className="text-orange-500">A</span>
                  <span className="text-neutral-800">TRIZ</span>
                </div>
                <div className="text-[8px] text-neutral-500">
                  {selectedProject} • Log de Avance • {new Date().toLocaleDateString('es-CL')}
                </div>
              </div>
              
              {/* Tabla Página 2 - Entregables 19-35 */}
              <p className="text-[8px] font-semibold text-neutral-400 uppercase mb-1">Entregables 19-35</p>
              <table className="w-full text-[8px] border-collapse mb-4">
                <thead>
                  <tr className="bg-neutral-800 text-white">
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-5">#</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-left">Entregable</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_A</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_B</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_0</th>
                    <th className="border border-neutral-600 px-1 py-0.5 text-center w-14">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTREGABLES_PROYECTO.slice(18).map((d, i) => {
                    const status = statusData[d.id];
                    const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart);
                    const info = calculateStatus(status, deadlines);
                    return (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                        <td className="border border-neutral-300 px-1 py-0.5 text-center">{d.id}</td>
                        <td className="border border-neutral-300 px-1 py-0.5">{d.name}</td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevADate ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRevADate || '-'}
                        </td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRevBDate || '-'}
                        </td>
                        <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400'}`}>
                          {status?.sentRev0Date || '-'}
                        </td>
                        <td className="border border-neutral-300 px-1 py-0.5 text-center">
                          <span className={`px-1 rounded text-[6px] ${
                            info.status === 'TERMINADO' ? 'bg-green-100 text-green-700' :
                            info.status === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                            info.status === 'En Proceso' ? 'bg-orange-100 text-orange-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>{info.status === 'En Proceso' ? 'Proceso' : info.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Leyenda */}
              <div className="mb-4 p-2 bg-neutral-50 rounded">
                <p className="text-[8px] font-semibold text-neutral-600 mb-1">Leyenda</p>
                <div className="flex flex-wrap gap-3 text-[8px]">
                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">TERMINADO</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Proceso</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">ATRASADO</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">Pendiente</span>
                </div>
              </div>
              
              {/* Firmas */}
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="border-t border-neutral-300 pt-2 mt-6">
                  <p className="text-[8px] text-neutral-500 text-center">Preparado por</p>
                </div>
                <div className="border-t border-neutral-300 pt-2 mt-6">
                  <p className="text-[8px] text-neutral-500 text-center">Revisado por</p>
                </div>
              </div>
              
              {/* Pie Página 2 */}
              <div className="border-t-2 border-orange-500 pt-2">
                <div className="flex justify-between text-[7px] text-neutral-400">
                  <div>
                    <p className="font-medium text-neutral-600">MATRIZ - Sistema de Gestión de Proyectos</p>
                    <p>www.matriz.cl</p>
                  </div>
                  <p>Página 2 de 2</p>
                </div>
              </div>
            </div>
            </div>{/* Fin print-content */}
            
            {/* Botón cerrar al final - NO IMPRIMIR */}
            <div className="no-print bg-white w-full max-w-2xl rounded-b-lg p-2 flex justify-center">
              <Button variant="secondary" onClick={() => setPdfPreviewOpen(false)}>
                Cerrar Vista Previa
              </Button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Modal Confirmar Eliminación de Proyecto */}
      {deleteConfirmOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">Eliminar Proyecto</h2>
                <p className="text-sm text-neutral-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-600 mb-2">
                ¿Estás seguro de que deseas eliminar el siguiente proyecto?
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <Building2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-mono text-orange-600 font-medium">{projectToDelete.id}</p>
                  <p className="text-neutral-800">{projectToDelete.nombre}</p>
                  <p className="text-neutral-500 text-xs">{projectToDelete.cliente}</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-red-600 mb-4">
              ⚠️ Se eliminarán también todas las horas registradas asociadas a este proyecto.
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setProjectToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleDeleteProject}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Editar Proyecto */}
      {editProjectOpen && projectToEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Pencil className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">Editar Proyecto</h2>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Código del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjectData.id}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ej: P2600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjectData.nombre}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del proyecto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={editProjectData.cliente}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Estado
                </label>
                <select
                  value={editProjectData.estado}
                  onChange={(e) => setEditProjectData(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  setEditProjectOpen(false);
                  setProjectToEdit(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSaveProject}
                disabled={!editProjectData.nombre.trim() || !editProjectData.id.trim()}
              >
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-4 text-center text-neutral-500 text-xs">
        MATRIZ © 2026 • {currentUser?.nombre} ({isAdmin ? 'Admin' : 'Colaborador'})
      </footer>
    </div>
  );
}
