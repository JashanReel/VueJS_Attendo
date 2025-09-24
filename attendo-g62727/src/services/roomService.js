import { supabase } from "./authmgr";

export async function fetchEventById(eventId) {
  try {
    const { data, error } = await supabase
      .from('event')
      .select(`
        id,
        label,
        completed,
        session_compo,
        session_compo:session_compo(
          id,
          ue,
          session:session(id, label)
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'épreuve:", error);
    throw error;
  }
}

export async function countStudentsByRoomIds(roomIds) {
  try {
    if (!roomIds.length) return {};

    const countMap = {};

    // Pour chaque local, compter les examinations associées
    for (const roomId of roomIds) {
      const { count, error } = await supabase
        .from('examination')
        .select('*', { count: 'exact', head: true })
        // head true permet de ne pas récupérer le contenu des enregistrements, le count est plus rapide
        // https://github.com/orgs/supabase/discussions/517
        .eq('examination_room', roomId);

      if (error) throw error;
      countMap[roomId] = count || 0;
    }

    return countMap;
  } catch (error) {
    console.error("Erreur lors du comptage des étudiants par local:", error);
    throw error;
  }
}

export async function fetchRoomsByEventId(eventId) {
  try {
    // Récupérer les locaux assignés à cet événement avec les données de capacité
    const { data, error } = await supabase
      .from('examination_room')
      .select(`
        id,
        room,
        room:room(label, capacity),
        supervisor,
        supervisor:supervisor(acro, names),
        event
      `)
      .eq('event', eventId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des locaux:", error);
    throw error;
  }
}

export async function fetchAllRooms() {
  try {
    const { data, error } = await supabase
      .from('room')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des locaux:", error);
    throw error;
  }
}

export async function addRoomToEvent(eventId, roomLabel, supervisorAcro = null) {
  try {
    const { data, error } = await supabase
      .from('examination_room')
      .insert([{
        event: eventId,
        room: roomLabel,
        supervisor: supervisorAcro
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erreur lors de l'ajout du local à l'épreuve:", error);
    throw error;
  }
}