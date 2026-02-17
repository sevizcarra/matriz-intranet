import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home, FolderKanban, Clock, FileSpreadsheet, Users, Plus,
  ChevronRight, ChevronDown, ChevronLeft, TrendingUp, Calendar, Lock, Eye, EyeOff,
  Building2, User, DollarSign, FileText, Check, X, Pencil, Trash2, Settings,
  BarChart3, AlertTriangle, Printer, FileDown, UserPlus, Save, LogOut, Loader2,
  Moon, Sun, Snowflake, ClipboardList, MessageSquare, Send, Circle, Wifi
} from 'lucide-react';
import {
  subscribeToProyectos,
  subscribeToColaboradores,
  subscribeToHoras,
  subscribeToStatusData,
  subscribeToTareas,
  subscribeToPresencia,
  saveProyecto,
  deleteProyecto as deleteProyectoFS,
  saveColaborador,
  deleteColaborador as deleteColaboradorFS,
  saveHora,
  deleteHora as deleteHoraFS,
  saveStatusData,
  saveTarea,
  deleteTarea as deleteTareaFS,
  updatePresencia,
  setOffline,
  saveAllProyectos,
  saveAllColaboradores
} from './firestoreService';

// ============================================
// SISTEMA DE USUARIOS Y ROLES
// ============================================
const USUARIOS_INICIAL = [
  { id: 'admin', nombre: 'Sebastián Vizcarra', email: 'sebastianvizcarra@gmail.com', password: 'admin123', rol: 'admin', profesionalId: 3 },
  { id: 'user1', nombre: 'Cristóbal Ríos', email: 'cristobal@matriz.cl', password: 'crios123', rol: 'profesional', profesionalId: 1 },
  { id: 'user2', nombre: 'Dominique Thompson', email: 'dominique@matriz.cl', password: 'dthompson123', rol: 'profesional', profesionalId: 2 },
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
      
      /* Contenido de impresión - sin saltos de página */
      .print-page-1,
      .print-page-2 {
        page-break-after: avoid;
        page-break-before: avoid;
        padding: 0 !important;
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
      
      /* Tamaño de página carta apaisada */
      @page {
        size: letter landscape;
        margin: 8mm 12mm;
      }
    }
  `}</style>
);

// ============================================
// DATOS BASE
// ============================================

const COLABORADORES_INICIAL = [
  { id: 1, nombre: 'Cristóbal Ríos', cargo: 'Arquitecto', categoria: 'Ingeniero Senior', tarifaInterna: 0.75, iniciales: 'CR', proyectosAsignados: [] },
  { id: 2, nombre: 'Dominique Thompson', cargo: 'Arquitecta', categoria: 'Proyectista', tarifaInterna: 0.5, iniciales: 'DT', proyectosAsignados: [] },
  { id: 3, nombre: 'Sebastián Vizcarra', cargo: 'Arquitecto', categoria: 'Líder de Proyecto', tarifaInterna: 1.0, iniciales: 'SV', proyectosAsignados: [] },
];

// Entregables del proyecto (35 documentos)
const ENTREGABLES_PROYECTO = [
  { id: 1, codigo: "", name: "CRITERIOS DE DISEÑO", weekStart: 2 },
  { id: 2, codigo: "", name: "PLANTA DISPOSICIÓN GENERAL", weekStart: 2 },
  { id: 3, codigo: "", name: "PLANTA DEMOLICIÓN 1 DE 2", weekStart: 3 },
  { id: 4, codigo: "", name: "PLANTA DEMOLICIÓN 2 DE 2", weekStart: 3 },
  { id: 5, codigo: "", name: "EETT DEMOLICIONES", weekStart: 4 },
  { id: 6, codigo: "", name: "PLANTA TERMINACIONES 1", weekStart: 5 },
  { id: 7, codigo: "", name: "PLANTA TERMINACIONES 2", weekStart: 5 },
  { id: 8, codigo: "", name: "PLANTA PAVIMENTOS 1", weekStart: 5 },
  { id: 9, codigo: "", name: "PLANTA PAVIMENTOS 2", weekStart: 6 },
  { id: 10, codigo: "", name: "TABIQUES VIDRIADOS 1", weekStart: 6 },
  { id: 11, codigo: "", name: "TABIQUES VIDRIADOS 2", weekStart: 6 },
  { id: 12, codigo: "", name: "TABIQUES VIDRIADOS 3", weekStart: 7 },
  { id: 13, codigo: "", name: "TABIQUES VIDRIADOS 4", weekStart: 7 },
  { id: 14, codigo: "", name: "CIELOS E ILUMINACIÓN 1", weekStart: 7 },
  { id: 15, codigo: "", name: "CIELOS E ILUMINACIÓN 2", weekStart: 8 },
  { id: 16, codigo: "", name: "DETALLES TABIQUES TIPO", weekStart: 8 },
  { id: 17, codigo: "", name: "DETALLES REVESTIMIENTOS 1", weekStart: 8 },
  { id: 18, codigo: "", name: "DETALLES REVESTIMIENTOS 2", weekStart: 9 },
  { id: 19, codigo: "", name: "DETALLES PAVIMENTOS", weekStart: 9 },
  { id: 20, codigo: "", name: "PUERTAS Y QUINCALLERÍA", weekStart: 9 },
  { id: 21, codigo: "", name: "DETALLES COCINA", weekStart: 10 },
  { id: 22, codigo: "", name: "DETALLES CAFETERÍA", weekStart: 10 },
  { id: 23, codigo: "", name: "DETALLES SALA CONTROL", weekStart: 10 },
  { id: 24, codigo: "", name: "ACCESIBILIDAD Y RAMPA", weekStart: 11 },
  { id: 25, codigo: "", name: "PLANTA SEÑALÉTICA", weekStart: 11 },
  { id: 26, codigo: "", name: "DETALLES SEÑALÉTICA", weekStart: 11 },
  { id: 27, codigo: "", name: "EETT GENERALES", weekStart: 12 },
  { id: 28, codigo: "", name: "MTO (MATERIALES)", weekStart: 13 },
  { id: 29, codigo: "", name: "MOBILIARIO 1", weekStart: 14 },
  { id: 30, codigo: "", name: "MOBILIARIO 2", weekStart: 14 },
  { id: 31, codigo: "", name: "ELEVACIÓN INT. NORTE/SUR", weekStart: 15 },
  { id: 32, codigo: "", name: "ELEVACIÓN INT. ORIE/PON", weekStart: 15 },
  { id: 33, codigo: "", name: "SECCIÓN A-A / B-B", weekStart: 16 },
  { id: 34, codigo: "", name: "SECCIÓN C-C / D-D", weekStart: 16 },
  { id: 35, codigo: "", name: "IMÁGENES OBJETIVO", weekStart: 17 },
];

const PROYECTOS_INICIALES = [
  {
    id: 'P2600',
    nombre: 'Spence SGO - Obras Tempranas',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-01-06',
    avance: 8.6,
    tarifaVenta: 1.2,
    entregables: [
      { id: 1, codigo: 'P2600-CRD-001', nombre: 'CRITERIOS DE DISEÑO', secuencia: 1, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 2, codigo: 'P2600-ARQ-001', nombre: 'PLANTA DISPOSICIÓN GENERAL', secuencia: 2, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 3, codigo: 'P2600-ARQ-002', nombre: 'PLANTA DEMOLICIÓN 1 DE 2', secuencia: 3, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 4, codigo: 'P2600-ARQ-003', nombre: 'PLANTA DEMOLICIÓN 2 DE 2', secuencia: 4, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 5, codigo: 'P2600-SPE-001', nombre: 'EETT DEMOLICIONES', secuencia: 5, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 6, codigo: 'P2600-ARQ-004', nombre: 'PLANTA TERMINACIONES 1', secuencia: 6, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 7, codigo: 'P2600-ARQ-005', nombre: 'PLANTA TERMINACIONES 2', secuencia: 7, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 8, codigo: 'P2600-ARQ-006', nombre: 'PLANTA PAVIMENTOS 1', secuencia: 8, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 9, codigo: 'P2600-ARQ-007', nombre: 'PLANTA PAVIMENTOS 2', secuencia: 9, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 10, codigo: 'P2600-DET-001', nombre: 'DETALLES TABIQUES TIPO', secuencia: 10, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 11, codigo: 'P2600-DET-002', nombre: 'DETALLES REVESTIMIENTOS', secuencia: 11, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 12, codigo: 'P2600-DET-003', nombre: 'DETALLES PAVIMENTOS', secuencia: 12, valorRevA: 17.5, valorRevB: 5, valorRev0: 2.5, frozen: false },
      { id: 13, codigo: 'P2600-SPE-002', nombre: 'EETT GENERALES', secuencia: 13, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 14, codigo: 'P2600-MTO-001', nombre: 'MTO (MATERIALES)', secuencia: 14, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
    ]
  },
  {
    id: 'P2601',
    nombre: 'Escondida MEL - Fase 2',
    cliente: 'BHP Billiton',
    estado: 'Activo',
    inicio: '2026-02-01',
    avance: 0,
    tarifaVenta: 1.1,
    entregables: [
      { id: 1, codigo: 'P2601-CRD-001', nombre: 'CRITERIOS DE DISEÑO', secuencia: 1, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 2, codigo: 'P2601-ARQ-001', nombre: 'PLANTA GENERAL NIVEL 0', secuencia: 2, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 3, codigo: 'P2601-ARQ-002', nombre: 'PLANTA GENERAL NIVEL 1', secuencia: 3, valorRevA: 14, valorRevB: 4, valorRev0: 2, frozen: false },
      { id: 4, codigo: 'P2601-SPE-001', nombre: 'EETT ARQUITECTURA', secuencia: 4, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
      { id: 5, codigo: 'P2601-MTO-001', nombre: 'MTO ARQUITECTURA', secuencia: 5, valorRevA: 28, valorRevB: 8, valorRev0: 4, frozen: false },
    ]
  },
];

// Obtener número de semana del año (ISO 8601)
const getWeekOfYear = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Obtener semana actual del año
const getCurrentWeekOfYear = () => getWeekOfYear(new Date());

// Obtener semanas de un mes específico (con números de semana del año)
// Si no se pasa parámetro, usa el mes actual
const getWeeksOfMonth = (mesString = null) => {
  let year, month;
  if (mesString) {
    // Formato: "2026-02"
    const [y, m] = mesString.split('-').map(Number);
    year = y;
    month = m - 1; // JavaScript months are 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let weekStart = new Date(firstDay);
  // Ajustar al lunes
  const dayOfWeek = weekStart.getDay();
  if (dayOfWeek !== 1) {
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  }

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Viernes
    const weekOfYear = getWeekOfYear(weekStart); // Usar número de semana del año
    weeks.push({
      num: weekOfYear, // Ahora es el número de semana del año
      start: new Date(weekStart),
      end: weekEnd,
      label: `S${weekOfYear} (${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1})`
    });
    weekStart.setDate(weekStart.getDate() + 7);
  }
  return weeks;
};

// ============================================
// COMPONENTES UI
// ============================================

const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm ${onClick ? 'cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md active:bg-neutral-50 dark:bg-neutral-800/50 dark:active:bg-neutral-700 active:scale-[0.98] transition-all touch-manipulation select-none' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white',
    secondary: 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 active:bg-neutral-400 dark:active:bg-neutral-50 dark:bg-neutral-800/500 text-neutral-700 dark:text-neutral-200 dark:text-neutral-200',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 dark:active:bg-neutral-600 text-neutral-600 dark:text-neutral-300',
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
    {label && <label className="text-xs text-neutral-600 dark:text-neutral-300 dark:text-neutral-400 font-medium">{label}</label>}
    <input
      className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2.5 sm:py-2 text-neutral-800 dark:text-neutral-100 text-base sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      {...props}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs text-neutral-600 dark:text-neutral-300 dark:text-neutral-400 font-medium">{label}</label>}
    <select
      className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2.5 sm:py-2 text-neutral-800 dark:text-neutral-100 text-base sm:text-sm focus:outline-none focus:border-orange-500 appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px', paddingRight: '36px' }}
      {...props}
    >
      {children}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
    success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
    warning: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
    danger: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
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
      checked ? 'bg-orange-500 border-orange-500' : 'border-neutral-300 dark:border-neutral-600 hover:border-orange-400 active:border-orange-500'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {checked && <Check className="w-4 h-4 sm:w-3 sm:h-3 text-white" />}
  </button>
);

const DashboardBadge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
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
        <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-neutral-800 dark:text-neutral-100">{value} / {total} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const Accordion = ({ title, count, color, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${color}`} />
          <span className="text-neutral-800 dark:text-neutral-100 text-sm">{title}</span>
          <span className="text-neutral-500 dark:text-neutral-400 text-xs">({count})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3 bg-white dark:bg-neutral-800 text-sm">{children}</div>}
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
  if (!status) return { status: 'Pendiente', color: 'bg-neutral-50 dark:bg-neutral-800/500' };
  if (status.sentRev0) return { status: 'TERMINADO', color: 'bg-green-500' };
  if (status.sentRevB || status.sentRevA || status.sentIniciado) {
    const nextDeadline = !status.sentRevA ? deadlines.deadlineRevA :
                       !status.sentRevB ? deadlines.deadlineRevB : deadlines.deadlineRev0;
    if (today > nextDeadline) return { status: 'ATRASADO', color: 'bg-red-500' };
    return { status: 'En Proceso', color: 'bg-orange-500' };
  }
  if (today > deadlines.deadlineRevA) return { status: 'ATRASADO', color: 'bg-red-500' };
  return { status: 'Pendiente', color: 'bg-neutral-50 dark:bg-neutral-800/500' };
};

const getDocumentSuffix = (status) => {
  if (!status) return "";
  if (status.sentRev0 || status.comentariosBRecibidos) return "_0";
  if (status.comentariosARecibidos) return "_B";
  if (status.sentIniciado || status.sentRevA) return "_A";
  return "";
};

// Logo A4E (base64 embebido)
const LOGO_A4E = 'data:image/png;base64,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PSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMTQ4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE1NTQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K457VIQAAABxpRE9UAAAAAgAAAAAAAAI+AAAAKAAAAj4AAAI+AAFHOGEo6H0AAEAASURBVHgB7N0HgCRXfSf+38xsloSWaLAJBozBxgEDPjgwiCyTfIQDfNg+25wDnMM5/Y2NAhJCRNtgAyYasMk55yyyECZHC1BASCCknU2zE7v/772qnp2V1BunU9Wn2e2urvBevc+rqkXv29U91U2P8CBAgAABAgQIECBAgAABAgQIECBAgAABAgQIXIPAlCDhGlTMIkCAAAECBAgQIECAAAECBAgQIECAAAECBIqAIMGBQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECPQVECT0pbGAAAECBAgQIECAAAECBAgQIECAAAECBAgQECQ4BggQIECAAAECBAgQIECAAAECBAgQIECAAIG+AoKEvjQWECBAgAABAgQIECBAgAABAgQIECBAgAABAoIExwABAgQIECBAgAABAgQIECBAgAABAgQIECDQV0CQ0JfGAgIECBAgQIAAAQIECBAgQIAAAQIECBAgQECQ4BggQIAAAQIECBAgQIAAAQIECBAgQIAAAQIE+goIEvrSWECAAAECBAgQIECAAAECBAgQIECAAAECBAgIEhwDBAgQIECAAAECBAgQIECAAAECBAgQIECAQF8BQUJfGgsIECBAgAABAgQIECBAgAABAgQIECBAgAABQYJjgAABAgQIECBAgAABAgQIECBAgAABAgQIEOgrIEjoS2MBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgIEhwDBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJ9BQQJfWksIECAAAECBAgQIECAAAECBAgQIECAAAECBAQJjgECBAgQIECAAAECBAgQIECAAAECBAgQIECgr4AgoS+NBQQIECBAgAABAgQIECBAgAABAgQIECBAgIAgwTFAgAABAgQIECBAgAABAgQIECBAgAABAgQI9BUQJPSlsYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQJDgGCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgb4CgoS+NBYQIECAAAECBAgQIECAAAECBAgQIECAAAECggTHAAECBAgQIECAAAECBAgQIECAAAECBAgQINBXQJDQl8YCAgQIECBAgAABAgQIECBAgAABAgQIECBAQJDgGCBAgAABAgQIECBAgAABAgQIECBAgAABAgT6CggS+tJYQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECAgSHAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAXwFBQl8aCwgQIECAAAECBAgQIECAAAECBAgQIECAAAFBgmOAAAECBAgQIECAAAECBAgQIECAAAECBAgQ6CsgSOhLYwEBAgQIECBAgAABAgQIECBAgAABAgQIECAgSHAMECBAgAABAgQIECBAgAABAgQIECBAgAABAn0FBAl9aSwgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEBAmOAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKCvgCChL40FBAgQIECAAAECBAgQIECAAAECBAgQIECAgCDBMUCAAAECBAgQIECAAAECBAgQIECAAAECBAj0FRAk9KWxgAABAgQIECBAgAABAgQIECBAgAABAgQIEBAkOAYIECBAgAABAgQIECBAgAABAgQIECBAgACBvgKChL40FhAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQKCBMcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAg0FdAkNCXxgICBAgQIECAAAECBAgQIECAAAECBAgQIEBAkOAYIECAAAECBAgQIECAAAECBAgQIECAAAECBPoKCBL60lhAgAABAgQIECBAgAABAgQIECBAgAABAgQICBIcAwQIECBAgAABAgQIECBAgAABAgQIECBAgEBfAUFCXxoLCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAUGCY4AAAQIECBAgQIAAAQIECBAgQIAAAQIECBDoKyBI6EtjAQECBAgQIECAAAECBAgQIECAAAECBAgQICBIcAwQIECAAAECBAgQIECAAAECBAgQIECAAAECfQUECX1pLCBAgAABAgQIECBAgAABAgQIECBAgAABAgQECY4BAgQIECBAgAABAgQIECBAgAABAgQIECBAoK+AIKEvjQUECBAgQIAAAQIECBAgQIAAAQIECBAgQICAIMExQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECPQVECT0pbGAAAECBAgQIECAAAECBAgQIECAAAECBAgQECQ4BggQIECAAAECBAgQIECAAAECBAgQIECAAIG+AoKEvjQWECBAgAABAgQIECBAgAABAgQIECBAgAABAoIExwABAgQIECBAgAABAgQIECBAgAABAgQIECDQV0CQ0JfGAgIECBAgQIAAAQIECBAgQIAAAQIECBAgQECQ4BggQIAAAQIECBAgQIAAAQIECBAgQIAAAQIE+goIEvrSWECAAAECBAgQIECAAAECBAgQIECAAAECBAgIEhwDBAgQIECAAAECBAgQIECAAAECBAgQIECAQF8BQUJfGgsIECBAgAABAgQIECBAgAABAgQIECBAgAABQYJjgAABAgQIECBAgAABAgQIECBAgAABAgQIEOgrIEjoS2MBAQIECBAgQIAAAQIECBAgQIAAAQIECBAgIEhwDBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJ9BQQJfWksIECAAAECBAgQIECAAAECBAgQIECAAAECBAQJjgECBAgQIECAAAECBAgQIECAAAECBAgQIECgr4AgoS+NBQQIECBAgAABAgQIECBAgAABAgQIECBAgIAgwTFAgAABAgQIECBAgAABAgQIECBAgAABAgQI9BUQJPSlsYAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAQJDgGCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgb4CgoS+NBYQIECAAAECBAgQIECAAAECBAgQIECAAAECggTHAAECBAgQIECAAAECBAgQIECAAAECBAgQINBXQJDQl8YCAgQIECBAgAABAgQIECBAgAABAgQIECBAQJDgGCBAgAABAgQIECBAgAABAgQIECBAgAABAgT6CggS+tJYQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECAgSHAMECBAgQIAAAQIECBAgQIAAAQIECBAgQIBAXwFBQl8aCwgQIECAAAECBAgQIECAAAECBAgQIECAAAFBgmOAAAECBAgQIECAAAECBAgQIECAAAECBAgQ6CsgSOhLYwEBAgQIECBAgAABAgQIECBAgAABAgQIECAgSHAMECBAgAABAgQIECBAgAABAgQIECBAgAABAn0FBAl9aSwgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEBAmOAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQKCvgCChL40FBAgQIECAAAECBAgQIECAAAECBAgQIECAgCDBMUCAAAECBAgQIECAAAECBAgQIECAAAECBAj0FRAk9KWxgAABAgQIECBAgAABAgQIECBAgAABAgQIEBAkOAYIECBAgAABAgQIECBAgAABAgQIECBAgACBvgKChL40FhAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQKCBMcAAQIECBAgQIDAyAQ6V/4gdvztnUZWv4oJrIfAdV9y8XoUowwCBAgQIECAAAECYysgSBjbrrFjBAgQIECAAIHmC+x+wWNj8bx3Nb+hWthoAUFCo7tX4wgQIECAAAECBJKAIMFhQIAAAQIECBAgMBKBxc+/K3Y//7EjqVulBNZTQJCwnprKIkCAAAECBAgQGEcBQcI49op9IkCAAAECBAg0XWB5KWZPv1es/OiCprdU+1ogIEhoQSdrIgECBAgQIECg5QKChJYfAJpPgAABAgQIEBiFwN7XPynm3//iUVStTgLrLiBIWHdSBRIgQIAAAQIECIyZgCBhzDrE7hAgQIAAAQIEmi7Qufyi2HH6PSOWFpveVO1riYAgoSUdrZkECBAgQIAAgRYLCBJa3PmaToAAAQIECBAYhcCuZ/9OLH31o6OoWp0EBiIgSBgIq0IJECBAgAABAgTGSECQMEadYVcIECBAgAABAk0XWPjk62PPy/666c3UvpYJCBJa1uGaS4AAAQIECBBooYAgoYWdrskECBAgQIAAgVEIdBfmYva0e0TnyktHUb06CQxMQJAwMFoFEyBAgAABAgQIjImAIGFMOsJuECBAgAABAgSaLrD3FX8X8x97VdObqX0tFBAktLDTNZkAAQIECBAg0DIBQULLOlxzCRAgQIAAAQKjEFj5wbdj9sz7RaysjKJ6dRIYqIAgYaC8CidAgAABAgQIEBgDAUHCGHSCXSBAgAABAgQINF1g1zMeHkvf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QAABBDZdgETCpps97hqNyqSMnvx8qenDrRi6Q6C07W4yfPKP9T+xPPiqO7Y4nxIBBBBAYKEESCQslCz1dkqAREKnpGkHAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAAuD8rdAAADEUlEQVQCCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5ECCRkIONRBcRQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEhLgERCWvK0iwACCCCAAAIIIIAAAggggAACCCCAAAIIIIBADgRIJORgI9FFBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQTSEiCRkJY87SKAAAIIIIAAAggggAACCCCAAAIIIIAAAgggkAMBEgk52Eh0EQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBtARIJKQlT7sIIIAAAggggAACCCCAAAIIIIAAAggggAACCORAgERCDjYSXUQAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAIC0BEglpydMuAggggAACCCCAAAIIIIAAAggggAACCCCAAAI5EPj/Z6p2tY7Myh8AAAAASUVORK5CYII=';

