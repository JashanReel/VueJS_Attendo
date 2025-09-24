import { supabase } from "./authmgr";

export async function fetchSessionCompoById(id) {
  try {
    const { data, error } = await supabase
      .from('session_compo')
      .select(`
        id,
        ue,
        session,
        session:session(label)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'UE :", error);
    throw error;
  }
}

export async function fetchEventsBySessionCompoId(sessionCompoId) {
  try {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .eq('session_compo', sessionCompoId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des épreuves :", error);
    throw error;
  }
}

export async function addEvent(sessionCompoId, label) {
  try {
    const { data, error } = await supabase
      .from('event')
      .insert([{
        session_compo: sessionCompoId,
        label: label,
        completed: false
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'épreuve :", error);
    throw error;
  }
}