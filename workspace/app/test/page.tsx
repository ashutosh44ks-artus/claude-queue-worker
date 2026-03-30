"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { useCounterStore } from "@/lib/stores/counter-store";
import { Tables } from "@/types/database.types";
import { addProductAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;
type Product = Tables<"Products">;

function isRlsError(message: string) {
  return /row-level security|42501/i.test(message);
}

function isAuthMissingError(message: string) {
  return /auth session missing|must be signed in|jwt/i.test(message);
}

export default function PackageTestPage() {
  const [showMotionBox, setShowMotionBox] = useState(true);
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 1,
    },
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Products")
        .select("id, name, price, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as Product[];
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const result = await addProductAction(values);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "Failed to add product");
      }

      return result.data;
    },
    onSuccess: (newProduct) => {
      toast.success("Product added to Supabase", {
        description: `${newProduct.name ?? "Unnamed"} • $${newProduct.price ?? 0}`,
      });
      form.reset({ name: "", price: 1 });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (isAuthMissingError(message)) {
        toast.error("Sign in required", {
          description: "Only authenticated users can add products with current policy.",
        });
        return;
      }

      if (isRlsError(message)) {
        toast.error("Insert blocked by Supabase RLS policy", {
          description: 'Create an INSERT policy for public."Products" in Supabase SQL editor.',
        });
        return;
      }

      toast.error("Failed to add product", { description: message });
    },
  });

  const onSubmit = (values: FormValues) => {
    addProductMutation.mutate(values);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6 md:p-10">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Package manual test page</h1>
        <p className="text-sm text-muted-foreground">
          Use this page to quickly verify configured packages in the template.
        </p>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">shadcn + sonner</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("Success toast works")}>Success Toast</Button>
          <Button
            variant="outline"
            onClick={() => toast.message("Info toast works", { description: "Sonner is active" })}
          >
            Info Toast
          </Button>
          <Button variant="destructive" onClick={() => toast.error("Error toast works")}>
            Error Toast
          </Button>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">supabase + react-hook-form + zod</h2>
        <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name
            </label>
            <input
              id="name"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <label htmlFor="price" className="text-sm font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price ? (
              <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={addProductMutation.isPending}>
              {addProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset({ name: "", price: 1 })}>
              Reset
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">framer-motion</h2>
        <Button variant="outline" onClick={() => setShowMotionBox((prev) => !prev)}>
          Toggle Animated Box
        </Button>
        <AnimatePresence mode="wait">
          {showMotionBox ? (
            <motion.div
              key="motion-box"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="h-20 w-full rounded-md border bg-muted/60 p-4 text-sm"
            >
              Framer Motion animation is working.
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">react-query products list</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => productsQuery.refetch()} disabled={productsQuery.isFetching}>
            {productsQuery.isFetching ? "Refreshing..." : "Refresh Products"}
          </Button>
          <span className="text-sm text-muted-foreground">Status: {productsQuery.status}</span>
        </div>

        {productsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading products...</p>
        ) : null}

        {productsQuery.error ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{productsQuery.error.message}</p>
            {isRlsError(productsQuery.error.message) ? (
              <p className="text-xs text-muted-foreground">
                RLS is blocking reads. Add a SELECT policy for public."Products".
              </p>
            ) : null}
          </div>
        ) : null}

        {productsQuery.data ? (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  productsQuery.data.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="px-3 py-2">{product.name ?? "Unnamed"}</td>
                      <td className="px-3 py-2">${product.price ?? 0}</td>
                      <td className="px-3 py-2">
                        {new Date(product.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">zustand</h2>
        <p className="text-sm">Global Count: {count}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={increment}>Increment</Button>
          <Button variant="outline" onClick={decrement}>
            Decrement
          </Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </section>
    </main>
  );
}