const MatrizLogo = ({ size = 'md' }) => {
  const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' };
  return (
    <img src={LOGO_A4E} alt="A4E" className={heights[size]} />
  );
};

// ============================================
// COMPONENTE PRINCIPAL - INTRANET
// ============================================

export default function MatrizIntranet() {
  // ============================================
  // ESTADO DE MODO OSCURO
  // ============================================
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('matriz_darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Aplicar clase dark al documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('matriz_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ============================================
  // ESTADOS DE AUTENTICACIÓN
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIAL);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Helpers de rol
  const isAdmin = currentUser?.rol === 'admin';
  const canEdit = () => currentUser?.rol === 'admin';

  // Login handlers
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Ingresa email y contraseña');
      setTimeout(() => setLoginError(''), 3000);
      return;
    }
    // Buscar usuario por email
    const user = usuarios.find(u => u.email === loginEmail);
    if (user) {
      // Para admin, verificar contra adminStoredPassword
      const passwordValid = user.rol === 'admin'
        ? loginPassword === adminStoredPassword
        : loginPassword === user.password;

      if (passwordValid) {
        setCurrentUser(user);
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');
        // Actualizar presencia al iniciar sesión
        await updatePresencia(user.profesionalId, {
          pagina: 'home',
          navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
        });
      } else {
        setLoginError('Email o contraseña incorrectos');
        setTimeout(() => setLoginError(''), 3000);
      }
    } else {
      setLoginError('Email o contraseña incorrectos');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLogout = async () => {
    // Marcar como offline antes de cerrar sesión
    if (currentUser) {
      await setOffline(currentUser.profesionalId);
    }
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // ============================================
  // ESTADOS DE LA APP (con persistencia Firestore)
  // ============================================
  const [currentPage, setCurrentPage] = useState('home');
  const [proyectos, setProyectos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [horasRegistradas, setHorasRegistradas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [presenciaUsuarios, setPresenciaUsuarios] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreReady, setFirestoreReady] = useState(false);
  // Estado persistente para Facturación (evita reset al re-render)
  const [selectedProyectoFacturacion, setSelectedProyectoFacturacion] = useState('');

  // Helper para filtrar proyectos según rol y asignación
  const currentColaborador = currentUser ? profesionales.find(c => c.id === currentUser.profesionalId) : null;
  const proyectosVisibles = proyectos.filter(p => {
    if (isAdmin) return true; // Admin ve todos
    if (!currentColaborador) return false;
    const asignados = currentColaborador.proyectosAsignados || [];
    return asignados.includes(p.id); // Solo ve proyectos asignados
  });
  const proyectosActivosVisibles = proyectosVisibles.filter(p => !p.estado || p.estado?.toLowerCase() === 'activo');

  // ============================================
  // FIRESTORE SUBSCRIPTIONS
  // ============================================
  useEffect(() => {
    // Subscribe to Firestore collections
    const unsubProyectos = subscribeToProyectos((data) => {
      if (data.length > 0) {
        // Mezclar entregables de PROYECTOS_INICIALES en proyectos sin entregables
        const proyectosMerged = data.map(p => {
          if (!p.entregables || p.entregables.length === 0) {
            const inicial = PROYECTOS_INICIALES.find(pi => pi.id === p.id);
            if (inicial && inicial.entregables) {
              return { ...p, entregables: inicial.entregables };
            }
          }
          return p;
        });
        setProyectos(proyectosMerged);
        // Guardar los proyectos actualizados con entregables
        proyectosMerged.forEach(p => {
          const original = data.find(d => d.id === p.id);
          if (original && (!original.entregables || original.entregables.length === 0) && p.entregables) {
            saveProyecto(p);
          }
        });
      } else {
        // Si no hay datos en Firestore, usar datos iniciales y guardarlos
        setProyectos(PROYECTOS_INICIALES);
        saveAllProyectos(PROYECTOS_INICIALES);
      }
    });

    const unsubProfesionales = subscribeToColaboradores((data) => {
      if (data.length >= COLABORADORES_INICIAL.length) {
        setProfesionales(data);
      } else {
        // Si faltan profesionales en Firestore, usar datos iniciales y guardarlos
        setProfesionales(COLABORADORES_INICIAL);
        saveAllColaboradores(COLABORADORES_INICIAL);
      }
    });

    const unsubHoras = subscribeToHoras((data) => {
      setHorasRegistradas(data);
    });

    const unsubTareas = subscribeToTareas((data) => {
      setTareas(data);
    });

    const unsubPresencia = subscribeToPresencia((data) => {
      setPresenciaUsuarios(data);
    });

    // Marcar como listo después de un momento
    setTimeout(() => {
      setIsLoading(false);
      setFirestoreReady(true);
    }, 1500);

    // Cleanup
    return () => {
      unsubProyectos();
      unsubProfesionales();
      unsubHoras();
      unsubTareas();
      unsubPresencia();
    };
  }, []);

  // ============================================
  // PRESENCIA - Heartbeat y tracking de página
  // ============================================
  useEffect(() => {
    if (!currentUser) return;

    // Actualizar presencia cuando cambia la página
    const paginaLabel = {
      'home': 'Inicio',
      'proyectos': 'Proyectos',
      'proyecto-detail': 'Detalle Proyecto',
      'horas': 'Carga HsH',
      'tareas': 'Tareas',
      'facturacion': 'Adm. Proyectos',
      'config': 'Configuración'
    };

    updatePresencia(currentUser.profesionalId, {
      pagina: paginaLabel[currentPage] || currentPage,
      navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
    });

    // Heartbeat cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      updatePresencia(currentUser.profesionalId, {
        pagina: paginaLabel[currentPage] || currentPage,
        navegador: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'Desktop'
      });
    }, 30000);

    // Detectar cuando el usuario cierra la pestaña/navegador
    const handleBeforeUnload = () => {
      setOffline(currentUser.profesionalId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, currentPage]);

  // Helper para determinar si un usuario está "online" (activo en los últimos 2 minutos)
  const isUsuarioOnline = (profesionalId) => {
    const presencia = presenciaUsuarios.find(p => p.profesionalId === profesionalId);
    if (!presencia || !presencia.online) return false;
    const ultimaActividad = new Date(presencia.ultimaActividad);
    const ahora = new Date();
    const diffMinutos = (ahora - ultimaActividad) / (1000 * 60);
    return diffMinutos < 2; // Considera online si la última actividad fue hace menos de 2 minutos
  };

  // Obtener usuarios online
  const usuariosOnline = profesionales.filter(p => isUsuarioOnline(p.id));

  // Estados para contraseña admin
  const [showPassword, setShowPassword] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState(''); // Para verificar antes de cambiar
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminStoredPassword, setAdminStoredPassword] = useState('admin123'); // Contraseña del admin
  
  // Estados para formularios
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    nombre: '',
    cliente: '',
    jefeProyecto: '',
    tarifaVenta: 1.2,
    entregables: [] // Array de { id, codigo, nombre, secuencia, valorRevA, valorRevB, valorRev0 }
  });
  const [excelFileName, setExcelFileName] = useState('');
  const [excelError, setExcelError] = useState('');
  const [mesHoras, setMesHoras] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Función para parsear Excel de entregables
  const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Cargar xlsx dinámicamente si no está cargado
          if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => processExcel(e.target.result, resolve, reject);
            script.onerror = () => reject('Error cargando librería Excel');
            document.head.appendChild(script);
          } else {
            processExcel(e.target.result, resolve, reject);
          }
        } catch (error) {
          reject('Error procesando archivo: ' + error.message);
        }
      };
      reader.onerror = () => reject('Error leyendo archivo');
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcel = (data, resolve, reject) => {
    try {
      const workbook = window.XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

      // Validar columnas requeridas
      if (jsonData.length === 0) {
        reject('El archivo está vacío');
        return;
      }

      const firstRow = jsonData[0];
      const requiredCols = ['Código', 'Descripción', 'Secuencia'];
      const missingCols = requiredCols.filter(col => !(col in firstRow) && !(col.toLowerCase() in firstRow));

      if (missingCols.length > 0) {
        reject(`Faltan columnas: ${missingCols.join(', ')}`);
        return;
      }

      // Parsear datos
      const entregables = jsonData.map((row, index) => ({
        id: index + 1,
        codigo: row['Código'] || row['codigo'] || '',
        nombre: row['Descripción'] || row['descripción'] || row['Nombre'] || row['nombre'] || '',
        secuencia: parseInt(row['Secuencia'] || row['secuencia']) || 1,
        valorRevA: parseFloat(row['REV_A (UF)'] || row['REV_A'] || row['revA'] || 0) || 0,
        valorRevB: parseFloat(row['REV_B (UF)'] || row['REV_B'] || row['revB'] || 0) || 0,
        valorRev0: parseFloat(row['REV_0 (UF)'] || row['REV_0'] || row['rev0'] || 0) || 0,
      }));

      resolve(entregables);
    } catch (error) {
      reject('Error procesando Excel: ' + error.message);
    }
  };

  // Manejar carga de archivo Excel
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFileName(file.name);
    setExcelError('');

    try {
      const entregables = await parseExcelFile(file);
      setNewProject(prev => ({ ...prev, entregables }));
    } catch (error) {
      setExcelError(error);
      setNewProject(prev => ({ ...prev, entregables: [] }));
    }
  };
  
  // Estados para eliminar proyectos
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Estados para editar proyectos
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ id: '', nombre: '', cliente: '', estado: '' });
  
  // Estados para configuración
  const [configTab, setConfigTab] = useState('profesionales');
  const [showNewProfesional, setShowNewProfesional] = useState(false);
  const [newProfesional, setNewProfesional] = useState({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5, email: '', password: '' });
  const [editProfesionalOpen, setEditProfesionalOpen] = useState(false);
  const [profesionalToEdit, setProfesionalToEdit] = useState(null);
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

  // Estado para tab de facturación (debe estar aquí para persistir entre re-renders del heartbeat)
  const [facturacionTab, setFacturacionTab] = useState('entregables'); // 'entregables' | 'edp' | 'cot'

  // Estados COT a nivel de App para que persistan al re-montar (heartbeat cada 30s)
  const [cotLogo, setCotLogo] = useState(null);
  const [cotLogoPreview, setCotLogoPreview] = useState(null);
  const [cotExcelData, setCotExcelData] = useState(null);
  const [cotExcelFileName, setCotExcelFileName] = useState('');
  const [cotShowPreview, setCotShowPreview] = useState(false);
  const [statusData, setStatusData] = useState(() => {
    // Datos iniciales de ejemplo
    const status = {};
    // Inicializar para ENTREGABLES_PROYECTO (compatibilidad)
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
    // Inicializar para entregables de cada proyecto
    PROYECTOS_INICIALES.forEach(proyecto => {
      if (proyecto.entregables) {
        proyecto.entregables.forEach((e, idx) => {
          const key = `${proyecto.id}_${e.id}`;
          status[key] = {
            sentIniciado: idx < 5,
            sentRevA: idx < 3,
            sentRevADate: idx < 3 ? '2026-01-20' : null,
            comentariosARecibidos: idx < 2,
            comentariosARecibidosDate: idx < 2 ? '2026-01-22' : null,
            sentRevB: idx < 2,
            sentRevBDate: idx < 2 ? '2026-01-25' : null,
            comentariosBRecibidos: idx === 0,
            comentariosBRecibidosDate: idx === 0 ? '2026-01-26' : null,
            sentRev0: false,
            sentRev0Date: null,
          };
        });
      }
    });
    return status;
  });
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // ============================================
  // FIRESTORE SUBSCRIPTION para statusData
  // ============================================
  useEffect(() => {
    const unsubStatusData = subscribeToStatusData((data) => {
      if (data && Object.keys(data).length > 0) {
        setStatusData(data);
      }
    });

    return () => unsubStatusData();
  }, []);

  // ============================================
  // PERSISTENCIA - Guardar datos en Firestore (debounced)
  // ============================================
  // Guardar statusData cuando cambie
  useEffect(() => {
    if (firestoreReady && Object.keys(statusData).length > 0) {
      const timer = setTimeout(() => {
        saveStatusData(statusData);
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timer);
    }
  }, [statusData, firestoreReady]);

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
  const handleDeleteProject = async () => {
    if (projectToDelete) {
      // Eliminar de Firestore
      await deleteProyectoFS(projectToDelete.id);

      // También eliminar horas registradas de ese proyecto de Firestore
      const horasDelProyecto = horasRegistradas.filter(h => h.proyecto === projectToDelete.id);
      for (const hora of horasDelProyecto) {
        if (hora._docId) {
          await deleteHoraFS(hora._docId);
        }
      }

      // Si el proyecto eliminado era el seleccionado, deseleccionar
      if (selectedProject === projectToDelete.id) {
        setSelectedProject(null);
      }

      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      showNotification('success', 'Proyecto eliminado');
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
  const handleSaveProject = async () => {
    if (projectToEdit && editProjectData.nombre.trim() && editProjectData.id.trim()) {
      const oldId = projectToEdit.id;
      const newId = editProjectData.id.trim().toUpperCase();

      // Si cambió el ID, eliminar el documento viejo
      if (oldId !== newId) {
        await deleteProyectoFS(oldId);
      }

      // Buscar el proyecto actual para preservar sus datos
      const proyectoActual = proyectos.find(p => p.id === oldId);
      const proyectoActualizado = {
        ...proyectoActual,
        id: newId,
        nombre: editProjectData.nombre.trim(),
        cliente: editProjectData.cliente.trim(),
        estado: editProjectData.estado
      };

      // Guardar en Firestore
      await saveProyecto(proyectoActualizado);

      // Si cambió el id, actualizar referencias en horas registradas
      if (oldId !== newId) {
        const horasActualizadas = horasRegistradas.filter(h => h.proyecto === oldId);
        for (const hora of horasActualizadas) {
          const horaActualizada = { ...hora, proyecto: newId };
          await saveHora(horaActualizada);
        }

        // Si era el proyecto seleccionado, actualizar selección
        if (selectedProject === oldId) {
          setSelectedProject(newId);
        }
      }

      setEditProjectOpen(false);
      setProjectToEdit(null);
      showNotification('success', 'Proyecto actualizado');
    }
  };

  // Categorías de profesionales
  const categoriasProfesional = ['Líder de Proyecto', 'Ingeniero Senior', 'Proyectista', 'Administrativo'];
  
  // Función para obtener iniciales
  const getIniciales = (nombre) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Funciones para gestión de profesionales
  const handleAddProfesional = async () => {
    // Validar campos obligatorios
    if (!newProfesional.nombre.trim() || !newProfesional.cargo.trim()) {
      showNotification('error', 'Nombre y cargo son obligatorios');
      return;
    }
    if (!newProfesional.email.trim() || !newProfesional.password.trim()) {
      showNotification('error', 'Email y contraseña son obligatorios');
      return;
    }

    // Verificar que el email no exista
    const emailExiste = usuarios.find(u => u.email === newProfesional.email.trim());
    if (emailExiste) {
      showNotification('error', 'Este email ya está registrado');
      return;
    }

    const newId = Math.max(...profesionales.map(c => c.id), 0) + 1;
    const nuevoProfesional = {
      id: newId,
      nombre: newProfesional.nombre.trim(),
      cargo: newProfesional.cargo.trim(),
      categoria: newProfesional.categoria,
      tarifaInterna: parseFloat(newProfesional.tarifaInterna) || 0.5,
      iniciales: getIniciales(newProfesional.nombre.trim())
    };

    // Crear usuario para login
    const nuevoUsuario = {
      id: `user${newId}`,
      nombre: newProfesional.nombre.trim(),
      email: newProfesional.email.trim(),
      password: newProfesional.password.trim(),
      rol: 'profesional',
      profesionalId: newId
    };

    // Guardar profesional en Firestore
    await saveColaborador(nuevoProfesional);

    // Agregar usuario al estado
    setUsuarios(prev => [...prev, nuevoUsuario]);

    setNewProfesional({ nombre: '', cargo: '', categoria: 'Proyectista', tarifaInterna: 0.5, email: '', password: '' });
    setShowNewProfesional(false);
    showNotification('success', 'Profesional y usuario creados');
  };

  const handleDeleteProfesional = async (id) => {
    const tieneHoras = horasRegistradas.some(h => h.profesionalId === id);
    if (tieneHoras) {
      showNotification('error', 'No se puede eliminar: este profesional tiene horas registradas.');
      return;
    }
    // Eliminar de Firestore
    await deleteColaboradorFS(id);
    // También eliminar el usuario asociado
    setUsuarios(prev => prev.filter(u => u.profesionalId !== id));
    showNotification('success', 'Profesional y usuario eliminados');
  };
  
  const handleSaveProfesional = async () => {
    if (profesionalToEdit) {
      const profesionalActualizado = {
        ...profesionalToEdit,
        nombre: profesionalToEdit.nombre,
        cargo: profesionalToEdit.cargo,
        categoria: profesionalToEdit.categoria,
        tarifaInterna: parseFloat(profesionalToEdit.tarifaInterna) || 0.5,
        iniciales: getIniciales(profesionalToEdit.nombre)
      };

      // Si se proporcionó una nueva contraseña, actualizarla
      if (profesionalToEdit.newPassword && profesionalToEdit.newPassword.trim() !== '') {
        profesionalActualizado.password = profesionalToEdit.newPassword;
      }
      // Limpiar el campo temporal newPassword antes de guardar
      delete profesionalActualizado.newPassword;

      // Guardar en Firestore
      await saveColaborador(profesionalActualizado);

      setEditProfesionalOpen(false);
      setProfesionalToEdit(null);
      showNotification('success', 'Profesional actualizado');
    }
  };

  // Navegación (filtrada según rol)
  const allNavItems = [
    { id: 'home', label: 'Home', icon: Home, adminOnly: false },
    { id: 'proyectos', label: 'Proyectos', icon: FolderKanban, adminOnly: false },
    { id: 'horas', label: 'Carga HsH', icon: Clock, adminOnly: false },
    { id: 'tareas', label: 'Tareas', icon: ClipboardList, adminOnly: false },
    { id: 'facturacion', label: 'Adm. Proyectos', icon: FileSpreadsheet, adminOnly: true },
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
      const profesional = profesionales.find(c => c.id === h.profesionalId);
      return sum + (h.horas * (profesional?.tarifaInterna || 0));
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
        <h1 className="text-xl sm:text-2xl text-neutral-800 dark:text-neutral-100 font-light mb-1">Bienvenido, {currentUser?.nombre}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">{isAdmin ? 'Administrador • Acceso completo' : 'Profesional • Carga HsH'}</p>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{proyectosActivosVisibles.length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Proyectos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{profesionales.length}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Profesionales</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{resumen.totalHoras}</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Horas mes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usuarios en Línea */}
      {usuariosOnline.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Wifi className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">En Línea Ahora</h2>
            <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{usuariosOnline.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usuariosOnline.map(user => {
              const presencia = presenciaUsuarios.find(p => p.profesionalId === user.id);
              const esYo = user.id === currentUser?.profesionalId;
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                    esYo
                      ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700'
                      : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                  }`}
                  title={`${user.nombre} - ${presencia?.pagina || 'Navegando'}`}
                >
                  <div className="relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      esYo ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}>
                      <span className={`text-xs font-medium ${esYo ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                        {user.nombre?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${esYo ? 'text-orange-700 dark:text-orange-300' : 'text-neutral-700 dark:text-neutral-200'}`}>
                      {user.nombre?.split(' ')[0]}
                      {esYo && <span className="text-[10px] ml-1 opacity-60">(tú)</span>}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{presencia?.pagina || 'Navegando'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas de Vencimiento */}
      {(() => {
        const today = new Date();
        const alertas = [];

        proyectosActivosVisibles.forEach(proyecto => {
          const entregables = proyecto.entregables || [];
          entregables.forEach(ent => {
            if (ent.frozen) return;
            const deadlines = calculateDeadlines(proyecto.inicio || dashboardStartDate, ent.weekStart || ent.secuencia);
            const statusKey = `${proyecto.id}_${ent.id}`;
            const status = statusData[statusKey] || {};

            // Determinar qué revisión está pendiente
            let pendingRev = null;
            let deadline = null;

            if (!status.sentRev0) {
              if (!status.sentRevA) {
                pendingRev = 'REV_A';
                deadline = new Date(deadlines.revA);
              } else if (!status.sentRevB && status.comentariosARecibidos) {
                pendingRev = 'REV_B';
                deadline = new Date(deadlines.revB);
              } else if (status.comentariosBRecibidos) {
                pendingRev = 'REV_0';
                deadline = new Date(deadlines.rev0);
              }
            }

            if (pendingRev && deadline) {
              const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
              if (diffDays <= 7) {
                alertas.push({
                  proyecto: proyecto.id,
                  proyectoNombre: proyecto.nombre,
                  entregable: ent.nombre || ent.codigo,
                  codigo: ent.codigo,
                  revision: pendingRev,
                  deadline: deadline,
                  diffDays: diffDays,
                  atrasado: diffDays < 0
                });
              }
            }
          });
        });

        // Ordenar: primero atrasados, luego por días restantes
        alertas.sort((a, b) => a.diffDays - b.diffDays);

        if (alertas.length === 0) return null;

        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Alertas de Vencimiento</h2>
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alertas.length}</span>
            </div>
            <Card className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {alertas.slice(0, 5).map((alerta, i) => (
                <div key={i} className={`p-3 flex items-center justify-between ${alerta.atrasado ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-mono text-xs">{alerta.proyecto}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alerta.atrasado ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}`}>
                        {alerta.revision}
                      </span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-100 text-sm truncate">{alerta.entregable}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{alerta.codigo}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-sm font-medium ${alerta.atrasado ? 'text-red-600' : alerta.diffDays <= 3 ? 'text-orange-600' : 'text-neutral-600 dark:text-neutral-300'}`}>
                      {alerta.atrasado ? `${Math.abs(alerta.diffDays)}d atrasado` : alerta.diffDays === 0 ? 'Hoy' : `${alerta.diffDays}d restantes`}
                    </p>
                    <p className="text-neutral-400 text-xs">{alerta.deadline.toLocaleDateString('es-CL')}</p>
                  </div>
                </div>
              ))}
              {alertas.length > 5 && (
                <div className="p-2 text-center">
                  <span className="text-neutral-500 dark:text-neutral-400 text-xs">+{alertas.length - 5} alertas más</span>
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* Proyectos Activos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Proyectos Activos</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('proyectos')}>
            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {proyectosActivosVisibles.length === 0 ? (
          <Card className="p-6 text-center">
            <FolderKanban className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {!isAdmin ? 'No tienes proyectos asignados. Contacta al administrador.' : 'No hay proyectos activos.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {proyectosActivosVisibles.map(proyecto => (
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
                    <h3 className="text-neutral-800 dark:text-neutral-100 font-medium mt-1 text-sm sm:text-base truncate">{proyecto.nombre}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">{proyecto.cliente}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500 shrink-0 ml-2" />
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-500 dark:text-neutral-400">
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
                <div className="mt-2 sm:mt-3 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${proyecto.avance}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mis Tareas Pendientes */}
      {(() => {
        const misTareasPendientes = tareas.filter(t =>
          t.asignadoA === currentUser?.profesionalId &&
          t.estado !== 'completada'
        ).sort((a, b) => {
          // Primero por prioridad (alta > media > baja)
          const prioridadOrder = { alta: 0, media: 1, baja: 2 };
          return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
        });

        if (misTareasPendientes.length === 0) return null;

        const getPrioridadColor = (prioridad) => {
          switch (prioridad) {
            case 'alta': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'baja': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-neutral-100 text-neutral-700';
          }
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-500" />
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Mis Tareas Pendientes</h2>
                <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{misTareasPendientes.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('tareas')}>
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Card className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {misTareasPendientes.slice(0, 4).map(tarea => {
                const proyecto = proyectos.find(p => p.id === tarea.proyectoId);
                return (
                  <div
                    key={tarea._docId}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setCurrentPage('tareas')}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                        {proyecto && (
                          <span className="text-orange-500 font-mono text-xs">{proyecto.id}</span>
                        )}
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-100 text-sm truncate mt-1">{tarea.titulo}</p>
                      {tarea.entregableId && (
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs">{tarea.entregableId}</p>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      {tarea.fechaLimite && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(tarea.fechaLimite).toLocaleDateString('es-CL')}
                        </p>
                      )}
                      {(tarea.comentarios?.length || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1 justify-end">
                          <MessageSquare className="w-3 h-3" />
                          {tarea.comentarios.length}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {misTareasPendientes.length > 4 && (
                <div className="p-2 text-center">
                  <span className="text-neutral-500 dark:text-neutral-400 text-xs">+{misTareasPendientes.length - 4} tareas más</span>
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-neutral-700 dark:text-neutral-200 text-sm font-medium mb-3">Accesos Rápidos</h2>
        <div className={`grid gap-2 sm:gap-3 ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <Card
            className="p-3 sm:p-4 text-center"
            onClick={() => setCurrentPage('horas')}
          >
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
            <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Cargar Horas</p>
          </Card>

          {isAdmin && (
            <Card
              className="p-3 sm:p-4 text-center"
              onClick={() => setShowNewProject(true)}
            >
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Nuevo Proyecto</p>
            </Card>
          )}

          {isAdmin && (
            <Card
              className="p-3 sm:p-4 text-center"
              onClick={() => setCurrentPage('facturacion')}
            >
              <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm">Adm. Proyectos</p>
            </Card>
          )}
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
          <h1 className="text-xl text-neutral-800 dark:text-neutral-100 font-light">Proyectos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gestión de proyectos activos e históricos</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowNewProject(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {proyectosVisibles.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {!isAdmin ? 'No tienes proyectos asignados. Contacta al administrador para que te asigne acceso.' : 'No hay proyectos creados.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {proyectosVisibles.map(proyecto => (
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
                    <h3 className="text-neutral-800 dark:text-neutral-100 font-medium">{proyecto.nombre}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{proyecto.cliente}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium">{proyecto.avance.toFixed(1)}%</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">Avance</p>
                  </div>
                  <div className="w-24 sm:w-32 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${proyecto.avance}%` }}
                    />
                  </div>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditProject(proyecto);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Editar proyecto"
                      >
                        <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-500" />
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
                        <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-red-500" />
                      </button>
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================
  // PÁGINA: CARGA DE HORAS
  // ============================================
  const HorasPage = () => {
    const [profesional, setProfesional] = useState('');
    const [proyecto, setProyecto] = useState('');
    const [semana, setSemana] = useState('');
    const [entregable, setEntregable] = useState('');
    const [horas, setHoras] = useState('');
    const [revision, setRevision] = useState('REV_A');
    const [tipoCarga, setTipoCarga] = useState('PLA'); // PLA, DOC, INF, REU, VIS
    const [descripcionCarga, setDescripcionCarga] = useState(''); // Para REU y VIS

    const weeks = getWeeksOfMonth(mesHoras);

    // Entregables dinámicos del proyecto seleccionado
    const proyectoSeleccionado = proyectos.find(p => p.id === proyecto);
    const entregables = proyectoSeleccionado?.entregables || [];

    const esReunionOVisita = ['REU', 'VIS'].includes(tipoCarga);

    const registrarHoras = async () => {
      // Validación diferente para REU/VIS vs otros tipos
      if (esReunionOVisita) {
        if (!profesional || !proyecto || !semana || !descripcionCarga || !horas) {
          showNotification('error', 'Por favor completa todos los campos');
          return;
        }
      } else {
        if (!profesional || !proyecto || !semana || !entregable || !horas) {
          showNotification('error', 'Por favor completa todos los campos');
          return;
        }
      }

      // Verificar duplicados (mismo proyecto + entregable + revisión)
      if (!esReunionOVisita) {
        const duplicado = horasRegistradas.find(h =>
          h.proyectoId === proyecto &&
          h.entregable === entregable &&
          h.revision === revision
        );
        if (duplicado) {
          const fechaDup = new Date(duplicado.fecha).toLocaleDateString('es-CL');
          const confirmar = window.confirm(
            `⚠️ ALERTA DE DUPLICADO\n\n` +
            `Ya existe un registro para:\n` +
            `• Proyecto: ${proyecto}\n` +
            `• Entregable: ${entregable}\n` +
            `• Revisión: ${revision}\n` +
            `• Fecha anterior: ${fechaDup}\n\n` +
            `¿Deseas registrar de todas formas?`
          );
          if (!confirmar) return;
        }
      }

      // Crear fecha basada en el mes seleccionado (día 15 del mes para evitar problemas de timezone)
      const [yearSel, monthSel] = mesHoras.split('-').map(Number);
      const fechaRegistro = new Date(yearSel, monthSel - 1, 15);

      const nuevoRegistro = {
        id: Date.now(),
        profesionalId: parseInt(profesional),
        proyectoId: proyecto,
        semana: parseInt(semana),
        tipo: tipoCarga,
        entregable: esReunionOVisita ? descripcionCarga : entregable,
        revision: esReunionOVisita ? null : revision,
        horas: parseFloat(horas),
        fecha: fechaRegistro.toISOString(),
        mesRegistro: mesHoras, // Guardar también el mes explícitamente
      };

      // Guardar en Firestore
      await saveHora(nuevoRegistro);

      setHoras('');
      setEntregable('');
      setDescripcionCarga('');
      setSemana('');
      showNotification('success', 'Horas registradas correctamente');
    };
    
    const horasDelMes = horasRegistradas.filter(h => {
      const fecha = new Date(h.fecha);
      const [yearSel, monthSel] = mesHoras.split('-').map(Number);
      // Filtrar por el mes seleccionado
      return fecha.getMonth() === (monthSel - 1) && fecha.getFullYear() === yearSel;
    });
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl text-neutral-800 dark:text-neutral-100 font-medium">Carga HsH</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Registro semanal por proyecto</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const [y, m] = mesHoras.split('-').map(Number);
                const prev = new Date(y, m - 2, 1);
                setMesHoras(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 min-w-[100px] text-center">
              {new Date(mesHoras + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const [y, m] = mesHoras.split('-').map(Number);
                const next = new Date(y, m, 1);
                setMesHoras(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Formulario */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm p-3 sm:p-4 lg:col-span-1">
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">Registrar Horas</h2>
            <div className="space-y-3 sm:space-y-4">
              <Select label="Profesional" value={profesional} onChange={e => setProfesional(e.target.value)}>
                <option value="">Seleccionar...</option>
                {profesionales.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
              
              <Select label="Proyecto" value={proyecto} onChange={e => { setProyecto(e.target.value); setEntregable(''); }}>
                <option value="">{proyectosActivosVisibles.length === 0 ? 'Sin proyectos asignados' : 'Seleccionar...'}</option>
                {proyectosActivosVisibles.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                ))}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                <Select label="Tipo" value={tipoCarga} onChange={e => setTipoCarga(e.target.value)}>
                  <option value="DOC">DOC</option>
                  <option value="PLA">PLA</option>
                  <option value="INF">INF</option>
                  <option value="REU">REU</option>
                  <option value="VIS">VIS</option>
                </Select>

                <Select label="Semana" value={semana} onChange={e => setSemana(e.target.value)}>
                  <option value="">Sem...</option>
                  {weeks.map(w => (
                    <option key={w.num} value={w.num}>S{w.num}</option>
                  ))}
                </Select>
              </div>

              {/* Revisión solo para DOC, PLA, INF */}
              {!esReunionOVisita && (
                <Select label="Revisión" value={revision} onChange={e => setRevision(e.target.value)}>
                  <option value="REV_A">REV_A</option>
                  <option value="REV_B">REV_B</option>
                  <option value="REV_0">REV_0</option>
                </Select>
              )}

              {/* Entregable solo para DOC, PLA, INF */}
              {!esReunionOVisita ? (
                <Select label="Entregable" value={entregable} onChange={e => setEntregable(e.target.value)}>
                  <option value="">
                    {!proyecto ? 'Primero selecciona un proyecto...' :
                     entregables.length === 0 ? 'Este proyecto no tiene entregables' :
                     'Seleccionar...'}
                  </option>
                  {entregables.map(ent => (
                    <option key={ent.id || ent.codigo} value={ent.nombre || ent}>
                      {ent.codigo ? `${ent.codigo} - ${ent.nombre}` : ent}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label={tipoCarga === 'REU' ? 'Descripción Reunión' : 'Descripción Visita'}
                  type="text"
                  value={descripcionCarga}
                  onChange={e => setDescripcionCarga(e.target.value)}
                  placeholder={tipoCarga === 'REU' ? 'Ej: Reunión coordinación cliente' : 'Ej: Visita terreno fiscalización'}
                />
              )}
              
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
            <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">
              Horas - {new Date(mesHoras + '-01').toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
            </h2>
            
            {horasDelMes.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-neutral-500 dark:text-neutral-400">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <p className="text-sm">No hay horas registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr className="text-neutral-500 dark:text-neutral-400 text-xs uppercase border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left p-2">Col</th>
                      <th className="text-left p-2">Proy</th>
                      <th className="text-left p-2">Entregable</th>
                      <th className="text-center p-2">Rev</th>
                      <th className="text-center p-2">Sem</th>
                      <th className="text-right p-2">Hrs</th>
                      <th className="text-right p-2">UF</th>
                      {isAdmin && <th className="text-center p-2 w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {horasDelMes.map(h => {
                      // Para registros antiguos con 'admin', buscar a Sebastián (SV)
                      // Usar == para manejar "3" (string) y 3 (número)
                      const col = h.profesionalId === 'admin'
                        ? profesionales.find(c => c.iniciales === 'SV')
                        : profesionales.find(c => c.id == h.profesionalId);
                      return (
                        <tr key={h.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800/50">
                          <td className="p-2 text-neutral-800 dark:text-neutral-100">{col?.iniciales}</td>
                          <td className="p-2 text-orange-600 font-mono text-xs">{h.proyectoId}</td>
                          <td className="p-2 text-neutral-600 dark:text-neutral-300 truncate max-w-[120px]">{h.entregable}</td>
                          <td className="p-2 text-center"><Badge>{h.revision}</Badge></td>
                          <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">S{h.semana}</td>
                          <td className="p-2 text-right text-neutral-800 dark:text-neutral-100">{h.horas}</td>
                          <td className="p-2 text-right text-green-600">{(h.horas * (col?.tarifaInterna || 0)).toFixed(2)}</td>
                          {isAdmin && (
                            <td className="p-2 text-center">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`¿Eliminar registro de ${col?.iniciales || 'N/A'}?\n${h.entregable} - ${h.horas}hrs`)) {
                                    await deleteHoraFS(h._docId || h.id);
                                    showNotification('success', 'Registro eliminado');
                                  }
                                }}
                                className="p-1 hover:bg-red-100 rounded text-neutral-400 hover:text-red-500 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-neutral-300 font-medium bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={5} className="p-2 text-right text-neutral-500 dark:text-neutral-400">Total:</td>
                      <td className="p-2 text-right text-neutral-800 dark:text-neutral-100">{horasDelMes.reduce((s, h) => s + parseFloat(h.horas), 0)}</td>
                      <td className="p-2 text-right text-green-600">
                        {horasDelMes.reduce((s, h) => {
                          // Manejar registros con 'admin' (buscar SV)
                          const col = h.profesionalId === 'admin'
                            ? profesionales.find(c => c.iniciales === 'SV')
                            : profesionales.find(c => c.id == h.profesionalId);
                          return s + (parseFloat(h.horas) * (col?.tarifaInterna || 0));
                        }, 0).toFixed(2)}
                      </td>
                      {isAdmin && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </div>
        
        {/* Resumen por profesional */}
        <Card className="p-3 sm:p-4">
          <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-3 sm:mb-4">Resumen por Profesional</h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {profesionales.map(col => {
              // Para Sebastián (SV), incluir también registros antiguos con profesionalId 'admin'
              // Usar == para comparar números/strings y manejar 'admin'
              const horasCol = horasDelMes.filter(h =>
                h.profesionalId == col.id ||
                (col.iniciales === 'SV' && h.profesionalId === 'admin')
              );
              const totalHoras = horasCol.reduce((s, h) => s + parseFloat(h.horas), 0);
              const totalCosto = totalHoras * col.tarifaInterna;
              
              return (
                <div key={col.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-700">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-500 font-bold text-sm sm:text-base">{col.iniciales}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium text-sm truncate">{col.nombre}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">{col.categoria}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-neutral-800 dark:text-neutral-100 font-medium text-sm">{totalHoras} hrs</p>
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
  // PÁGINA: TAREAS
  // ============================================
  const TareasPage = () => {
    const [showNewTarea, setShowNewTarea] = useState(false);
    const [selectedTarea, setSelectedTarea] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todas'); // todas, pendiente, en_progreso, completada

    // Estados para nueva tarea
    const [nuevaTarea, setNuevaTarea] = useState({
      titulo: '',
      descripcion: '',
      asignadoA: '',
      proyectoId: '',
      entregableId: '',
      prioridad: 'media', // baja, media, alta
      fechaLimite: ''
    });

    // Filtrar tareas según rol
    const misTareas = isAdmin
      ? tareas
      : tareas.filter(t => t.asignadoA === currentUser?.profesionalId);

    // Filtrar por estado
    const tareasFiltradas = filtroEstado === 'todas'
      ? misTareas
      : misTareas.filter(t => t.estado === filtroEstado);

    // Ordenar por fecha de creación (más recientes primero)
    const tareasOrdenadas = [...tareasFiltradas].sort((a, b) =>
      new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
    );

    const crearTarea = async () => {
      if (!nuevaTarea.titulo || !nuevaTarea.asignadoA) {
        showNotification('error', 'Título y asignado son requeridos');
        return;
      }

      const tarea = {
        ...nuevaTarea,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        creadoPor: currentUser.profesionalId,
        comentarios: []
      };

      const success = await saveTarea(tarea);
      if (success) {
        showNotification('success', 'Tarea creada exitosamente');
        setShowNewTarea(false);
        setNuevaTarea({
          titulo: '',
          descripcion: '',
          asignadoA: '',
          proyectoId: '',
          entregableId: '',
          prioridad: 'media',
          fechaLimite: ''
        });
      } else {
        showNotification('error', 'Error al crear la tarea');
      }
    };

    const cambiarEstadoTarea = async (tarea, nuevoEstado) => {
      const tareaActualizada = { ...tarea, estado: nuevoEstado };
      if (nuevoEstado === 'completada') {
        tareaActualizada.fechaCompletada = new Date().toISOString();
      }
      const success = await saveTarea(tareaActualizada);
      if (success) {
        showNotification('success', `Tarea marcada como ${nuevoEstado.replace('_', ' ')}`);
        if (selectedTarea?._docId === tarea._docId) {
          setSelectedTarea(tareaActualizada);
        }
      }
    };

    const agregarComentario = async () => {
      if (!nuevoComentario.trim() || !selectedTarea) return;

      const comentario = {
        id: Date.now(),
        texto: nuevoComentario,
        autorId: currentUser.profesionalId,
        fecha: new Date().toISOString()
      };

      const tareaActualizada = {
        ...selectedTarea,
        comentarios: [...(selectedTarea.comentarios || []), comentario]
      };

      const success = await saveTarea(tareaActualizada);
      if (success) {
        setSelectedTarea(tareaActualizada);
        setNuevoComentario('');
        showNotification('success', 'Comentario agregado');
      }
    };

    const eliminarTarea = async (tareaId) => {
      if (!window.confirm('¿Eliminar esta tarea?')) return;
      const success = await deleteTareaFS(tareaId);
      if (success) {
        showNotification('success', 'Tarea eliminada');
        setSelectedTarea(null);
      }
    };

    const getPrioridadColor = (prioridad) => {
      switch (prioridad) {
        case 'alta': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'baja': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-neutral-100 text-neutral-700';
      }
    };

    const getEstadoColor = (estado) => {
      switch (estado) {
        case 'pendiente': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'en_progreso': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'completada': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default: return 'bg-neutral-100 text-neutral-700';
      }
    };

    const getEstadoLabel = (estado) => {
      switch (estado) {
        case 'pendiente': return 'Pendiente';
        case 'en_progreso': return 'En Progreso';
        case 'completada': return 'Completada';
        default: return estado;
      }
    };

    // Obtener entregables del proyecto seleccionado
    const proyectoSeleccionado = proyectos.find(p => p.id === nuevaTarea.proyectoId);
    const entregablesProyecto = proyectoSeleccionado?.entregables || [];

    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Tareas</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                {isAdmin ? 'Gestiona las tareas del equipo' : 'Mis tareas asignadas'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Filtro de estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completadas</option>
            </select>

            {isAdmin && (
              <Button onClick={() => setShowNewTarea(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </Button>
            )}
          </div>
        </div>

        {/* Grid de tareas */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Lista de tareas */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 text-neutral-800 dark:text-neutral-200">
              {filtroEstado === 'todas' ? 'Todas las tareas' : `Tareas ${getEstadoLabel(filtroEstado).toLowerCase()}`}
              <span className="ml-2 text-sm text-neutral-500">({tareasOrdenadas.length})</span>
            </h3>

            {tareasOrdenadas.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No hay tareas para mostrar</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {tareasOrdenadas.map(tarea => {
                  const asignado = profesionales.find(p => p.id === tarea.asignadoA);
                  const proyecto = proyectos.find(p => p.id === tarea.proyectoId);
                  const isSelected = selectedTarea?._docId === tarea._docId;

                  return (
                    <div
                      key={tarea._docId}
                      onClick={() => setSelectedTarea(tarea)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {tarea.titulo}
                          </h4>
                          {tarea.descripcion && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                              {tarea.descripcion}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getPrioridadColor(tarea.prioridad)}`}>
                          {tarea.prioridad}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${getEstadoColor(tarea.estado)}`}>
                          {getEstadoLabel(tarea.estado)}
                        </span>
                        {proyecto && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            📁 {proyecto.nombre}
                          </span>
                        )}
                        {asignado && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            👤 {asignado.nombre?.split(' ')[0]}
                          </span>
                        )}
                        {(tarea.comentarios?.length || 0) > 0 && (
                          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {tarea.comentarios.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Detalle de tarea seleccionada */}
          <Card className="p-4">
            {selectedTarea ? (
              <div className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                      {selectedTarea.titulo}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getEstadoColor(selectedTarea.estado)}`}>
                        {getEstadoLabel(selectedTarea.estado)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPrioridadColor(selectedTarea.prioridad)}`}>
                        Prioridad: {selectedTarea.prioridad}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => eliminarTarea(selectedTarea._docId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {selectedTarea.descripcion && (
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {selectedTarea.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div>
                    <span className="text-neutral-500">Asignado a:</span>
                    <p className="font-medium">{profesionales.find(p => p.id === selectedTarea.asignadoA)?.nombre || '-'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Proyecto:</span>
                    <p className="font-medium">{proyectos.find(p => p.id === selectedTarea.proyectoId)?.nombre || '-'}</p>
                  </div>
                  {selectedTarea.entregableId && (
                    <div>
                      <span className="text-neutral-500">Entregable:</span>
                      <p className="font-medium">{selectedTarea.entregableId}</p>
                    </div>
                  )}
                  {selectedTarea.fechaLimite && (
                    <div>
                      <span className="text-neutral-500">Fecha límite:</span>
                      <p className="font-medium">{new Date(selectedTarea.fechaLimite).toLocaleDateString('es-CL')}</p>
                    </div>
                  )}
                </div>

                {/* Botones de cambio de estado */}
                <div className="flex gap-2 mb-4">
                  {selectedTarea.estado !== 'pendiente' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'pendiente')}
                      className="flex-1 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Pendiente
                    </button>
                  )}
                  {selectedTarea.estado !== 'en_progreso' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'en_progreso')}
                      className="flex-1 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      En Progreso
                    </button>
                  )}
                  {selectedTarea.estado !== 'completada' && (
                    <button
                      onClick={() => cambiarEstadoTarea(selectedTarea, 'completada')}
                      className="flex-1 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                </div>

                {/* Comentarios */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h4 className="font-medium text-sm mb-2 text-neutral-700 dark:text-neutral-300">
                    Comentarios ({selectedTarea.comentarios?.length || 0})
                  </h4>

                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[200px]">
                    {(selectedTarea.comentarios || []).map(comentario => {
                      const autor = profesionales.find(p => p.id === comentario.autorId);
                      return (
                        <div
                          key={comentario.id}
                          className={`p-2 rounded-lg text-sm ${
                            comentario.autorId === currentUser?.profesionalId
                              ? 'bg-purple-100 dark:bg-purple-900/30 ml-4'
                              : 'bg-neutral-100 dark:bg-neutral-800 mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-xs">
                              {autor?.nombre?.split(' ')[0] || 'Usuario'}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(comentario.fecha).toLocaleDateString('es-CL', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300">{comentario.texto}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input de nuevo comentario */}
                  <div className="flex gap-2 mt-auto">
                    <input
                      type="text"
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && agregarComentario()}
                      placeholder="Escribe un comentario..."
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    />
                    <button
                      onClick={agregarComentario}
                      disabled={!nuevoComentario.trim()}
                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Selecciona una tarea para ver los detalles</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Modal Nueva Tarea */}
        {showNewTarea && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nueva Tarea</h3>
                <button onClick={() => setShowNewTarea(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    placeholder="Ej: Revisar planos estructurales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 h-20 resize-none"
                    placeholder="Detalles adicionales..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Asignar a *</label>
                  <select
                    value={nuevaTarea.asignadoA}
                    onChange={(e) => setNuevaTarea({...nuevaTarea, asignadoA: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                  >
                    <option value="">Seleccionar profesional</option>
                    {profesionales.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Proyecto</label>
                    <select
                      value={nuevaTarea.proyectoId}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, proyectoId: e.target.value, entregableId: ''})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    >
                      <option value="">Opcional</option>
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Entregable</label>
                    <select
                      value={nuevaTarea.entregableId}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, entregableId: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                      disabled={!nuevaTarea.proyectoId}
                    >
                      <option value="">Opcional</option>
                      {entregablesProyecto.map(e => (
                        <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prioridad</label>
                    <select
                      value={nuevaTarea.prioridad}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, prioridad: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha límite</label>
                    <input
                      type="date"
                      value={nuevaTarea.fechaLimite}
                      onChange={(e) => setNuevaTarea({...nuevaTarea, fechaLimite: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowNewTarea(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={crearTarea} className="flex-1">
                  Crear Tarea
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // PÁGINA: FACTURACIÓN (PROTEGIDA) - Gestión de Entregables + EDP
  // ============================================
  // NUEVO MODELO: Entregables × Tipo × Revisión
  // Precios base: CRD/EETT/MTO = 40 UF, Detalle = 25 UF, Plano General = 20 UF
  // Revisiones: REV_A = 70%, REV_B = 20%, REV_0 = 10%
  // ============================================
  // Estados COT archivos y preview están a nivel de App, solo texto aquí para evitar re-renders globales
  const FacturacionPage = () => {
    // Estados locales de COT (texto) - no causan re-render de App
    const [cotCliente, setCotCliente] = useState('');
    const [cotProyectoNombre, setCotProyectoNombre] = useState('');
    const [cotGenerando, setCotGenerando] = useState(false);
    // cotShowPreview viene del nivel de App para persistir entre re-renders del heartbeat

    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showPreview, setShowPreview] = useState(false);
    const [selectedProyectoEDP, setSelectedProyectoEDP] = useState('all');
    // Usar estado del padre para evitar reset al re-render
    const selectedProyectoEdit = selectedProyectoFacturacion || proyectos[0]?.id || '';
    const setSelectedProyectoEdit = setSelectedProyectoFacturacion;
    const [editingEntregable, setEditingEntregable] = useState(null);
    const [showAddEntregable, setShowAddEntregable] = useState(false);
    const [edpObservaciones, setEdpObservaciones] = useState({});

    // Precios base por tipo de documento (editables en el futuro)
    const PRECIOS_BASE = {
      CRD: 40,   // Criterios de Diseño
      EETT: 40,  // Especificaciones Técnicas (SPE)
      MTO: 40,   // Materiales Take Off
      DETALLE: 25, // Planos de Detalle
      GENERAL: 20  // Planos Generales
    };

    // Porcentajes por revisión
    const PORCENTAJES_REV = {
      A: 0.70,  // REV_A = 70%
      B: 0.20,  // REV_B = 20%
      '0': 0.10 // REV_0 = 10%
    };

    // Función para determinar el tipo de documento
    // Tipos de entregable
    const TIPOS_ENTREGABLE = [
      { id: 'DOC', nombre: 'Documento', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
      { id: 'PLA', nombre: 'Plano', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
      { id: 'INF', nombre: 'Informe', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
      { id: 'REU', nombre: 'Reunión', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
      { id: 'VIS', nombre: 'Visita', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' }
    ];

    const getTipoDocumento = (codigo, nombre, tipoManual) => {
      // Si tiene tipo manual asignado, usarlo
      if (tipoManual && ['DOC', 'PLA', 'INF', 'REU', 'VIS'].includes(tipoManual)) {
        return tipoManual;
      }

      const cod = (codigo || '').toUpperCase();
      const nom = (nombre || '').toUpperCase();

      // Auto-mapeo por código
      // CRD, EETT(SPE), MTO → DOC
      if (cod.includes('CRD') || cod.includes('SPE') || cod.includes('MTO') || cod.includes('ERD')) return 'DOC';

      // DET, PLA, ARQ → PLA
      if (cod.includes('DET') || cod.includes('PLA') || cod.includes('ARQ') || nom.includes('DETALLE') || nom.includes('PLANO')) return 'PLA';

      // Por defecto es Plano
      return 'PLA';
    };

    const getTipoColor = (tipo) => {
      const tipoObj = TIPOS_ENTREGABLE.find(t => t.id === tipo);
      return tipoObj?.color || 'bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300';
    };

    // Nuevo estado para agregar entregable en línea
    const [nuevoEntregable, setNuevoEntregable] = useState({
      codigo: '',
      nombre: '',
      tipo: 'PLA',
      secuencia: 1,
      weekStart: 1,
      valorRevA: 0,
      valorRevB: 0,
      valorRev0: 0,
      hshDirecto: 0  // Para REU y VIS (sin revisiones)
    });

    // Estado para confirmación de congelamiento
    const [freezeConfirm, setFreezeConfirm] = useState({ show: false, proyectoId: null, entregableId: null, nombre: '' });

    // Estado para confirmación de eliminación de entregable
    const [deleteEntregableConfirm, setDeleteEntregableConfirm] = useState({ show: false, proyectoId: null, entregableId: null, nombre: '' });

    // Función para obtener entregables del proyecto seleccionado
    const getEntregablesProyecto = (proyectoId) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return [];
      return proyecto.entregables?.length > 0 ? proyecto.entregables : [];
    };

    // Función para actualizar un entregable
    const updateEntregable = async (proyectoId, entregableId, updates) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      let entregablesActualizados = (proyecto.entregables || []).map(e =>
        e.id === entregableId ? { ...e, ...updates } : e
      );

      // Si se actualizó weekStart, reordenar por semana
      if (updates.weekStart !== undefined) {
        entregablesActualizados = entregablesActualizados
          .sort((a, b) => (a.weekStart || a.secuencia || 1) - (b.weekStart || b.secuencia || 1));
      }

      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('success', 'Entregable actualizado');
    };

    // Función para agregar entregable en línea
    const addEntregable = async (proyectoId) => {
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const maxId = Math.max(0, ...(proyecto.entregables || []).map(e => e.id));
      const esHshDirecto = ['REU', 'VIS'].includes(nuevoEntregable.tipo);

      const nuevoEnt = {
        id: maxId + 1,
        codigo: nuevoEntregable.codigo,
        nombre: nuevoEntregable.nombre,
        tipo: nuevoEntregable.tipo,
        secuencia: parseInt(nuevoEntregable.secuencia) || 1,
        weekStart: parseInt(nuevoEntregable.weekStart) || 1,
        // Para REU/VIS: usar hshDirecto; para otros: usar REV_A, REV_B, REV_0
        valorRevA: esHshDirecto ? parseFloat(nuevoEntregable.hshDirecto) || 0 : parseFloat(nuevoEntregable.valorRevA) || 0,
        valorRevB: esHshDirecto ? 0 : parseFloat(nuevoEntregable.valorRevB) || 0,
        valorRev0: esHshDirecto ? 0 : parseFloat(nuevoEntregable.valorRev0) || 0,
        hshDirecto: esHshDirecto,
        frozen: false
      };

      // Agregar y ordenar por semana (weekStart)
      const entregablesActualizados = [...(proyecto.entregables || []), nuevoEnt]
        .sort((a, b) => (a.weekStart || a.secuencia || 1) - (b.weekStart || b.secuencia || 1));
      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);

      // Inicializar statusData para el nuevo entregable
      const key = `${proyectoId}_${nuevoEnt.id}`;
      setStatusData(prev => ({
        ...prev,
        [key]: {
          sentIniciado: false,
          sentRevA: false,
          sentRevADate: null,
          comentariosARecibidos: false,
          comentariosARecibidosDate: null,
          sentRevB: false,
          sentRevBDate: null,
          comentariosBRecibidos: false,
          comentariosBRecibidosDate: null,
          sentRev0: false,
          sentRev0Date: null,
        }
      }));

      // Limpiar formulario
      setNuevoEntregable({ codigo: '', nombre: '', tipo: 'PLA', secuencia: 1, weekStart: 1, valorRevA: 0, valorRevB: 0, valorRev0: 0, hshDirecto: 0 });
      setShowAddEntregable(false);
      showNotification('success', 'Entregable agregado');
    };

    // Función para mostrar confirmación de congelamiento
    const showFreezeConfirm = (proyectoId, entregableId, nombre) => {
      setFreezeConfirm({ show: true, proyectoId, entregableId, nombre });
    };

    // Función para congelar/descongelar entregable
    const toggleFreezeEntregable = async () => {
      const { proyectoId, entregableId } = freezeConfirm;
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const entregablesActualizados = (proyecto.entregables || []).map(e =>
        e.id === entregableId ? { ...e, frozen: !e.frozen } : e
      );

      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('info', entregablesActualizados.find(e => e.id === entregableId)?.frozen ? 'Entregable congelado' : 'Entregable descongelado');
      setFreezeConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' });
    };

    // Función para mostrar confirmación de eliminación
    const showDeleteEntregableConfirm = (proyectoId, entregableId, nombre) => {
      setDeleteEntregableConfirm({ show: true, proyectoId, entregableId, nombre });
    };

    // Función para eliminar entregable
    const deleteEntregable = async () => {
      const { proyectoId, entregableId } = deleteEntregableConfirm;
      const proyecto = proyectos.find(p => p.id === proyectoId);
      if (!proyecto) return;

      const entregablesActualizados = (proyecto.entregables || []).filter(e => e.id !== entregableId);
      const proyectoActualizado = { ...proyecto, entregables: entregablesActualizados };
      await saveProyecto(proyectoActualizado);
      showNotification('success', 'Entregable eliminado');
      setDeleteEntregableConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' });
    };

    // Función para calcular EDP por entregables del mes (usando valores del Excel)
    const calcularEDPEntregables = () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const entregablesDelMes = [];

      // Recorrer todos los proyectos
      proyectos.forEach(proyecto => {
        if (selectedProyectoEDP !== 'all' && proyecto.id !== selectedProyectoEDP) return;

        const entregablesProyecto = proyecto.entregables || [];
        if (entregablesProyecto.length === 0) return;

        entregablesProyecto.forEach(entregable => {
          // Ignorar entregables congelados
          if (entregable.frozen) return;

          const statusKey = `${proyecto.id}_${entregable.id}`;
          const status = statusData[statusKey];
          if (!status) return;

          const tipo = getTipoDocumento(entregable.codigo, entregable.nombre);

          // Verificar REV_A - usar valor del Excel
          if (status.sentRevADate && entregable.valorRevA > 0) {
            const fecha = new Date(status.sentRevADate);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_A`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: 'A',
                fecha: status.sentRevADate,
                valor: entregable.valorRevA,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }

          // Verificar REV_B - usar valor del Excel
          if (status.sentRevBDate && entregable.valorRevB > 0) {
            const fecha = new Date(status.sentRevBDate);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_B`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: 'B',
                fecha: status.sentRevBDate,
                valor: entregable.valorRevB,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }

          // Verificar REV_0 - usar valor del Excel
          if (status.sentRev0Date && entregable.valorRev0 > 0) {
            const fecha = new Date(status.sentRev0Date);
            if (fecha.getMonth() === month - 1 && fecha.getFullYear() === year) {
              const obsKey = `${proyecto.id}_${entregable.id}_0`;
              entregablesDelMes.push({
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                entregableId: entregable.id,
                codigo: entregable.codigo || '-',
                nombre: entregable.nombre,
                tipo,
                revision: '0',
                fecha: status.sentRev0Date,
                valor: entregable.valorRev0,
                observacion: edpObservaciones[obsKey] || ''
              });
            }
          }
        });
      });

      // Agregar VIS y REU de Sebastián al EDP
      // Solo se incluyen las cargadas por Sebastián (profesionalId 3 o 'admin')
      horasRegistradas.forEach(hora => {
        // Solo VIS y REU
        if (hora.tipo !== 'VIS' && hora.tipo !== 'REU') return;

        // Solo de Sebastián
        const esDeSebastian = hora.profesionalId === 3 || hora.profesionalId === 'admin';
        if (!esDeSebastian) return;

        // Verificar que sea del mes seleccionado
        const fechaHora = new Date(hora.fecha);
        if (fechaHora.getMonth() !== month - 1 || fechaHora.getFullYear() !== year) return;

        // Filtrar por proyecto si hay uno seleccionado
        if (selectedProyectoEDP !== 'all' && hora.proyectoId !== selectedProyectoEDP) return;

        // Buscar el nombre del proyecto
        const proyecto = proyectos.find(p => p.id === hora.proyectoId);
        const proyectoNombre = proyecto ? proyecto.nombre : hora.proyectoId;

        const entregableId = `hsh_${hora.id}`;
        const revision = '-';
        const obsKey = `${hora.proyectoId}_${entregableId}_${revision}`;
        entregablesDelMes.push({
          proyectoId: hora.proyectoId,
          proyectoNombre: proyectoNombre,
          entregableId: entregableId,
          codigo: '-',
          nombre: hora.entregable || (hora.tipo === 'VIS' ? 'Visita' : 'Reunión'),
          tipo: hora.tipo,
          revision: revision,
          fecha: hora.fecha.split('T')[0], // Solo la fecha sin la hora
          valor: hora.horas,
          observacion: edpObservaciones[obsKey] || '',
          esHsH: true // Marcador para identificar que viene de HsH
        });
      });

      // Ordenar por fecha
      entregablesDelMes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      return entregablesDelMes;
    };

    // Agrupar por proyecto
    const agruparPorProyecto = (entregables) => {
      const grupos = {};
      entregables.forEach(e => {
        if (!grupos[e.proyectoId]) {
          grupos[e.proyectoId] = {
            nombre: e.proyectoNombre,
            entregables: [],
            totalUF: 0
          };
        }
        grupos[e.proyectoId].entregables.push(e);
        grupos[e.proyectoId].totalUF += e.valor;
      });
      return grupos;
    };

    // Exportar a XLSX (formato según Excel del usuario)
    const exportarXLSX = async () => {
      const entregables = calcularEDPEntregables();
      if (entregables.length === 0) {
        showNotification('warning', 'No hay datos para exportar');
        return;
      }

      // Cargar XLSX si no está disponible
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const mesNombre = new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

      // Calcular totales para el resumen
      let totalProyectoHsH = 0;
      let mesAnteriorHsH = 0;
      const mesEnCursoHsH = entregables.reduce((s, e) => s + e.valor, 0);

      const porProyectoExcel = agruparPorProyecto(entregables);
      Object.entries(porProyectoExcel).forEach(([pid, pdata]) => {
        const proyecto = proyectos.find(p => p.id === pid);
        if (proyecto && proyecto.entregables) {
          proyecto.entregables.forEach(ent => {
            if (!ent.frozen) {
              totalProyectoHsH += (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
              const avanceAnterior = (ent.avanceAnterior || 0) / 100;
              const valorTotal = (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
              mesAnteriorHsH += valorTotal * avanceAnterior;
            }
          });
        }
      });
      const totalPendienteHsH = Math.max(0, totalProyectoHsH - mesAnteriorHsH - mesEnCursoHsH);

      // Obtener jefe de proyecto si hay un proyecto seleccionado
      const proyectoSelEDP = selectedProyectoEDP !== 'all' ? proyectos.find(p => p.id === selectedProyectoEDP) : null;
      const jefeProyectoNombre = proyectoSelEDP?.jefeProyecto || '';

      // Crear datos para Excel (formato del usuario: C.COSTO, TIPO, CODIGO, DESCRIPCIÓN, REV, FECHA, HsH, OBS)
      const data = [
        ['ESTADO DE PAGO - ' + mesNombre.toUpperCase()],
        [''],
        ['C. COSTO', 'TIPO', 'CÓDIGO', 'DESCRIPCIÓN', 'REV', 'FECHA ENVÍO', 'HsH', 'OBS'],
        ...entregables.map(e => [
          e.proyectoId,      // Centro de Costo = código proyecto
          e.tipo,
          e.codigo,
          e.nombre,
          e.esHsH ? '-' : 'REV_' + e.revision, // VIS/REU no tienen revisión
          e.fecha,
          e.valor.toFixed(2), // HsH directo
          e.observacion || ''
        ]),
        [''],
        ['', '', '', '', '', 'TOTAL:', mesEnCursoHsH.toFixed(2) + ' HsH', ''],
        [''],
        [''],
        ['RESUMEN DE HORAS'],
        ['Total Proyecto:', totalProyectoHsH.toFixed(1) + ' HsH'],
        ['Mes Anterior:', mesAnteriorHsH.toFixed(1) + ' HsH'],
        ['Mes en Curso:', mesEnCursoHsH.toFixed(1) + ' HsH'],
        ['Total Pendiente:', totalPendienteHsH.toFixed(1) + ' HsH'],
        [''],
        ['FACTURACIÓN'],
        ['HsH Mes en Curso:', mesEnCursoHsH.toFixed(1)],
        ['Factor:', '1,5'],
        ['Valor Bruto HsH:', (mesEnCursoHsH * 1.5).toFixed(1)],
        [''],
        [''],
        ['_______________________________', '', '', '_______________________________'],
        ['Jefe de Proyecto' + (selectedProyectoEDP !== 'all' ? ' ' + selectedProyectoEDP : ''), '', '', 'Líder de Arquitectura'],
        [jefeProyectoNombre, '', '', 'Sebastián A. Vizcarra']
      ];

      const ws = window.XLSX.utils.aoa_to_sheet(data);

      // Ajustar anchos de columnas
      ws['!cols'] = [
        { wch: 10 }, // C. Costo
        { wch: 10 }, // Tipo
        { wch: 18 }, // Código
        { wch: 40 }, // Descripción
        { wch: 8 },  // Rev
        { wch: 12 }, // Fecha
        { wch: 10 }, // UF
        { wch: 25 }  // OBS
      ];

      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, 'EDP ' + mesNombre);

      // Descargar archivo
      const fileName = `EDP_${selectedMonth}.xlsx`;
      window.XLSX.writeFile(wb, fileName);
      showNotification('success', 'Excel exportado correctamente');
    };

    // Obtener entregables del proyecto seleccionado para la pestaña de gestión
    const entregablesEditProyecto = getEntregablesProyecto(selectedProyectoEdit);
    const proyectoEdit = proyectos.find(p => p.id === selectedProyectoEdit);

    // Datos para EDP
    const edpData = calcularEDPEntregables();
    const porProyecto = agruparPorProyecto(edpData);
    const totalGeneral = edpData.reduce((s, e) => s + e.valor, 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl text-neutral-800 dark:text-neutral-100 font-light">Administración de Proyectos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Gestión de entregables, EDP y control de proyectos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-200 dark:bg-neutral-700 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFacturacionTab('entregables')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'entregables'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            Entregables
          </button>
          <button
            onClick={() => setFacturacionTab('edp')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'edp'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            EDP
          </button>
          <button
            onClick={() => setFacturacionTab('cot')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              facturacionTab === 'cot'
                ? 'bg-white dark:bg-neutral-800 text-orange-600 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            COT
          </button>
        </div>

        {/* ==================== PESTAÑA ENTREGABLES ==================== */}
        {facturacionTab === 'entregables' && (
          <div className="space-y-4">
            {/* Selector de proyecto */}
            <Card className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Proyecto"
                  value={selectedProyectoEdit}
                  onChange={e => setSelectedProyectoEdit(e.target.value)}
                >
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                  ))}
                </Select>
                <Button onClick={() => setShowAddEntregable(true)} variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Entregable
                </Button>
              </div>
            </Card>

            {/* Lista de entregables */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">
                  Entregables de {selectedProyectoEdit}
                </h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {entregablesEditProyecto.filter(e => !e.frozen).length} activos / {entregablesEditProyecto.length} total
                </span>
              </div>

              {entregablesEditProyecto.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay entregables en este proyecto</p>
                  <p className="text-xs mt-2">Sube un Excel o agrega entregables manualmente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-600">
                        <th className="pb-2 w-8">#</th>
                        <th className="pb-2">Código</th>
                        <th className="pb-2">Descripción</th>
                        <th className="pb-2 text-center">Tipo</th>
                        <th className="pb-2 text-center">Sem</th>
                        <th className="pb-2 text-right">REV_A (HsH)</th>
                        <th className="pb-2 text-right">REV_B (HsH)</th>
                        <th className="pb-2 text-right">REV_0 (HsH)</th>
                        <th className="pb-2 text-center">Estado</th>
                        <th className="pb-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregablesEditProyecto.map((ent, i) => (
                        <tr key={ent.id} className={`border-b border-neutral-200 dark:border-neutral-600 ${ent.frozen ? 'opacity-50 bg-neutral-100 dark:bg-neutral-800' : i % 2 === 0 ? '' : 'bg-neutral-50 dark:bg-neutral-800/30'}`}>
                          <td className="py-2 text-neutral-400">{ent.id}</td>
                          <td className="py-2">
                            {editingEntregable === ent.id ? (
                              <input
                                type="text"
                                defaultValue={ent.codigo}
                                className="w-24 px-1 py-0.5 border rounded text-xs dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { codigo: e.target.value })}
                              />
                            ) : (
                              <span className="font-mono text-neutral-600 dark:text-neutral-300">{ent.codigo || '-'}</span>
                            )}
                          </td>
                          <td className="py-2 text-neutral-800 dark:text-neutral-100 max-w-xs">
                            {editingEntregable === ent.id ? (
                              <input
                                type="text"
                                defaultValue={ent.nombre}
                                className="w-full px-1 py-0.5 border rounded text-xs dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { nombre: e.target.value })}
                              />
                            ) : (
                              <span className="truncate block">{ent.nombre}</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTipoColor(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo))}`}>
                              {getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            {editingEntregable === ent.id ? (
                              <input
                                type="number"
                                min="1"
                                max="52"
                                defaultValue={ent.weekStart || ent.secuencia || 1}
                                className="w-12 px-1 py-0.5 border rounded text-xs text-center dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { weekStart: parseInt(e.target.value) || 1 })}
                              />
                            ) : (
                              <span className="text-neutral-500">S{getWeekOfYear(new Date(proyectoEdit?.inicio || dashboardStartDate)) + (ent.weekStart || ent.secuencia || 1) - 1}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRevA}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRevA: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-green-600">{ent.valorRevA?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {ent.hshDirecto || ['REU', 'VIS'].includes(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)) ? (
                              <span className="text-neutral-400">-</span>
                            ) : editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRevB}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRevB: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-blue-600">{ent.valorRevB?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {ent.hshDirecto || ['REU', 'VIS'].includes(getTipoDocumento(ent.codigo, ent.nombre, ent.tipo)) ? (
                              <span className="text-neutral-400">-</span>
                            ) : editingEntregable === ent.id ? (
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={ent.valorRev0}
                                className="w-16 px-1 py-0.5 border rounded text-xs text-right dark:bg-neutral-700 dark:border-neutral-600"
                                onBlur={e => updateEntregable(selectedProyectoEdit, ent.id, { valorRev0: parseFloat(e.target.value) || 0 })}
                              />
                            ) : (
                              <span className="text-purple-600">{ent.valorRev0?.toFixed(1) || '0'}</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {ent.frozen ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded text-[10px] font-medium">
                                FREEZE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded text-[10px] font-medium">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingEntregable(editingEntregable === ent.id ? null : ent.id)}
                                className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 ${editingEntregable === ent.id ? 'text-orange-500' : 'text-neutral-500'}`}
                                title={editingEntregable === ent.id ? 'Terminar edición' : 'Editar'}
                              >
                                {editingEntregable === ent.id ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => showFreezeConfirm(selectedProyectoEdit, ent.id, ent.nombre)}
                                className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 ${ent.frozen ? 'text-blue-400' : 'text-neutral-500'}`}
                                title={ent.frozen ? 'Descongelar' : 'Congelar'}
                              >
                                <Snowflake className={`w-3.5 h-3.5 ${ent.frozen ? 'fill-blue-200' : ''}`} />
                              </button>
                              <button
                                onClick={() => showDeleteEntregableConfirm(selectedProyectoEdit, ent.id, ent.nombre)}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-500 hover:text-red-500"
                                title="Eliminar entregable"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totales */}
              {entregablesEditProyecto.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
                  <div className="flex justify-end gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_A</p>
                      <p className="text-green-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevA || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_B</p>
                      <p className="text-blue-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevB || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total REV_0</p>
                      <p className="text-purple-600 font-medium">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRev0 || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                    <div className="text-right border-l border-neutral-300 dark:border-neutral-600 pl-6">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs">Total Proyecto</p>
                      <p className="text-orange-500 font-bold text-lg">
                        {entregablesEditProyecto.filter(e => !e.frozen).reduce((s, e) => s + (e.valorRevA || 0) + (e.valorRevB || 0) + (e.valorRev0 || 0), 0).toFixed(1)} HsH
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Modal Agregar Entregable */}
            {showAddEntregable && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h2 className="text-neutral-800 dark:text-neutral-100 font-medium mb-4">Agregar Entregable</h2>
                  <div className="space-y-3">
                    <Select
                      label="Tipo de Entregable"
                      value={nuevoEntregable.tipo}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, tipo: e.target.value }))}
                    >
                      {TIPOS_ENTREGABLE.map(t => (
                        <option key={t.id} value={t.id}>{t.id} - {t.nombre}</option>
                      ))}
                    </Select>
                    <Input
                      label="Código"
                      placeholder="Ej: P2600-ARQ-PLA-001"
                      value={nuevoEntregable.codigo}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, codigo: e.target.value }))}
                    />
                    <Input
                      label="Descripción"
                      placeholder="Ej: Planta General Nivel 1"
                      value={nuevoEntregable.nombre}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, nombre: e.target.value }))}
                    />
                    <Input
                      label="Semana de Entrega"
                      type="number"
                      min="1"
                      max="52"
                      value={nuevoEntregable.weekStart}
                      onChange={e => setNuevoEntregable(prev => ({ ...prev, weekStart: e.target.value }))}
                    />
                    {/* REU y VIS tienen HsH directo (sin revisiones) */}
                    {['REU', 'VIS'].includes(nuevoEntregable.tipo) ? (
                      <Input
                        label="HsH Directo"
                        type="number"
                        step="0.1"
                        value={nuevoEntregable.hshDirecto}
                        onChange={e => setNuevoEntregable(prev => ({ ...prev, hshDirecto: e.target.value }))}
                      />
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="REV_A (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRevA}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRevA: e.target.value }))}
                        />
                        <Input
                          label="REV_B (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRevB}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRevB: e.target.value }))}
                        />
                        <Input
                          label="REV_0 (HsH)"
                          type="number"
                          step="0.1"
                          value={nuevoEntregable.valorRev0}
                          onChange={e => setNuevoEntregable(prev => ({ ...prev, valorRev0: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="ghost" onClick={() => setShowAddEntregable(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => addEntregable(selectedProyectoEdit)}
                      disabled={!nuevoEntregable.nombre}
                      className="flex-1"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para congelar */}
            {freezeConfirm.show && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Snowflake className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Confirmar Acción</h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    ¿Estás seguro que deseas {(() => {
                      const proyecto = proyectos.find(p => p.id === freezeConfirm.proyectoId);
                      const entregable = proyecto?.entregables?.find(e => e.id === freezeConfirm.entregableId);
                      return entregable?.frozen ? 'descongelar' : 'congelar';
                    })()} el entregable <strong>"{freezeConfirm.nombre}"</strong>?
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                    Los entregables congelados aparecerán tachados en Control, Log y Carta.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setFreezeConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' })} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={toggleFreezeEntregable} className="flex-1">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar entregable */}
            {deleteEntregableConfirm.show && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Eliminar Entregable</h2>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    ¿Estás seguro que deseas eliminar el entregable <strong>"{deleteEntregableConfirm.nombre}"</strong>?
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mb-4">
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setDeleteEntregableConfirm({ show: false, proyectoId: null, entregableId: null, nombre: '' })} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={deleteEntregable} className="flex-1 bg-red-500 hover:bg-red-600">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PESTAÑA EDP ==================== */}
        {facturacionTab === 'edp' && (
          <div className="space-y-4">
            {/* Selector de mes y proyecto */}
            <Card className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <Input
                  label="Mes a facturar"
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
                <Select
                  label="Proyecto"
                  value={selectedProyectoEDP}
                  onChange={e => setSelectedProyectoEDP(e.target.value)}
                >
                  <option value="all">Todos los proyectos</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Button onClick={exportarXLSX} variant="secondary">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar XLSX
                  </Button>
                  <Button onClick={() => setShowPreview(true)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Vista PDF
                  </Button>
                </div>
              </div>
            </Card>

            {/* Resumen EDP */}
            <Card className="p-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium mb-4">
                EDP - {new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
              </h2>

              {edpData.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay entregables facturables en este período</p>
                  <p className="text-xs mt-2">Los entregables aparecen aquí cuando se marcan en Control de Avance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(porProyecto).map(([proyectoId, data]) => (
                    <div key={proyectoId} className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-orange-500 font-mono font-bold">{proyectoId}</span>
                          <span className="text-neutral-800 dark:text-neutral-100 ml-2">{data.nombre}</span>
                        </div>
                        <Badge variant="success">
                          {data.totalUF.toFixed(2)} UF
                        </Badge>
                      </div>

                      {/* Tabla de entregables con observaciones */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-600">
                              <th className="pb-2">Código</th>
                              <th className="pb-2">Descripción</th>
                              <th className="pb-2 text-center">Tipo</th>
                              <th className="pb-2 text-center">Rev</th>
                              <th className="pb-2 text-center">Fecha</th>
                              <th className="pb-2 text-right">HsH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.entregables.map((e, i) => {
                              const obsKey = `${e.proyectoId}_${e.entregableId}_${e.revision}`;
                              return (
                                <tr key={`${e.entregableId}-${e.revision}`} className={`border-b border-neutral-200 dark:border-neutral-600 ${i % 2 === 0 ? '' : 'bg-white/50 dark:bg-neutral-800/30'}`}>
                                  <td className="py-2 font-mono text-neutral-600 dark:text-neutral-300">{e.codigo}</td>
                                  <td className="py-2 text-neutral-800 dark:text-neutral-100 max-w-xs truncate">{e.nombre}</td>
                                  <td className="py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      e.tipo === 'CRD' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                      e.tipo === 'EETT' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                      e.tipo === 'MTO' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                      e.tipo === 'DETALLE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                      e.tipo === 'VIS' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' :
                                      e.tipo === 'REU' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                      'bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300'
                                    }`}>
                                      {e.tipo}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      e.esHsH ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                                      e.revision === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                      e.revision === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                      'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                    }`}>
                                      {e.esHsH ? e.tipo : `REV_${e.revision}`}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center text-neutral-600 dark:text-neutral-300">{e.fecha}</td>
                                  <td className="py-2 text-right text-green-600 dark:text-green-400 font-medium">{e.valor.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="font-medium">
                              <td colSpan={5} className="pt-2 text-right text-neutral-600 dark:text-neutral-300">Subtotal {proyectoId}:</td>
                              <td className="pt-2 text-right text-green-600 dark:text-green-400">{data.totalUF.toFixed(2)} UF</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* Total general */}
                  <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-neutral-800 dark:text-neutral-100 font-medium">TOTAL EDP</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-2">
                          ({edpData.length} registros)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">
                          {totalGeneral.toFixed(2)} HsH
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen con Factor */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">HsH Mes en Curso</p>
                      <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{totalGeneral.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">Factor</p>
                      <p className="text-xl font-bold text-blue-600">1,5</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                      <p className="text-orange-600 dark:text-orange-400 text-xs mb-1">Valor Bruto HsH</p>
                      <p className="text-xl font-bold text-orange-600">{(totalGeneral * 1.5).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Modal de Vista Previa PDF */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between no-print">
                <h2 className="text-neutral-800 dark:text-neutral-100 font-medium">Vista Previa EDP</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="ghost" onClick={() => setShowPreview(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] print-content">
                {/* Contenido para PDF - Una sola página */}
                <div className="bg-white text-black">
                  {/* Header con proyecto */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-orange-500">
                    <div>
                      <h1 className="text-xl font-bold text-neutral-800">ESTADO DE PAGO</h1>
                      <p className="text-sm text-neutral-600">{new Date(selectedMonth + '-01').toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {selectedProyectoEDP !== 'all'
                          ? `${selectedProyectoEDP} - ${proyectos.find(p => p.id === selectedProyectoEDP)?.nombre || ''}`
                          : 'Todos los proyectos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-light tracking-widest">
                        <span className="text-neutral-800">M</span>
                        <span className="text-orange-500">A</span>
                        <span className="text-neutral-800">TRIZ</span>
                      </p>
                      <p className="text-[7px] text-neutral-400 tracking-wider">ARCHITECTURE FOR ENGINEERING</p>
                    </div>
                  </div>

                  {/* Tabla de entregables */}
                  <table className="w-full text-[8px] border-collapse mb-3">
                    <thead>
                      <tr className="bg-neutral-800 text-white">
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">TIPO</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-left">CÓDIGO</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-left">DESCRIPCIÓN</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">REV</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-center">FECHA</th>
                        <th className="border border-neutral-300 px-1.5 py-1 text-right">HsH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edpData.map((e, i) => (
                        <tr key={`${e.entregableId}-${e.revision}`} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.tipo}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 font-mono">{e.codigo}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5">{e.nombre}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.esHsH ? '-' : `REV_${e.revision}`}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-center">{e.fecha}</td>
                          <td className="border border-neutral-300 px-1.5 py-0.5 text-right font-medium">{e.valor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-orange-100 font-bold">
                        <td colSpan={5} className="border border-neutral-300 px-1.5 py-1 text-right">TOTAL HsH:</td>
                        <td className="border border-neutral-300 px-1.5 py-1 text-right text-orange-600">{totalGeneral.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Resumen compacto */}
                  <div className="mt-3 p-2 bg-neutral-50 border border-neutral-200 rounded">
                    <div className="grid grid-cols-4 gap-2 text-[9px]">
                      {(() => {
                        // Calcular totales para el resumen
                        let totalProyectoHsH = 0;
                        let mesAnteriorHsH = 0;
                        const mesEnCursoHsH = totalGeneral;

                        Object.entries(porProyecto).forEach(([pid, pdata]) => {
                          const proyecto = proyectos.find(p => p.id === pid);
                          if (proyecto && proyecto.entregables) {
                            proyecto.entregables.forEach(ent => {
                              if (!ent.frozen) {
                                // Total presupuestado del proyecto
                                totalProyectoHsH += (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
                                // Mes anterior: lo que ya se facturó (avance anterior)
                                const avanceAnterior = (ent.avanceAnterior || 0) / 100;
                                const valorTotal = (ent.valorRevA || 0) + (ent.valorRevB || 0) + (ent.valorRev0 || 0);
                                mesAnteriorHsH += valorTotal * avanceAnterior;
                              }
                            });
                          }
                        });

                        const totalPendienteHsH = Math.max(0, totalProyectoHsH - mesAnteriorHsH - mesEnCursoHsH);

                        return (
                          <>
                            <div className="text-center p-1.5 bg-white rounded border">
                              <p className="text-neutral-500 text-[8px]">Total Proyecto</p>
                              <p className="font-bold text-neutral-800 text-xs">{totalProyectoHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-white rounded border">
                              <p className="text-neutral-500 text-[8px]">Mes Anterior</p>
                              <p className="font-bold text-neutral-600 text-xs">{mesAnteriorHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                              <p className="text-orange-600 text-[8px]">Mes en Curso</p>
                              <p className="font-bold text-orange-600 text-sm">{mesEnCursoHsH.toFixed(1)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-orange-100 rounded border border-orange-300">
                              <p className="text-orange-700 text-[8px]">Total Pendiente</p>
                              <p className="font-bold text-orange-600 text-sm">{totalPendienteHsH.toFixed(1)}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Segunda fila: Factor y Valor Bruto */}
                    <div className="grid grid-cols-3 gap-2 text-[9px] mt-2">
                      <div className="text-center p-1.5 bg-white rounded border">
                        <p className="text-neutral-500 text-[8px]">HsH Mes en Curso</p>
                        <p className="font-bold text-neutral-800 text-xs">{totalGeneral.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-1.5 bg-white rounded border">
                        <p className="text-neutral-500 text-[8px]">Factor</p>
                        <p className="font-bold text-blue-600 text-xs">1,5</p>
                      </div>
                      <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                        <p className="text-orange-600 text-[8px]">Valor Bruto HsH</p>
                        <p className="font-bold text-orange-600 text-sm">{(totalGeneral * 1.5).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Firmas */}
                  <div className="mt-8 pt-4 border-t border-neutral-300">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Firma Jefe de Proyecto */}
                      <div className="text-center">
                        <div className="border-b border-neutral-400 h-12 mb-2"></div>
                        <p className="text-[10px] font-bold text-neutral-700">Jefe de Proyecto {selectedProyectoEDP !== 'all' ? selectedProyectoEDP : ''}</p>
                        <p className="text-[9px] text-neutral-600">{selectedProyectoEDP !== 'all' ? (proyectos.find(p => p.id === selectedProyectoEDP)?.jefeProyecto || '') : ''}</p>
                      </div>
                      {/* Firma Líder de Arquitectura */}
                      <div className="text-center">
                        <div className="border-b border-neutral-400 h-12 mb-2"></div>
                        <p className="text-[10px] font-bold text-neutral-700">Líder de Arquitectura</p>
                        <p className="text-[9px] text-neutral-600">Sebastián A. Vizcarra</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-200 text-[8px] text-neutral-400 flex justify-between">
                    <span>Generado: {new Date().toLocaleString('es-CL')}</span>
                    <span>MATRIZ Intranet v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PESTAÑA COT (COTIZACIÓN) ==================== */}
        {facturacionTab === 'cot' && (
          <Card className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-neutral-800 dark:text-neutral-100 text-lg font-medium mb-1">Generar Cotización</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Crea una propuesta comercial en PDF a partir de un listado de documentos</p>
            </div>

            <div className="space-y-4">
              {/* Datos del Cliente */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={cotCliente}
                    onChange={e => setCotCliente(e.target.value)}
                    placeholder="Ej: BHP Billiton"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={cotProyectoNombre}
                    onChange={e => setCotProyectoNombre(e.target.value)}
                    placeholder="Ej: Ampliación Planta Concentradora"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Logo del Cliente */}
              <div>
                <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                  Logo del Cliente (opcional)
                </label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCotLogo(file);
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setCotLogoPreview(evt.target.result);
                        };
                        reader.readAsDataURL(file);
                        showNotification('success', 'Logo cargado correctamente');
                      }
                    }}
                    className="hidden"
                    id="cotLogoInput"
                  />
                  {cotLogoPreview ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={cotLogoPreview}
                        alt="Logo del cliente"
                        className="h-16 max-w-[200px] object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCotLogo(null);
                          setCotLogoPreview(null);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="cotLogoInput" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Haz clic para cargar el logo</span>
                        <span className="text-xs text-neutral-400">PNG, JPG, SVG</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Carga de Excel */}
              <div>
                <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider mb-1">
                  Listado de Documentos (Excel) *
                </label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCotExcelFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          const processExcelCot = () => {
                            try {
                              const data = new Uint8Array(evt.target.result);
                              const workbook = window.XLSX.read(data, { type: 'array' });
                              const sheetName = workbook.SheetNames[0];
                              const worksheet = workbook.Sheets[sheetName];
                              const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                              setCotExcelData(jsonData);
                              showNotification('success', 'Excel cargado correctamente');
                            } catch (error) {
                              showNotification('error', 'Error al leer el archivo Excel');
                            }
                          };
                          if (!window.XLSX) {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                            script.onload = processExcelCot;
                            script.onerror = () => showNotification('error', 'Error cargando librería Excel');
                            document.head.appendChild(script);
                          } else {
                            processExcelCot();
                          }
                        };
                        reader.readAsArrayBuffer(file);
                      }
                    }}
                    className="hidden"
                    id="cotExcelInputAdmin"
                  />
                  <label htmlFor="cotExcelInputAdmin" className="cursor-pointer">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    {cotExcelFileName ? (
                      <div>
                        <p className="text-neutral-800 dark:text-neutral-100 font-medium">{cotExcelFileName}</p>
                        <p className="text-green-600 text-sm mt-1">✓ Archivo cargado</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 font-medium">Haz clic para subir</p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">o arrastra tu archivo Excel aquí</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Preview de datos */}
              {cotExcelData && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-neutral-800 dark:text-neutral-100 font-medium text-sm mb-2">Vista Previa</h4>
                  <div className="max-h-48 overflow-y-auto text-xs">
                    <table className="w-full">
                      <tbody>
                        {cotExcelData.slice(0, 10).map((row, i) => (
                          <tr key={i} className={i === 0 ? 'font-bold bg-neutral-200 dark:bg-neutral-700' : ''}>
                            {row.slice(0, 5).map((cell, j) => (
                              <td key={j} className="px-2 py-1 border-b border-neutral-200 dark:border-neutral-700 truncate max-w-[150px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {cotExcelData.length > 10 && (
                      <p className="text-neutral-500 text-center mt-2">... y {cotExcelData.length - 10} filas más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de forma de pago */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="text-orange-800 dark:text-orange-300 font-medium text-sm mb-2">Forma de Pago (por revisiones)</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">70%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_A</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">20%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_B</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">10%</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">REV_0</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
                  Validez: 90 días | Revisiones posteriores mantienen valor REV_0
                </p>
              </div>

              {/* Botón Generar Preview */}
              <button
                onClick={() => {
                  if (!cotCliente || !cotProyectoNombre || !cotExcelData) {
                    showNotification('error', 'Completa todos los campos requeridos');
                    return;
                  }
                  setCotShowPreview(true);
                }}
                disabled={!cotCliente || !cotProyectoNombre || !cotExcelData}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  !cotCliente || !cotProyectoNombre || !cotExcelData
                    ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <Eye className="w-5 h-5" />
                Ver Preview de Cotización
              </button>
            </div>
          </Card>
        )}

        {/* ==================== MODAL PREVIEW COTIZACIÓN ==================== */}
        {cotShowPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-neutral-800">Preview de Cotización</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const printContent = document.getElementById('cotizacion-preview');
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Cotización - ${cotCliente}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                              th { background: #f5f5f5; font-weight: 600; }
                              .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
                              .logo { max-height: 60px; max-width: 200px; }
                              .title { color: #ea580c; font-size: 24px; font-weight: bold; }
                              .subtitle { color: #666; font-size: 14px; }
                              .section { margin: 25px 0; }
                              .section-title { font-size: 14px; font-weight: 600; color: #ea580c; margin-bottom: 10px; text-transform: uppercase; }
                              .total-row { background: #fef3e7 !important; font-weight: bold; }
                              .terms { background: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; }
                              @media print { body { padding: 20px; } }
                            </style>
                          </head>
                          <body>
                            ${printContent.innerHTML}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                  <button
                    onClick={() => setCotShowPreview(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300"
                  >
                    <X className="w-4 h-4" />
                    Cerrar
                  </button>
                </div>
              </div>

              {/* Contenido del Preview */}
              <div id="cotizacion-preview" className="p-8">
                {/* Header con logos */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">MATRIZ</div>
                    <div className="text-sm text-neutral-500">Architecture for Engineering</div>
                  </div>
                  {cotLogoPreview && (
                    <img src={cotLogoPreview} alt="Logo Cliente" className="max-h-16 max-w-[200px] object-contain" />
                  )}
                </div>

                {/* Título */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-neutral-800 mb-2">PROPUESTA COMERCIAL</h1>
                  <p className="text-neutral-600">{cotProyectoNombre}</p>
                  <p className="text-sm text-neutral-500">Cliente: {cotCliente}</p>
                  <p className="text-sm text-neutral-500">Fecha: {new Date().toLocaleDateString('es-CL')}</p>
                </div>

                {/* Tabla de items */}
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-orange-600 uppercase mb-3">Alcance y Valorización</h2>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-100">
                        <th className="border border-neutral-300 px-3 py-2 text-left">Item</th>
                        <th className="border border-neutral-300 px-3 py-2 text-left">Descripción</th>
                        <th className="border border-neutral-300 px-3 py-2 text-center">Tipo</th>
                        <th className="border border-neutral-300 px-3 py-2 text-right">REV_A (70%)</th>
                        <th className="border border-neutral-300 px-3 py-2 text-right">REV_B (20%)</th>
                        <th className="border border-neutral-300 px-3 py-2 text-right">REV_0 (10%)</th>
                        <th className="border border-neutral-300 px-3 py-2 text-right">Total UF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotExcelData && cotExcelData.slice(1).filter(row => row[0] && row[3]).map((row, idx) => {
                        // row[0]=N°, row[1]=CLASIFICACIÓN (GRL/DET/etc), row[2]=NOMBRE, row[3]=Descripción, row[4]=Cantidad
                        const tipo = (row[1] || 'GRL').toUpperCase();
                        const cantidad = parseInt(row[4]) || 1;
                        const precio = tipo.includes('CRD') || tipo.includes('EETT') || tipo.includes('MTO') ? 40 :
                                      tipo.includes('DET') ? 25 : 20;
                        const precioTotal = precio * cantidad;
                        return (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="border border-neutral-300 px-3 py-2">{row[0]}</td>
                            <td className="border border-neutral-300 px-3 py-2">{row[3]}</td>
                            <td className="border border-neutral-300 px-3 py-2 text-center">{tipo}</td>
                            <td className="border border-neutral-300 px-3 py-2 text-right">{(precioTotal * 0.7).toFixed(1)}</td>
                            <td className="border border-neutral-300 px-3 py-2 text-right">{(precioTotal * 0.2).toFixed(1)}</td>
                            <td className="border border-neutral-300 px-3 py-2 text-right">{(precioTotal * 0.1).toFixed(1)}</td>
                            <td className="border border-neutral-300 px-3 py-2 text-right font-medium">{precioTotal}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-orange-50 font-bold">
                        <td colSpan="6" className="border border-neutral-300 px-3 py-2 text-right">TOTAL</td>
                        <td className="border border-neutral-300 px-3 py-2 text-right">
                          {cotExcelData ? cotExcelData.slice(1).filter(row => row[0] && row[3]).reduce((sum, row) => {
                            const tipo = (row[1] || 'GRL').toUpperCase();
                            const cantidad = parseInt(row[4]) || 1;
                            const precio = tipo.includes('CRD') || tipo.includes('EETT') || tipo.includes('MTO') ? 40 :
                                          tipo.includes('DET') ? 25 : 20;
                            return sum + (precio * cantidad);
                          }, 0) : 0} UF
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Términos */}
                <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600">
                  <h2 className="text-sm font-semibold text-orange-600 uppercase mb-2">Condiciones Comerciales</h2>
                  <ul className="space-y-1">
                    <li>• <strong>Forma de Pago:</strong> REV_A (70%) al envío, REV_B (20%) con comentarios, REV_0 (10%) aprobación final</li>
                    <li>• <strong>Validez de la Oferta:</strong> 90 días corridos desde la fecha de emisión</li>
                    <li>• <strong>Plazo de Entrega:</strong> A coordinar según alcance del proyecto</li>
                    <li>• <strong>Revisiones Adicionales:</strong> Se valorarán al valor de REV_0</li>
                  </ul>
                </div>

                {/* Firma */}
                <div className="mt-8 pt-8 border-t text-center text-sm text-neutral-500">
                  <p>MATRIZ - Architecture for Engineering</p>
                  <p>www.matriz.cl | contacto@matriz.cl</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Modal Nuevo Proyecto se renderiza inline (ver abajo)

  // ============================================
  // PANTALLA DE CARGA (mientras se conecta a Firestore)
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'radial-gradient(ellipse at center, #ea580c 0%, #c2410c 25%, #431407 60%, #0a0a0a 100%)'}}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-300 animate-spin mx-auto mb-4" />
          <img src={LOGO_A4E} alt="A4E" className="h-16 mx-auto mb-2" />
          <p className="text-orange-200/60 text-sm">Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // PANTALLA DE LOGIN (si no está autenticado)
  // ============================================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden" style={{background: 'radial-gradient(ellipse at center, #ea580c 0%, #c2410c 25%, #431407 60%, #0a0a0a 100%)'}}>
        {/* Estilos de animación */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(251, 146, 60, 0.5), 0 0 40px rgba(251, 146, 60, 0.3); }
            50% { text-shadow: 0 0 30px rgba(251, 146, 60, 0.8), 0 0 60px rgba(251, 146, 60, 0.5); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
          .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
          .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
        `}</style>

        {/* Partículas de fondo decorativas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-orange-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 animate-fadeInDown">
            <img src={LOGO_A4E} alt="A4E" className="h-20 mx-auto mb-2 animate-float" />
            <p className="text-orange-200/60 text-xs tracking-wider">ARCHITECTURE FOR ENGINEERING</p>
            <h1 className="text-xl text-white font-medium mt-4">Intranet</h1>
          </div>

          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur border border-white/20 dark:border-neutral-700 rounded-lg shadow-2xl p-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-600 dark:text-neutral-300 font-medium block mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-600 dark:text-neutral-300 font-medium block mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-orange-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:text-neutral-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] text-white rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-lg hover:shadow-orange-500/30"
              >
                Iniciar Sesión
              </button>
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-800/50 dark:bg-neutral-900 transition-colors duration-300">
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
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-3 sm:px-4 py-3 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MatrizLogo />
            <span className="text-neutral-400 dark:text-neutral-500 dark:text-neutral-500 dark:text-neutral-400 text-xs hidden sm:block">INTRANET</span>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm transition-colors touch-manipulation ${
                  currentPage === item.id || (item.id === 'proyectos' && currentPage === 'proyecto-detail')
                    ? 'bg-orange-600 text-white active:bg-orange-700'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.locked && <Lock className="w-3 h-3" />}
              </button>
            ))}
            {/* Indicador de usuarios en línea */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 ml-1 transition-colors"
                title={`${usuariosOnline.length} usuario${usuariosOnline.length !== 1 ? 's' : ''} en línea`}
              >
                <div className="relative">
                  <Wifi className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1.5 bg-green-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-medium">
                    {usuariosOnline.length}
                  </span>
                </div>
                <span className="hidden sm:inline">En línea</span>
              </button>
              {/* Dropdown con usuarios */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Usuarios conectados</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {usuariosOnline.length === 0 ? (
                    <p className="p-3 text-sm text-neutral-500 text-center">Nadie más está en línea</p>
                  ) : (
                    usuariosOnline.map(user => {
                      const presencia = presenciaUsuarios.find(p => p.profesionalId === user.id);
                      return (
                        <div key={user.id} className="px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                                {user.nombre?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                              {user.nombre?.split(' ')[0]}
                              {user.id === currentUser?.profesionalId && <span className="text-neutral-400 ml-1">(Tú)</span>}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {presencia?.pagina || 'Navegando'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            {/* Botón de modo oscuro */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 ml-1 transition-colors"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Botón de logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 sm:py-2 rounded text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 ml-1 transition-colors"
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
        {currentPage === 'tareas' && <TareasPage />}
        {currentPage === 'facturacion' && <FacturacionPage />}
        {currentPage === 'config' && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Configuración</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Administra profesionales y ajustes del sistema</p>
              </div>
            </div>
            
            {/* Tabs de configuración */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
              {[
                { id: 'profesionales', label: 'Profesionales', icon: Users },
                { id: 'seguridad', label: 'Seguridad', icon: Lock },
                { id: 'sistema', label: 'Sistema', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    configTab === tab.id 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab: Profesionales */}
            {configTab === 'profesionales' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''} registrado{profesionales.length !== 1 ? 's' : ''}
                  </p>
                  <Button onClick={() => setShowNewProfesional(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                
                {/* Formulario nuevo profesional */}
                {showNewProfesional && (
                  <Card className="p-4 border-2 border-orange-200 bg-orange-50/50">
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3">Nuevo Profesional</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          value={newProfesional.nombre}
                          onChange={e => setNewProfesional(prev => ({ ...prev, nombre: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cargo</label>
                        <input
                          type="text"
                          placeholder="Ej: Arquitecto"
                          value={newProfesional.cargo}
                          onChange={e => setNewProfesional(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Categoría</label>
                        <select
                          value={newProfesional.categoria}
                          onChange={e => setNewProfesional(prev => ({ ...prev, categoria: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                        >
                          {categoriasProfesional.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Tarifa Interna (UF/hr)</label>
                        <input
                          type="number"
                          step="0.05"
                          placeholder="0.5"
                          value={newProfesional.tarifaInterna}
                          onChange={e => setNewProfesional(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Credenciales de acceso */}
                    <div className="border-t border-orange-200 pt-3 mt-3">
                      <p className="text-xs font-medium text-orange-600 mb-2">🔐 Credenciales de Acceso</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="usuario@matriz.cl"
                            value={newProfesional.email}
                            onChange={e => setNewProfesional(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Contraseña</label>
                          <input
                            type="text"
                            placeholder="Contraseña inicial"
                            value={newProfesional.password}
                            onChange={e => setNewProfesional(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                      <Button variant="secondary" onClick={() => setShowNewProfesional(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddProfesional} disabled={!newProfesional.nombre.trim() || !newProfesional.cargo.trim() || !newProfesional.email.trim() || !newProfesional.password.trim()}>
                        <Check className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </Card>
                )}
                
                {/* Lista de profesionales */}
                <div className="space-y-3">
                  {profesionales.map(col => {
                    const usuarioCol = usuarios.find(u => u.profesionalId === col.id);
                    const proyectosAsig = col.proyectosAsignados || [];
                    return (
                    <Card key={col.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium text-sm">{col.iniciales}</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800 dark:text-neutral-100">{col.nombre}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{col.cargo} • {col.categoria}</p>
                            {usuarioCol && (
                              <p className="text-xs text-blue-500">🔐 {usuarioCol.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:block">
                            {col.tarifaInterna} UF/hr
                          </span>
                          <button
                            onClick={() => {
                              setProfesionalToEdit({ ...col });
                              setEditProfesionalOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hover:text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteProfesional(col.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Proyectos asignados */}
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                        <p className="text-xs font-medium text-neutral-500 mb-2">📁 Proyectos asignados:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proyectosAsig.length === 0 ? (
                            <span className="text-xs text-neutral-400 italic">Sin proyectos asignados</span>
                          ) : (
                            proyectosAsig.map(pId => {
                              const proy = proyectos.find(p => p.id === pId);
                              return (
                                <span key={pId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {pId}
                                  <button
                                    onClick={async () => {
                                      const nuevosProyectos = proyectosAsig.filter(id => id !== pId);
                                      const colActualizado = { ...col, proyectosAsignados: nuevosProyectos };
                                      await saveColaborador(colActualizado);
                                      showNotification('success', `Proyecto ${pId} removido`);
                                    }}
                                    className="hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })
                          )}
                          {/* Selector para agregar proyecto */}
                          <select
                            className="text-xs border border-neutral-200 rounded px-1.5 py-0.5 bg-white dark:bg-neutral-700 dark:border-neutral-600"
                            value=""
                            onChange={async (e) => {
                              const pId = e.target.value;
                              if (pId && !proyectosAsig.includes(pId)) {
                                const nuevosProyectos = [...proyectosAsig, pId];
                                const colActualizado = { ...col, proyectosAsignados: nuevosProyectos };
                                await saveColaborador(colActualizado);
                                showNotification('success', `Proyecto ${pId} asignado`);
                              }
                            }}
                          >
                            <option value="">+ Agregar...</option>
                            {proyectos.filter(p => !proyectosAsig.includes(p.id)).map(p => (
                              <option key={p.id} value={p.id}>{p.id} - {p.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {configTab === 'seguridad' && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cambiar Contraseña Admin
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Para cambiar tu contraseña de acceso a la intranet, ingresa tu contraseña actual.
                  </p>
                  <div className="space-y-3 max-w-sm">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Contraseña Actual</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentAdminPassword}
                        onChange={e => setCurrentAdminPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (currentAdminPassword !== adminStoredPassword) {
                          showNotification('error', 'La contraseña actual es incorrecta');
                          return;
                        }
                        if (newAdminPassword.trim().length < 4) {
                          showNotification('error', 'La nueva contraseña debe tener al menos 4 caracteres');
                          return;
                        }
                        setAdminStoredPassword(newAdminPassword.trim());
                        showNotification('success', 'Contraseña de admin actualizada correctamente');
                        setCurrentAdminPassword('');
                        setNewAdminPassword('');
                      }}
                      disabled={!currentAdminPassword.trim() || !newAdminPassword.trim()}
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
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-100 mb-3">Información del Sistema</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Versión</span>
                      <span className="text-neutral-800 dark:text-neutral-100 font-mono">MATRIZ v1.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Proyectos</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{proyectos.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Profesionales</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{profesionales.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Horas Registradas</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{horasRegistradas.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500 dark:text-neutral-400">Última actualización</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{new Date().toLocaleDateString('es-CL')}</span>
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
            
            {/* Modal editar profesional */}
            {editProfesionalOpen && profesionalToEdit && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pencil className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Editar Profesional</h2>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={profesionalToEdit.nombre}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Cargo</label>
                      <input
                        type="text"
                        value={profesionalToEdit.cargo}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, cargo: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Categoría</label>
                      <select
                        value={profesionalToEdit.categoria}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {categoriasProfesional.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Tarifa Interna (UF/hr)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={profesionalToEdit.tarifaInterna}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, tarifaInterna: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Nueva Contraseña (opcional)</label>
                      <input
                        type="password"
                        placeholder="Dejar vacío para mantener actual"
                        value={profesionalToEdit.newPassword || ''}
                        onChange={e => setProfesionalToEdit(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Solo el admin puede establecer contraseñas</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => {
                      setEditProfesionalOpen(false);
                      setProfesionalToEdit(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button className="flex-1" onClick={handleSaveProfesional}>
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
                      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">¿Reiniciar todos los datos?</h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      Se eliminarán permanentemente:
                    </p>
                    <ul className="text-sm text-red-600 mt-2 space-y-1">
                      <li>• Todos los proyectos ({proyectos.length})</li>
                      <li>• Todas las horas registradas ({horasRegistradas.length})</li>
                      <li>• Profesionales se restablecerán a valores iniciales</li>
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
                        setProfesionales(COLABORADORES_INICIAL);
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
                <p className="text-neutral-500 dark:text-neutral-400">Proyecto no encontrado</p>
                <button onClick={() => setCurrentPage('home')} className="mt-4 px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
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
                  className="flex items-center gap-1 px-3 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 rounded text-sm text-neutral-700 dark:text-neutral-200 transition-colors"
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
                    <h1 className="text-sm sm:text-xl text-neutral-800 dark:text-neutral-100 font-medium mt-1">{proyecto.nombre}</h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{proyecto.cliente}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setTempDate(dashboardStartDate); setEditDateOpen(true); }} 
                    className="flex items-center gap-1 px-2 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 rounded text-xs text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
                  >
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">Inicio:</span>
                    <span>{dashboardStartDate.split('-').reverse().join('/')}</span>
                    <Pencil className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  onClick={() => setDashboardTab('resumen')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'resumen' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Resumen</span>
                </button>
                <button
                  onClick={() => setDashboardTab('control')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'control' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Control</span>
                </button>
                <button
                  onClick={() => setDashboardTab('log')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'log' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Log</span>
                </button>
                <button
                  onClick={() => setDashboardTab('gantt')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 rounded text-[10px] sm:text-xs transition-all ${
                    dashboardTab === 'gantt' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Carta</span>
                </button>
              </div>
              
              {/* Contenido de tabs */}
              {(() => {
                // Obtener entregables del proyecto específico o usar los por defecto
                const proyectoActual = proyectos.find(p => p.id === selectedProject);
                const entregablesProyecto = proyectoActual?.entregables || ENTREGABLES_PROYECTO;
                const usaEntregablesPersonalizados = proyectoActual?.entregables?.length > 0;

                // Calcular deliverables y stats
                const deliverables = entregablesProyecto.map(d => {
                  const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia);
                  // Usar clave compuesta para proyectos con entregables personalizados
                  const statusKey = usaEntregablesPersonalizados ? `${selectedProject}_${d.id}` : d.id;
                  const status = statusData[statusKey];
                  const statusInfo = calculateStatus(status, deadlines);
                  return { ...d, ...deadlines, status, statusInfo, statusKey };
                });
                
                const stats = {
                  total: deliverables.length,
                  completed: deliverables.filter(d => d.statusInfo.status === 'TERMINADO').length,
                  inProgress: deliverables.filter(d => d.statusInfo.status === 'En Proceso').length,
                  delayed: deliverables.filter(d => d.statusInfo.status === 'ATRASADO').length,
                  pending: deliverables.filter(d => d.statusInfo.status === 'Pendiente').length,
                  frozen: deliverables.filter(d => d.frozen).length,
                };

                return (
                  <>
                    {/* Tab: Resumen */}
                    {dashboardTab === 'resumen' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600 dark:text-neutral-300" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{stats.total}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Total</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Listos</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-orange-500">{stats.inProgress}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Proceso</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                              <div>
                                <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.delayed}</p>
                                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Atrasados</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm mb-1">Progreso General</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">Estado de entregables</p>
                          <div className="space-y-2">
                            <ProgressBar label="Completados" value={stats.completed} total={stats.total} color="bg-green-500" />
                            <ProgressBar label="En Proceso" value={stats.inProgress} total={stats.total} color="bg-orange-500" />
                            <ProgressBar label="Atrasados" value={stats.delayed} total={stats.total} color="bg-red-500" />
                            <ProgressBar label="Pendientes" value={stats.pending} total={stats.total} color="bg-neutral-400" />
                          </div>
                        </Card>
                        
                        {/* Curva S */}
                        <Card className="p-3 sm:p-4">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm mb-1">Curva S - Avance del Proyecto</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-3">Comparación avance proyectado vs real</p>
                          {(() => {
                            const weeksToShow = 20;
                            const chartWidth = 550;
                            const chartHeight = 150;
                            const padding = { top: 20, right: 70, bottom: 30, left: 35 };
                            
                            // Calcular avance proyectado (curva S típica)
                            const projectedData = [];
                            for (let w = 0; w <= weeksToShow; w++) {
                              // Curva S usando función sigmoide
                              const progress = 100 / (1 + Math.exp(-0.5 * (w - weeksToShow / 2)));
                              projectedData.push({ week: w, value: progress });
                            }
                            
                            // Calcular semanas del año (continuidad anual)
                            const startDate = new Date(dashboardStartDate);
                            const today = new Date();
                            const startWeekOfYear = getWeekOfYear(startDate); // Semana del año en que inició el proyecto
                            const currentWeekOfYearValue = getCurrentWeekOfYear(); // Semana actual del año

                            // Semana relativa al proyecto (para cálculos internos)
                            const diffTime = today - startDate;
                            const projectWeek = Math.max(1, Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)));

                            // La posición en el gráfico es relativa al proyecto
                            const currentWeek = projectWeek;

                            // Calcular avance real basado en entregas completadas
                            const realData = [];
                            const totalEntregables = stats.total || deliverables.length || 1;
                            for (let w = 0; w <= Math.min(currentWeek, weeksToShow); w++) {
                              // Contar entregables completados hasta esta semana
                              const completedThisWeek = deliverables.filter(d => {
                                // Considerar completado si tiene Rev0, RevB o RevA
                                const hasProgress = d.status?.sentRev0 || d.status?.sentRevB || d.status?.sentRevA || d.status?.sentIniciado;
                                if (!hasProgress) return false;
                                // Si tiene fecha, verificar si es antes de esta semana
                                const completedDate = d.status?.sentRev0Date ? new Date(d.status.sentRev0Date) :
                                                     d.status?.sentRevBDate ? new Date(d.status.sentRevBDate) :
                                                     d.status?.sentRevADate ? new Date(d.status.sentRevADate) : today;
                                const weeksSinceStart = Math.floor((completedDate - startDate) / (7 * 24 * 60 * 60 * 1000));
                                return weeksSinceStart <= w;
                              }).length;
                              const cumulativeReal = (completedThisWeek / totalEntregables) * 100;
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
                                      <text x={padding.left - 5} y={yScale(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af" fontWeight="300">{v}%</text>
                                    </g>
                                  ))}

                                  {/* Etiquetas semanas del año (continuidad anual) */}
                                  {Array.from({ length: weeksToShow + 1 }, (_, i) => i).map(w => (
                                    <text key={w} x={xScale(w)} y={chartHeight - 15} textAnchor="middle" fontSize="7" fill="#9ca3af" fontWeight="300">S{startWeekOfYear + w}</text>
                                  ))}
                                  
                                  {/* Línea vertical HOY - muestra semana del año */}
                                  {currentWeek >= 0 && currentWeek <= weeksToShow && (
                                    <>
                                      <line x1={xScale(currentWeek)} y1={padding.top} x2={xScale(currentWeek)} y2={chartHeight - padding.bottom} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
                                      <text x={xScale(currentWeek)} y={padding.top - 5} textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="500">S{currentWeekOfYearValue}</text>
                                    </>
                                  )}

                                  {/* Curva proyectada */}
                                  <path d={projectedPath} fill="none" stroke="#f97316" strokeWidth="2.5" />

                                  {/* Curva real - siempre mostrar si hay datos */}
                                  {realPath && realData.length > 0 && <path d={realPath} fill="none" stroke="#22c55e" strokeWidth="2.5" />}

                                  {/* Leyenda */}
                                  <g transform={`translate(${chartWidth - padding.right + 8}, ${padding.top + 10})`}>
                                    <line x1="0" y1="0" x2="12" y2="0" stroke="#f97316" strokeWidth="2" />
                                    <text x="16" y="3" fontSize="8" fill="#6b7280" fontWeight="300">Proyectado</text>
                                    <line x1="0" y1="16" x2="12" y2="16" stroke="#22c55e" strokeWidth="2" />
                                    <text x="16" y="19" fontSize="8" fill="#6b7280" fontWeight="300">Real</text>
                                  </g>
                                </svg>
                                
                                {/* Resumen numérico */}
                                <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Proyectado</div>
                                    <div className="text-base font-medium text-orange-500">{projectedAtCurrentWeek.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Real</div>
                                    <div className="text-base font-medium text-green-500">{realFinal.toFixed(1)}%</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Diferencia</div>
                                    <div className={`text-base font-medium ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </Card>
                        
                        <div className="space-y-2">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm">Detalle por Estado</h3>
                          <Accordion title="Completados" count={stats.completed} color="bg-green-500">
                            {deliverables.filter(d => d.statusInfo.status === 'TERMINADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-green-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-green-600 text-xs">✓ Completado</span>
                              </div>
                            ))}
                            {stats.completed === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="En Proceso" count={stats.inProgress} color="bg-orange-500">
                            {deliverables.filter(d => d.statusInfo.status === 'En Proceso').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-orange-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-orange-600 text-xs">En proceso</span>
                              </div>
                            ))}
                            {stats.inProgress === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="Atrasados" count={stats.delayed} color="bg-red-500">
                            {deliverables.filter(d => d.statusInfo.status === 'ATRASADO').map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-red-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-red-600 text-xs">⚠ Atrasado</span>
                              </div>
                            ))}
                            {stats.delayed === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                          <Accordion title="Frozen" count={stats.frozen} color="bg-blue-500">
                            {deliverables.filter(d => d.frozen).map(d => (
                              <div key={d.id} className="py-1 text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span>{d.nombre || d.name}<span className="text-blue-600 font-medium">{getDocumentSuffix(d.status)}</span></span>
                                <span className="text-blue-600 text-xs">❄ Frozen</span>
                              </div>
                            ))}
                            {stats.frozen === 0 && <p className="text-neutral-500 dark:text-neutral-400">Ninguno</p>}
                          </Accordion>
                        </div>
                      </div>
                    )}
                    
                    {/* Tab: Control de Avance */}
                    {dashboardTab === 'control' && (
                      <Card className="overflow-hidden">
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Control de Avance</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Marca los checkboxes para actualizar estados</p>
                          <p className="text-orange-500 text-xs mt-1 sm:hidden">← Desliza para ver más →</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                            <thead>
                              <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium">Código</th>
                                <th className="p-2 text-left font-medium min-w-[120px]">Descripción</th>
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
                                <tr key={d.id} className={`border-b border-neutral-200 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{d.id}</td>
                                  <td className={`p-2 text-neutral-600 dark:text-neutral-300 font-mono text-xs ${d.frozen ? 'line-through' : ''}`}>{d.codigo || '-'}</td>
                                  <td className={`p-2 text-neutral-800 dark:text-neutral-100 font-medium text-xs ${d.frozen ? 'line-through' : ''}`}>
                                    {d.nombre || d.name}
                                    {d.frozen && <Snowflake className="w-3 h-3 inline ml-1 text-blue-400" />}
                                  </td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">S{getWeekOfYear(new Date(dashboardStartDate)) + (d.weekStart || d.secuencia) - 1}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentIniciado} onChange={v => handleCheck(d.statusKey, 'sentIniciado', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRevA} onChange={v => handleCheck(d.statusKey, 'sentRevA', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRevA)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.comentariosARecibidos} onChange={v => handleCheck(d.statusKey, 'comentariosARecibidos', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRevB} onChange={v => handleCheck(d.statusKey, 'sentRevB', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRevB)}</td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.comentariosBRecibidos} onChange={v => handleCheck(d.statusKey, 'comentariosBRecibidos', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-3 text-center"><DashboardCheckbox checked={d.status?.sentRev0} onChange={v => handleCheck(d.statusKey, 'sentRev0', v)} disabled={d.frozen || !isAdmin} /></td>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{formatDateShort(d.deadlineRev0)}</td>
                                  <td className="p-2 text-center">
                                    {d.frozen ? (
                                      <DashboardBadge variant="default">CONGELADO</DashboardBadge>
                                    ) : (
                                      <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                        {d.statusInfo.status}
                                      </DashboardBadge>
                                    )}
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
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Log de Avance</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs">Fechas de envío por revisión</p>
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
                              <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                <th className="p-2 text-center font-medium">#</th>
                                <th className="p-2 text-left font-medium">Código</th>
                                <th className="p-2 text-left font-medium">Descripción</th>
                                <th className="p-2 text-center font-medium">REV_A</th>
                                <th className="p-2 text-center font-medium">REV_B</th>
                                <th className="p-2 text-center font-medium">REV_0</th>
                                <th className="p-2 text-center font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliverables.map((d, i) => (
                                <tr key={d.id} className={`border-b border-neutral-200 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}>
                                  <td className="p-2 text-center text-neutral-500 dark:text-neutral-400">{d.id}</td>
                                  <td className={`p-2 text-neutral-600 dark:text-neutral-300 font-mono text-xs ${d.frozen ? 'line-through' : ''}`}>{d.codigo || '-'}</td>
                                  <td className={`p-2 text-neutral-800 dark:text-neutral-100 ${d.frozen ? 'line-through' : ''}`}>
                                    {d.nombre || d.name}
                                    {d.frozen && <Snowflake className="w-3 h-3 inline ml-1 text-blue-400" />}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRevADate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRevADate ? formatDateFull(d.status.sentRevADate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRevBDate ? formatDateFull(d.status.sentRevBDate) : '-'}
                                  </td>
                                  <td className={`p-2 text-center ${d.frozen ? 'text-neutral-400' : d.status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {d.frozen ? '-' : d.status?.sentRev0Date ? formatDateFull(d.status.sentRev0Date) : '-'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {d.frozen ? (
                                      <DashboardBadge variant="default">CONGELADO</DashboardBadge>
                                    ) : (
                                      <DashboardBadge variant={d.statusInfo.status === 'TERMINADO' ? 'success' : d.statusInfo.status === 'ATRASADO' ? 'danger' : d.statusInfo.status === 'En Proceso' ? 'warning' : 'default'}>
                                        {d.statusInfo.status}
                                      </DashboardBadge>
                                    )}
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
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                          <h3 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Carta Gantt</h3>
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Visualización temporal del proyecto</p>
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
                              
                              // Usar semanas del año (continuidad anual)
                              const startWeekOfYear = getWeekOfYear(startDate);
                              const weeks = Array.from({ length: weeksToShow }, (_, i) => {
                                const weekDate = addWeeks(startDate, i);
                                return { num: startWeekOfYear + i, date: weekDate };
                              });
                              
                              // Función para determinar el estado visual de cada entregable
                              const getGanttBars = (d) => {
                                const bars = [];
                                const revAWeek = d.weekStart;
                                const revBWeek = revAWeek + 2;
                                const rev0Week = revBWeek + 3;
                                
                                // Si está TERMINADO (sentRev0 = true), mostrar barra verde completa
                                if (d.status?.sentRev0) {
                                  bars.push({
                                    start: revAWeek,
                                    width: rev0Week - revAWeek + 1,
                                    color: 'bg-green-500',
                                    label: 'TERMINADO'
                                  });
                                  return bars;
                                }
                                
                                // REV_A: desde weekStart hasta deadline REV_A (2 semanas)
                                if (d.status?.sentIniciado || d.status?.sentRevA) {
                                  bars.push({
                                    start: revAWeek,
                                    width: 2,
                                    color: d.status?.sentRevA ? 'bg-green-500' : 'bg-orange-400',
                                    label: d.status?.sentRevA ? 'REV_A ✓' : 'REV_A en proceso'
                                  });
                                }

                                // REV_B: solo si ya se envió REV_A Y se recibieron comentarios A
                                if (d.status?.comentariosARecibidos) {
                                  bars.push({
                                    start: revBWeek,
                                    width: 3,
                                    color: d.status?.sentRevB ? 'bg-green-500' : 'bg-blue-400',
                                    label: d.status?.sentRevB ? 'REV_B ✓' : 'REV_B en proceso'
                                  });
                                }

                                // REV_0: solo si ya se envió REV_B Y se recibieron comentarios B
                                if (d.status?.comentariosBRecibidos) {
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
                                  <div className="flex border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                                    <div style={{ width: labelWidth, minWidth: labelWidth }} className="p-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">Entregable</div>
                                    <div className="flex">
                                      {weeks.map(w => (
                                        <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className="p-1 text-center text-[10px] text-neutral-500 dark:text-neutral-400 border-l border-neutral-200 dark:border-neutral-700">
                                          S{w.num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Filas de entregables */}
                                  {deliverables.map((d, i) => {
                                    const bars = d.frozen ? [] : getGanttBars(d);

                                    return (
                                      <div key={d.id} className={`flex border-b border-neutral-100 dark:border-neutral-700 ${d.frozen ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' : i % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : 'bg-white'}`}>
                                        <div style={{ width: labelWidth, minWidth: labelWidth }} className={`p-2 text-[10px] text-neutral-700 dark:text-neutral-200 truncate flex items-center gap-1 ${d.frozen ? 'line-through' : ''}`}>
                                          {d.frozen ? (
                                            <Snowflake className="w-2 h-2 text-blue-400" />
                                          ) : (
                                            <div className={`w-2 h-2 rounded-full ${d.statusInfo.color}`} />
                                          )}
                                          {d.nombre || d.name}
                                        </div>
                                        <div className="flex relative" style={{ height: rowHeight }}>
                                          {/* Grid de semanas */}
                                          {weeks.map(w => (
                                            <div key={w.num} style={{ width: weekWidth, minWidth: weekWidth }} className="border-l border-neutral-100 dark:border-neutral-700" />
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
                                              <span className="text-[8px] text-neutral-500 dark:text-neutral-400 px-1">Pendiente</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Leyenda */}
                                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-neutral-200 rounded-sm" />
                                      <span className="text-xs text-neutral-600 dark:text-neutral-300">Pendiente</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-orange-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600 dark:text-neutral-300">REV_A en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-blue-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600 dark:text-neutral-300">REV_B en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-purple-400 rounded-sm" />
                                      <span className="text-xs text-neutral-600 dark:text-neutral-300">REV_0 en proceso</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-3 bg-green-500 rounded-sm" />
                                      <span className="text-xs text-neutral-600 dark:text-neutral-300">Completado</span>
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

      {/* Modal Nuevo Proyecto - Inline para evitar pérdida de foco */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
          <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-base sm:text-lg font-medium">Nuevo Proyecto</h2>
              <button
                onClick={() => setShowNewProject(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Código de Proyecto"
                placeholder="Ej: P2602"
                value={newProject.id}
                onChange={e => setNewProject(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
              />

              <Input
                label="Nombre del Proyecto"
                placeholder="Ej: Escondida - Fase 3"
                value={newProject.nombre}
                onChange={e => setNewProject(prev => ({ ...prev, nombre: e.target.value }))}
              />

              <Input
                label="Cliente"
                placeholder="Ej: BHP Billiton"
                value={newProject.cliente}
                onChange={e => setNewProject(prev => ({ ...prev, cliente: e.target.value }))}
              />

              <Input
                label="Jefe de Proyecto"
                placeholder="Ej: Juan Pérez"
                value={newProject.jefeProyecto}
                onChange={e => setNewProject(prev => ({ ...prev, jefeProyecto: e.target.value }))}
              />

              {/* Campo de carga de Excel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-600 dark:text-neutral-300 font-medium text-xs uppercase tracking-wider">
                    Entregables (Excel) *
                  </label>
                  <a
                    href="/Entregables_Ejemplo.xlsx"
                    download="Entregables_Plantilla.xlsx"
                    className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <FileDown className="w-3 h-3" />
                    Descargar plantilla
                  </a>
                </div>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-neutral-400 dark:text-neutral-500 mb-2" />
                    {excelFileName ? (
                      <p className="text-sm text-green-600 font-medium">{excelFileName}</p>
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Click para subir Excel</p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Columnas: Código, Descripción, Secuencia, REV_A (HsH), REV_B (HsH), REV_0 (HsH)
                    </p>
                  </label>
                </div>
                {excelError && (
                  <p className="text-xs text-red-500">{excelError}</p>
                )}
                {newProject.entregables.length > 0 && (
                  <p className="text-xs text-green-600">
                    ✓ {newProject.entregables.length} entregables cargados
                  </p>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowNewProject(false);
                    setExcelFileName('');
                    setExcelError('');
                  }}
                  className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-200 rounded font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  className={`flex-1 px-4 py-3 rounded font-medium text-sm transition-colors ${
                    newProject.id && newProject.nombre && newProject.entregables.length > 0
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-neutral-300 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  }`}
                  disabled={!newProject.id || !newProject.nombre || newProject.entregables.length === 0}
                  onClick={async () => {
                    if (newProject.id && newProject.nombre && newProject.entregables.length > 0) {
                      // Crear proyecto con sus entregables personalizados
                      const nuevoProyecto = {
                        id: newProject.id,
                        nombre: newProject.nombre,
                        cliente: newProject.cliente,
                        jefeProyecto: newProject.jefeProyecto,
                        tarifaVenta: newProject.tarifaVenta,
                        estado: 'Activo',
                        inicio: new Date().toISOString().split('T')[0],
                        avance: 0,
                        entregables: newProject.entregables.map(e => ({
                          ...e,
                          weekStart: e.secuencia // Usar secuencia como weekStart
                        }))
                      };

                      // Guardar en Firestore
                      await saveProyecto(nuevoProyecto);

                      // Inicializar statusData para los nuevos entregables
                      const newStatusData = { ...statusData };
                      newProject.entregables.forEach(ent => {
                        const key = `${newProject.id}_${ent.id}`;
                        newStatusData[key] = {
                          sentIniciado: false,
                          sentRevA: false,
                          sentRevADate: null,
                          comentariosARecibidos: false,
                          comentariosARecibidosDate: null,
                          sentRevB: false,
                          sentRevBDate: null,
                          comentariosBRecibidos: false,
                          comentariosBRecibidosDate: null,
                          sentRev0: false,
                          sentRev0Date: null,
                        };
                      });
                      setStatusData(newStatusData);

                      // Limpiar formulario
                      setNewProject({ id: '', nombre: '', cliente: '', jefeProyecto: '', tarifaVenta: 1.2, entregables: [] });
                      setExcelFileName('');
                      setExcelError('');
                      setShowNewProject(false);
                      showNotification('success', 'Proyecto creado correctamente');
                    }
                  }}
                >
                  Crear Proyecto
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Editar Fecha de Inicio */}
      {editDateOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-800 dark:text-neutral-100 text-lg font-medium">Editar Fecha de Inicio</h2>
              <button onClick={() => setEditDateOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full">
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
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
              <div className="no-print bg-white dark:bg-neutral-800 w-full max-w-2xl rounded-t-lg border-b border-neutral-200 dark:border-neutral-700 p-2 flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-neutral-800 dark:text-neutral-100 text-sm font-medium">Vista Previa PDF (2 páginas)</h2>
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
                    <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
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
                        <span className="text-neutral-800 dark:text-neutral-100">M</span>
                        <span className="text-orange-500">A</span>
                        <span className="text-neutral-800 dark:text-neutral-100">TRIZ</span>
                      </div>
                      <span className="text-[8px] text-neutral-400 dark:text-neutral-500 tracking-wider">ARCHITECTURE FOR ENGINEERING</span>
                    </div>
                    <div className="text-right">
                      <h1 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 uppercase">Log de Avance</h1>
                      <p className="text-[9px] text-neutral-500 dark:text-neutral-400">Informe de Estado</p>
                    </div>
                  </div>
                  
                  {/* Info del proyecto */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded text-[9px]">
                    <div>
                      <p><span className="text-neutral-500 dark:text-neutral-400">Código:</span> <span className="font-bold text-orange-600">{selectedProject}</span></p>
                      <p><span className="text-neutral-500 dark:text-neutral-400">Nombre:</span> {proyectos.find(p => p.id === selectedProject)?.nombre}</p>
                      <p><span className="text-neutral-500 dark:text-neutral-400">Cliente:</span> {proyectos.find(p => p.id === selectedProject)?.cliente}</p>
                    </div>
                    <div>
                      <p><span className="text-neutral-500 dark:text-neutral-400">Fecha:</span> {new Date().toLocaleDateString('es-CL')}</p>
                      <p><span className="text-neutral-500 dark:text-neutral-400">Inicio:</span> {dashboardStartDate.split('-').reverse().join('/')}</p>
                    </div>
                  </div>
                  
                  {/* Resumen */}
                  {(() => {
                    // Obtener entregables del proyecto específico para impresión
                    const proyectoImpr = proyectos.find(p => p.id === selectedProject);
                    const entregablesImpr = proyectoImpr?.entregables || ENTREGABLES_PROYECTO;
                    const usaPersonalizados = proyectoImpr?.entregables?.length > 0;
                    const getStatusKey = (d) => usaPersonalizados ? `${selectedProject}_${d.id}` : d.id;

                    return (
                      <>
                        <div className="grid grid-cols-5 gap-1 mb-3">
                          <div className="text-center p-1.5 bg-neutral-100 rounded">
                            <p className="text-base font-bold text-neutral-800 dark:text-neutral-100">{entregablesImpr.length}</p>
                            <p className="text-[7px] text-neutral-500 dark:text-neutral-400">TOTAL</p>
                          </div>
                          <div className="text-center p-1.5 bg-green-50 rounded border border-green-200">
                            <p className="text-base font-bold text-green-600">{entregablesImpr.filter(d => statusData[getStatusKey(d)]?.sentRev0).length}</p>
                            <p className="text-[7px] text-green-600">LISTOS</p>
                          </div>
                          <div className="text-center p-1.5 bg-orange-50 rounded border border-orange-200">
                            <p className="text-base font-bold text-orange-500">{entregablesImpr.filter(d => statusData[getStatusKey(d)]?.sentIniciado && !statusData[getStatusKey(d)]?.sentRev0).length}</p>
                            <p className="text-[7px] text-orange-500">PROCESO</p>
                          </div>
                          <div className="text-center p-1.5 bg-red-50 rounded border border-red-200">
                            <p className="text-base font-bold text-red-500">{entregablesImpr.filter(d => {
                              const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia);
                              return !statusData[getStatusKey(d)]?.sentRev0 && new Date() > deadlines.deadlineRevA;
                            }).length}</p>
                            <p className="text-[7px] text-red-500">ATRASO</p>
                          </div>
                          <div className="text-center p-1.5 bg-blue-50 rounded border border-blue-200">
                            <p className="text-base font-bold text-blue-600">{((entregablesImpr.filter(d => statusData[getStatusKey(d)]?.sentRev0).length / entregablesImpr.length) * 100).toFixed(0)}%</p>
                            <p className="text-[7px] text-blue-600">AVANCE</p>
                          </div>
                        </div>
              
              {/* Tabla Página 1 - Primera mitad */}
                        <p className="text-[8px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Entregables 1-{Math.ceil(entregablesImpr.length / 2)}</p>
                        <table className="w-full text-[8px] border-collapse mb-3">
                          <thead>
                            <tr className="bg-neutral-800 text-white">
                              <th className="border border-neutral-600 px-1 py-0.5 text-center w-5">#</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-left">Código</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-left">Descripción</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_A</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_B</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_0</th>
                              <th className="border border-neutral-600 px-1 py-0.5 text-center w-14">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entregablesImpr.slice(0, Math.ceil(entregablesImpr.length / 2)).map((d, i) => {
                              const status = statusData[getStatusKey(d)];
                              const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia);
                              const info = calculateStatus(status, deadlines);
                              return (
                                <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50 dark:bg-neutral-800/50'}>
                                  <td className="border border-neutral-300 px-1 py-0.5 text-center">{d.id}</td>
                                  <td className="border border-neutral-300 px-1 py-0.5 font-mono">{d.codigo || '-'}</td>
                                  <td className="border border-neutral-300 px-1 py-0.5">{d.nombre || d.name}</td>
                                  <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevADate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {status?.sentRevADate || '-'}
                                  </td>
                                  <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {status?.sentRevBDate || '-'}
                                  </td>
                                  <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                    {status?.sentRev0Date || '-'}
                                  </td>
                                  <td className="border border-neutral-300 px-1 py-0.5 text-center">
                                    <span className={`px-1 rounded text-[6px] ${
                                      info.status === 'TERMINADO' ? 'bg-green-100 text-green-700' :
                                      info.status === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                                      info.status === 'En Proceso' ? 'bg-orange-100 text-orange-700' :
                                      'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                                    }`}>{info.status === 'En Proceso' ? 'Proceso' : info.status}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        <div className="flex justify-between text-[7px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <span>MATRIZ © 2026</span>
                          <span>Página 1 de 2</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
            
            {/* Separador entre páginas - NO IMPRIMIR */}
            <div className="no-print h-4 w-full max-w-2xl bg-neutral-50 dark:bg-neutral-800/500 flex items-center justify-center">
              <span className="text-[8px] text-white">--- Corte de página ---</span>
            </div>
            
            {/* PÁGINA 2 */}
            <div className="print-page-2 bg-white shadow-xl w-full max-w-2xl" style={{ padding: '24px' }}>
              {/* Header Página 2 */}
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-3">
                <div className="text-sm font-light tracking-widest">
                  <span className="text-neutral-800 dark:text-neutral-100">M</span>
                  <span className="text-orange-500">A</span>
                  <span className="text-neutral-800 dark:text-neutral-100">TRIZ</span>
                </div>
                <div className="text-[8px] text-neutral-500 dark:text-neutral-400">
                  {selectedProject} • Log de Avance • {new Date().toLocaleDateString('es-CL')}
                </div>
              </div>
              
              {/* Tabla Página 2 - Segunda mitad */}
              {(() => {
                const proyectoImpr2 = proyectos.find(p => p.id === selectedProject);
                const entregablesImpr2 = proyectoImpr2?.entregables || ENTREGABLES_PROYECTO;
                const usaPersonalizados2 = proyectoImpr2?.entregables?.length > 0;
                const getStatusKey2 = (d) => usaPersonalizados2 ? `${selectedProject}_${d.id}` : d.id;
                const mitad = Math.ceil(entregablesImpr2.length / 2);

                return (
                  <>
                    <p className="text-[8px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase mb-1">Entregables {mitad + 1}-{entregablesImpr2.length}</p>
                    <table className="w-full text-[8px] border-collapse mb-4">
                      <thead>
                        <tr className="bg-neutral-800 text-white">
                          <th className="border border-neutral-600 px-1 py-0.5 text-center w-5">#</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-left">Código</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-left">Descripción</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_A</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_B</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-center w-16">REV_0</th>
                          <th className="border border-neutral-600 px-1 py-0.5 text-center w-14">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entregablesImpr2.slice(mitad).map((d, i) => {
                          const status = statusData[getStatusKey2(d)];
                          const deadlines = calculateDeadlines(dashboardStartDate, d.weekStart || d.secuencia);
                          const info = calculateStatus(status, deadlines);
                          return (
                            <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50 dark:bg-neutral-800/50'}>
                              <td className="border border-neutral-300 px-1 py-0.5 text-center">{d.id}</td>
                              <td className="border border-neutral-300 px-1 py-0.5 font-mono">{d.codigo || '-'}</td>
                              <td className="border border-neutral-300 px-1 py-0.5">{d.nombre || d.name}</td>
                              <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevADate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                {status?.sentRevADate || '-'}
                              </td>
                              <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRevBDate ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                {status?.sentRevBDate || '-'}
                              </td>
                              <td className={`border border-neutral-300 px-1 py-0.5 text-center ${status?.sentRev0Date ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                {status?.sentRev0Date || '-'}
                              </td>
                              <td className="border border-neutral-300 px-1 py-0.5 text-center">
                                <span className={`px-1 rounded text-[6px] ${
                                  info.status === 'TERMINADO' ? 'bg-green-100 text-green-700' :
                                  info.status === 'ATRASADO' ? 'bg-red-100 text-red-700' :
                                  info.status === 'En Proceso' ? 'bg-orange-100 text-orange-700' :
                                  'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                                }`}>{info.status === 'En Proceso' ? 'Proceso' : info.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                );
              })()}
              
              {/* Leyenda */}
              <div className="mb-4 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <p className="text-[8px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">Leyenda</p>
                <div className="flex flex-wrap gap-3 text-[8px]">
                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">TERMINADO</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Proceso</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">ATRASADO</span>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">Pendiente</span>
                </div>
              </div>
              
              {/* Firmas */}
              <div className="grid grid-cols-2 gap-8 mb-4">
                <div className="border-t border-neutral-300 pt-2 mt-6">
                  <p className="text-[8px] text-neutral-500 dark:text-neutral-400 text-center">Preparado por</p>
                </div>
                <div className="border-t border-neutral-300 pt-2 mt-6">
                  <p className="text-[8px] text-neutral-500 dark:text-neutral-400 text-center">Revisado por</p>
                </div>
              </div>
              
              {/* Pie Página 2 */}
              <div className="border-t-2 border-orange-500 pt-2">
                <div className="flex justify-between text-[7px] text-neutral-400 dark:text-neutral-500">
                  <div>
                    <p className="font-medium text-neutral-600 dark:text-neutral-300">MATRIZ - Sistema de Gestión de Proyectos</p>
                    <p>www.matriz.cl</p>
                  </div>
                  <p>Página 2 de 2</p>
                </div>
              </div>
            </div>
            </div>{/* Fin print-content */}
            
            {/* Botón cerrar al final - NO IMPRIMIR */}
            <div className="no-print bg-white dark:bg-neutral-800 w-full max-w-2xl rounded-b-lg p-2 flex justify-center">
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
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Eliminar Proyecto</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                ¿Estás seguro de que deseas eliminar el siguiente proyecto?
              </p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <Building2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-mono text-orange-600 font-medium">{projectToDelete.id}</p>
                  <p className="text-neutral-800 dark:text-neutral-100">{projectToDelete.nombre}</p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs">{projectToDelete.cliente}</p>
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
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Editar Proyecto</h2>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-4 text-center text-neutral-500 dark:text-neutral-400 text-xs">
        MATRIZ © 2026 • {currentUser?.nombre} ({isAdmin ? 'Admin' : 'Profesional'})
      </footer>
    </div>
  );
}
