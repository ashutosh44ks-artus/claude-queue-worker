"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/types/database.types";

const addProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
});

type Product = Tables<"Products">;

type AddProductResult = {
  data: Product | null;
  error: string | null;
};

function isMissingAuthSession(message: string) {
  return /auth session missing/i.test(message);
}

export async function addProductAction(input: {
  name: string;
  price: number;
}): Promise<AddProductResult> {
  const parsed = addProductSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid product payload" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (isMissingAuthSession(userError.message)) {
      return { data: null, error: "You must be signed in to add products" };
    }
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to add products" };
  }

  const { data, error } = await supabase
    .from("Products")
    .insert({
      name: parsed.data.name,
      price: parsed.data.price,
    })
    .select("id, name, price, created_at")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Product, error: null };
}
