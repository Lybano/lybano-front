"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import { fetchCnpjData } from "@/services/cnpj-service";
import { ChatbotDrawer } from "@/components/chat";
import { ChatIcon } from "@/assets/chat-icon";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres" }),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, { message: "CNPJ deve ter 14 dígitos numéricos" })
    .optional(),
  fantasyName: z.string().optional(),
  cnae: z.string().optional(),
  address: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
});

export default function SignUp() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ username: "", cnpj: "" });
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  async function handleNextStep() {
    const isValid = await form.trigger("username");
    if (isValid) {
      const values = form.getValues();
      setFormData({ ...formData, ...values });
      setStep(step + 1);
    }
  }

  async function handleCnpjLookup() {
    const isValid = await form.trigger("cnpj");
    if (isValid) {
      setLoading(true);
      setError(null);
      try {
        const cnpjData = await fetchCnpjData(form.getValues().cnpj);
        setCnpjData(cnpjData);
        setStep(2);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao buscar dados do CNPJ"
        );
      } finally {
        setLoading(false);
      }
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Final data: ", { ...formData, ...values, cnpjData });
  }

  function onBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-blue-50">
      <div className="flex flex-col justify-start p-16 rounded-l-lg">
        <div className="flex p-2 flex-col items-center justify-center w-full max-w-4xl">
          <h1 className="text-4xl font-extrabold">Sistema Lybano</h1>
          <p className="text-lg text-center font-medium">
            Bem-vindo! Por favor, preencha seus dados.
          </p>
          <Button
            onClick={() => setShowChatbot(true)}
            className="my-2 flex flex-row gap-1"
          >
            Assistente Virtual
            <ChatIcon />
          </Button>
        </div>
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Qual seu nome?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={step !== 0}
                        className="border border-gray-300 rounded-lg p-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Este é o seu nome público.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Qual seu CNPJ?
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000000000000"
                            {...field}
                            className="border border-gray-300 rounded-lg p-2"
                          />
                        </FormControl>
                        <FormDescription>
                          Este é o seu número de CNPJ.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleCnpjLookup}
                    disabled={loading}
                  >
                    {loading ? "Buscando..." : "Buscar CNPJ"}
                  </Button>
                  {error && <div className="text-red-500">{error}</div>}
                </>
              )}
              {step === 2 && cnpjData && (
                <div className="bg-blue-50 rounded-lg p-4 mt-6 shadow-md w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.number_cnpj}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">
                            Razão Social
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.razaoSocial || field.value}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fantasyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">
                            Nome Fantasia
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.nomeFantasia || ""}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">CNAE</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.cnae || ""}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Endereço</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.endereco || ""}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Telefone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.telefone || ""}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled
                              value={cnpjData.email || ""}
                              className="border border-gray-300 rounded-lg p-2"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-4">
                {step > 0 && (
                  <Button type="button" className="w-full" onClick={onBack}>
                    Voltar
                  </Button>
                )}
                {step < 1 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full"
                  >
                    Próximo
                  </Button>
                )}
                {step > 1 && <Button type="submit">Enviar</Button>}
              </div>
            </form>
          </Form>
        </div>
      </div>
      {showChatbot && <ChatbotDrawer onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
