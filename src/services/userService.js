import { supabase } from "./supabaseClient";
import CryptoJS from "crypto-js";

// Login
export async function login(email, password) {
    debugger;
  const hash = CryptoJS.SHA256(password).toString().toUpperCase();

  const { data, error } = await supabase
    .from("Usuarios")
    .select("*")
    .eq("Email", email)
    .eq("Password", hash)
    .single();

  if (error || !data) throw new Error("Credenciales incorrectas");
  return data;
}

// CRUD usuarios (opcional)
export async function getUsuarios() {
  const { data, error } = await supabase.from("Usuarios").select("*");
  if (error) throw error;
  return data;
}
