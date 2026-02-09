// ============================================
// SERVICIO DE FIRESTORE
// ============================================
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// Nombres de las colecciones
const COLLECTIONS = {
  PROYECTOS: 'proyectos',
  COLABORADORES: 'colaboradores',
  HORAS: 'horas',
  STATUS_DATA: 'statusData',
  CONFIG: 'config',
  TAREAS: 'tareas',
  PRESENCIA: 'presencia'
};

// ============================================
// PROYECTOS
// ============================================
export const getProyectos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROYECTOS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting proyectos:', error);
    return [];
  }
};

export const saveProyecto = async (proyecto) => {
  try {
    // Usar el ID del proyecto como ID del documento
    await setDoc(doc(db, COLLECTIONS.PROYECTOS, proyecto.id), proyecto);
    return true;
  } catch (error) {
    console.error('Error saving proyecto:', error);
    return false;
  }
};

export const deleteProyecto = async (proyectoId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROYECTOS, proyectoId));
    return true;
  } catch (error) {
    console.error('Error deleting proyecto:', error);
    return false;
  }
};

// Listener en tiempo real para proyectos
export const subscribeToProyectos = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.PROYECTOS), (snapshot) => {
    const proyectos = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(proyectos);
  });
};

// ============================================
// COLABORADORES
// ============================================
export const getColaboradores = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COLABORADORES));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting colaboradores:', error);
    return [];
  }
};

export const saveColaborador = async (colaborador) => {
  try {
    // Usar el ID del colaborador como ID del documento
    await setDoc(doc(db, COLLECTIONS.COLABORADORES, String(colaborador.id)), colaborador);
    return true;
  } catch (error) {
    console.error('Error saving colaborador:', error);
    return false;
  }
};

export const deleteColaborador = async (colaboradorId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COLABORADORES, String(colaboradorId)));
    return true;
  } catch (error) {
    console.error('Error deleting colaborador:', error);
    return false;
  }
};

export const subscribeToColaboradores = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.COLABORADORES), (snapshot) => {
    const colaboradores = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(colaboradores);
  });
};

// ============================================
// HORAS REGISTRADAS
// ============================================
export const getHoras = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.HORAS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting horas:', error);
    return [];
  }
};

export const saveHora = async (hora) => {
  try {
    // Para horas, usamos addDoc para generar IDs automáticos
    if (hora._docId) {
      await setDoc(doc(db, COLLECTIONS.HORAS, hora._docId), hora);
    } else {
      await addDoc(collection(db, COLLECTIONS.HORAS), hora);
    }
    return true;
  } catch (error) {
    console.error('Error saving hora:', error);
    return false;
  }
};

export const deleteHora = async (horaDocId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HORAS, horaDocId));
    return true;
  } catch (error) {
    console.error('Error deleting hora:', error);
    return false;
  }
};

export const subscribeToHoras = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.HORAS), (snapshot) => {
    const horas = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(horas);
  });
};

// ============================================
// STATUS DATA (para el dashboard de proyectos)
// ============================================
export const getStatusData = async () => {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, 'statusData');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data || {};
    }
    return {};
  } catch (error) {
    console.error('Error getting statusData:', error);
    return {};
  }
};

export const saveStatusData = async (statusData) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'statusData'), { data: statusData });
    return true;
  } catch (error) {
    console.error('Error saving statusData:', error);
    return false;
  }
};

export const subscribeToStatusData = (callback) => {
  return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'statusData'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().data || {});
    } else {
      callback({});
    }
  });
};

// ============================================
// TAREAS
// ============================================
export const getTareas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TAREAS));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
  } catch (error) {
    console.error('Error getting tareas:', error);
    return [];
  }
};

export const saveTarea = async (tarea) => {
  try {
    if (tarea._docId) {
      // Actualizar tarea existente
      await setDoc(doc(db, COLLECTIONS.TAREAS, tarea._docId), tarea);
    } else {
      // Nueva tarea - generar ID automático
      await addDoc(collection(db, COLLECTIONS.TAREAS), tarea);
    }
    return true;
  } catch (error) {
    console.error('Error saving tarea:', error);
    return false;
  }
};

export const deleteTarea = async (tareaDocId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TAREAS, tareaDocId));
    return true;
  } catch (error) {
    console.error('Error deleting tarea:', error);
    return false;
  }
};

export const subscribeToTareas = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.TAREAS), (snapshot) => {
    const tareas = snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    callback(tareas);
  });
};

// ============================================
// PRESENCIA (Usuarios en línea)
// ============================================
export const updatePresencia = async (profesionalId, datos) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRESENCIA, String(profesionalId)), {
      ...datos,
      profesionalId,
      ultimaActividad: new Date().toISOString(),
      online: true
    });
    return true;
  } catch (error) {
    console.error('Error updating presencia:', error);
    return false;
  }
};

export const setOffline = async (profesionalId) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRESENCIA, String(profesionalId)), {
      profesionalId,
      ultimaActividad: new Date().toISOString(),
      online: false
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting offline:', error);
    return false;
  }
};

export const subscribeToPresencia = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.PRESENCIA), (snapshot) => {
    const presencia = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(presencia);
  });
};

// ============================================
// UTILIDADES
// ============================================

// Guardar todos los proyectos de una vez (útil para migración inicial)
export const saveAllProyectos = async (proyectos) => {
  try {
    for (const proyecto of proyectos) {
      await saveProyecto(proyecto);
    }
    return true;
  } catch (error) {
    console.error('Error saving all proyectos:', error);
    return false;
  }
};

// Guardar todos los colaboradores de una vez
export const saveAllColaboradores = async (colaboradores) => {
  try {
    for (const colaborador of colaboradores) {
      await saveColaborador(colaborador);
    }
    return true;
  } catch (error) {
    console.error('Error saving all colaboradores:', error);
    return false;
  }
};

// Guardar todas las horas de una vez
export const saveAllHoras = async (horas) => {
  try {
    for (const hora of horas) {
      await saveHora(hora);
    }
    return true;
  } catch (error) {
    console.error('Error saving all horas:', error);
    return false;
  }
};
