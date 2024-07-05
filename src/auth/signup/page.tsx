"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres" }),
  cnpj: z
    .string()
    .min(14, { message: "CNPJ deve ter 14 caracteres com máscara" })
    .optional(),
});

export default function SignUp() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      cnpj: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormData({ ...formData, ...values });
    if (step === 0) {
      setStep(step + 1);
    } else {
      console.log("Final data: ", { ...formData, ...values });
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 p-16 border"
        >
          {step === 0 && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">QUAL SEU NOME?</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>Este é o seu nome público.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {step === 1 && (
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">QUAL SEU CNPJ?</FormLabel>
                  <FormControl>
                    <Input placeholder="00000000000000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Este é o seu número de CNPJ.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit">{step === 0 ? "Próximo" : "Enviar"}</Button>
        </form>
      </Form>
    </div>
  );
}
