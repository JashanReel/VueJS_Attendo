import { supabase } from "./authmgr";

// Récupérer les détails d'un local d'examen spécifique
export async function fetchExaminationRoomById(roomId) {
  try {
    const { data, error } = await supabase
      .from('examination_room')
      .select(`
        id,
        room,
        room:room(label, capacity),
        supervisor,
        supervisor:supervisor(acro, names),
        event,
        event:event(
          id,
          label,
          session_compo:session_compo(
            id,
            ue,
            session:session(id, label)
          )
        )
      `)
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du local:", error);
    throw error;
  }
}

// Récupérer les étudiants inscrits à une UE spécifique
export async function fetchStudentsByUE(ueCode) {
  try {
    const { data, error } = await supabase
      .from('pae')
      .select(`
        id,
        student_id,
        group,
        ue,
        student:student_id(
          student_id,
          firstname,
          lastname
        )
      `)
      .eq('ue', ueCode);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants:", error);
    throw error;
  }
}

// Récupérer les présences actuelles dans un local
export async function fetchPresencesByRoom(roomId) {
  try {
    const { data, error } = await supabase
      .from('examination')
      .select(`
        id,
        student,
        examination_room
      `)
      .eq('examination_room', roomId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des présences:", error);
    throw error;
  }
}

// Marquer un étudiant comme présent
export async function markStudentPresent(roomId, studentId) {
  try {
    const { data, error } = await supabase
      .from('examination')
      .insert([{
        examination_room: roomId,
        student: studentId
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erreur lors de l'ajout de la présence:", error);
    throw error;
  }
}

// Marquer un étudiant comme absent (supprimer sa présence)
export async function markStudentAbsent(examinationId) {
  try {
    const { error } = await supabase
      .from('examination')
      .delete()
      .eq('id', examinationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la présence:", error);
    throw error;
  }
}

// Mettre à jour le surveillant d'un local
export async function updateSupervisor(roomId, supervisorAcro) {
  try {
    const { data, error } = await supabase
      .from('examination_room')
      .update({ supervisor: supervisorAcro })
      .eq('id', roomId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erreur lors de la mise à jour du surveillant:", error);
    throw error;
  }
}

// Récupérer tous les enseignants
export async function fetchAllTeachers() {
  try {
    const { data, error } = await supabase
      .from('teacher')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des enseignants:", error);
    throw error;
  }
}