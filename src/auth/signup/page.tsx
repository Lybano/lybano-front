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
import { ChatbotModal } from "@/components/chat";
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
    <div className="h-screen flex flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`space-y-8 p-8 md:p-16 shadow-2xl flex flex-col md:flex-row md:space-x-8 rounded-lg ${
            step > 1 ? "mt-32" : ""
          }`}
        >
          <div className="flex-1">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base flex items-center">
                    QUAL SEU NOME?
                    <button
                      type="button"
                      onClick={() => setShowChatbot(true)}
                      className="ml-2"
                    >
                      <ChatIcon />
                    </button>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={step !== 0}
                    />
                  </FormControl>
                  <FormDescription>Este é o seu nome público.</FormDescription>
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
                      <FormLabel className="font-bold flex items-center">
                        QUAL SEU CNPJ?
                        <button
                          type="button"
                          onClick={() => setShowChatbot(true)}
                          className="ml-2"
                        >
                          <ChatIcon />
                        </button>
                      </FormLabel>
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
              <>
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
                          value={cnpjData.cnpj}
                          placeholder={cnpjData.number_cnpj}
                        />
                      </FormControl>
                      <FormDescription>
                        Este é o seu número de CNPJ.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          value={cnpjData.razaoSocial || field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex-1 ml-8 p-4 border border-gray-200 rounded min-h-[200px]">
                  <h3 className="font-bold text-lg">Informações do CNPJ</h3>
                  <p>
                    <strong>Razão Social:</strong> {cnpjData.razaoSocial || ""}
                  </p>
                  <p>
                    <strong>Nome Fantasia:</strong>{" "}
                    {cnpjData.nomeFantasia || ""}
                  </p>
                  <p>
                    <strong>CNAE:</strong> {cnpjData.cnae || ""}
                  </p>
                  <p>
                    <strong>Proprietários:</strong>
                  </p>
                  <ul>
                    {cnpjData.proprietarios &&
                    cnpjData.proprietarios.length > 0 ? (
                      cnpjData.proprietarios.map(
                        (proprietario: string, index: number) => (
                          <li key={index}>{proprietario}</li>
                        )
                      )
                    ) : (
                      <li>Nenhum proprietário encontrado.</li>
                    )}
                  </ul>
                  <p>
                    <strong>Endereço:</strong> {cnpjData.endereco || ""}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {cnpjData.telefone || ""}
                  </p>
                  <p>
                    <strong>Email:</strong> {cnpjData.email || ""}
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-between mt-4">
              {step > 0 && (
                <Button type="button" onClick={onBack}>
                  Voltar
                </Button>
              )}
              {step < 1 && (
                <Button type="button" onClick={handleNextStep}>
                  Próximo
                </Button>
              )}
              {step > 1 && <Button type="submit">Enviar</Button>}
            </div>
          </div>
        </form>
      </Form>
      {showChatbot && <ChatbotModal onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
