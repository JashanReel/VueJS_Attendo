import { supabase } from "./authmgr";

export async function fetchSessionById(sessionId) {
  try {
    const { data, error } = await supabase
      .from('session')
      .select('*')
      .eq('id', sessionId)
      .single();
      // essentiel pour que supabase ne retourne qu'un seul objet et non un tableau

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la session :", error);
    throw error;
  }
}

export async function fetchSessionUEs(sessionId) {
  try {
    const { data, error } = await supabase
      .from('session_compo')
      .select(`
        id,
        ue,
        session
      `)
      .eq('session', sessionId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des UE pour la session :", error);
    throw error;
  }
}

export async function fetchAllUEs() {
  try {
    const { data, error } = await supabase
      .from('ue')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des UE :", error);
    throw error;
  }
}

export async function addUEToSession(sessionId, ueCode) {
  try {
    const { data, error } = await supabase
      .from('session_compo')
      .insert([{
        session: sessionId,
        ue: ueCode
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'UE à la session :", error);
    throw error;
  }
}