import { supabase } from "./authmgr";

export async function fetchSessions() {
  try {
    const { data, error } = await supabase.from('session').select('*')

    if (error) throw error
    else return data
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions : ", error)
    throw error
  }
}

export async function addSession(sessionName) {
  try {
    const { data, error } = await supabase
                                  .from('session')
                                  .insert([{label: sessionName}])
                                  .select()

    if (error) throw error
    return data[0]
    // récupérer la seule ligne insérée, data est un tableau contenant les lignes insérées
  } catch (error) {
     console.error("Erreur lors de l'ajout d'une session : ", error)
     throw error
  }
}