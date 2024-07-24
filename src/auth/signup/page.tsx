"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { getCnpjData, postCnpjData } from "@/services/cnpj-service";
import { ChatbotModal } from "@/components/chat";
import { ChatIcon } from "@/assets/chat-icon";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres" }),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, { message: "CNPJ deve ter 14 dígitos numéricos" })
    .optional(),
  razaoSocial: z.string().optional(),
  fantasyName: z.string().optional(),
  cnae: z.string().optional(),
  address: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  prestadora_servico: z.enum(["Presta serviços", "Vende produtos"]).optional(),
  ramo: z.string().optional(),
});

export default function SignUp() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ username: "", cnpj: "" });
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [cnpjConfirmed, setCnpjConfirmed] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  const formatCnpj = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCnpj(e.target.value);
    form.setValue("cnpj", formattedValue);
  };

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
        console.log("Fetching CNPJ data...");
        const cnpjData = await getCnpjData(form.getValues().cnpj);
        console.log("CNPJ Data:", cnpjData);
        setCnpjData(cnpjData);
        setStep(2);
      } catch (err) {
        console.error("Error:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao buscar dados do CNPJ"
        );
      } finally {
        setLoading(false);
      }
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      await postCnpjData(values);
      setSuccessMessage("CNPJ cadastrado com sucesso!");
      setTimeout(() => {
        setRedirecting(true);
        router.push("/under-construction");
      }, 5000);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Erro ao cadastrar CNPJ");
    } finally {
      setLoading(false);
    }
  }

  function onBack() {
    if (step > 0) {
      setStep(step - 1);
      setCnpjConfirmed(false);
    }
  }

  function confirmCnpjData() {
    setCnpjConfirmed(true);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground">
      {successMessage && !redirecting ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-primary bg-opacity-75 text-primary-foreground z-50">
          <h1 className="text-4xl font-bold">{successMessage}</h1>
          <p className="mt-4 text-lg">Redirecionando...</p>
        </div>
      ) : (
        <div className="flex flex-col justify-start p-16 rounded-lg bg-card text-card-foreground">
          <div className="flex p-2 flex-col items-center justify-center w-full max-w-4xl">
            <h1 className="text-4xl font-extrabold text-primary">
              Sistema Lybano
            </h1>
            <p className="text-lg text-center font-medium">
              Bem-vindo! Por favor, preencha seus dados.
            </p>
            {step === 1 && (
              <Button
                onClick={() => setShowChatbot(true)}
                className="my-2 flex flex-row gap-1 bg-accent text-accent-foreground hover:bg-input"
              >
                Assistente Virtual
                <ChatIcon />
              </Button>
            )}
          </div>
          <div className="flex-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {step !== 2 && (
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-primary">
                          Qual seu nome?
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            disabled={step !== 0}
                            className="border border-border rounded-lg p-2 bg-[var(--input)] text-[var(--foreground)]"
                          />
                        </FormControl>
                        <FormDescription className="text-[var(--muted)]">
                          Este é o seu nome público.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-primary">
                            Qual seu CNPJ?
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000000000000"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleCnpjChange(e);
                              }}
                              className="border border-border rounded-lg p-2 bg-[var(--input)] text-[var(--foreground)]"
                            />
                          </FormControl>
                          <FormDescription className="text-[var(--muted)]">
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
                      className="mt-4 bg-primary text-primary-foreground"
                    >
                      {loading ? "Buscando..." : "Consultar CNPJ"}
                    </Button>
                  </>
                )}
                {step === 2 && cnpjData && !cnpjConfirmed && (
                  <div className="bg-[var(--input)] rounded-lg p-8 mt-6 shadow-md w-full text-[var(--foreground)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-primary">
                              CNPJ
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.cnpj}
                                className="border border-border rounded-lg p-2"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="razaoSocial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-primary">
                              Nome
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.razao_social || ""}
                                className="border border-border rounded-lg p-2"
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
                            <FormLabel className="font-bold text-primary">
                              Nome Fantasia
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.nome_fantasia || ""}
                                className="border border-border rounded-lg p-2"
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
                            <FormLabel className="font-bold text-primary">
                              CNAE
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.cnae || ""}
                                className="border border-border rounded-lg p-2"
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
                            <FormLabel className="font-bold text-primary">
                              Endereço
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.endereco || ""}
                                className="border border-border rounded-lg p-2"
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
                            <FormLabel className="font-bold text-primary">
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled
                                value={cnpjData.telefone || ""}
                                className="border border-border rounded-lg p-2"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        onClick={onBack}
                        className="bg-accent text-accent-foreground hover:text-accent"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={confirmCnpjData}
                        className="bg-primary text-primary-foreground"
                      >
                        Confirmar Informações
                      </Button>
                    </div>
                  </div>
                )}
                {step === 2 && cnpjConfirmed && (
                  <>
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowChatbot(true)}
                        className="my-2 flex flex-row gap-1 bg-accent text-accent-foreground hover:bg-input"
                      >
                        Assistente Virtual
                        <ChatIcon />
                      </Button>
                    </div>
                    <div className="rounded-lg p-8 mt-6 shadow-md w-full text-foreground">
                      <FormField
                        control={form.control}
                        name="prestadora_servico"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-2 mb-4">
                            <FormLabel className="font-bold text-primary">
                              A empresa presta serviços ou vende produtos?
                            </FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="border border-border rounded-lg p-2 text-foreground"
                              >
                                <option value="">Selecione uma opção</option>
                                <option value="Presta serviços">
                                  Presta serviços
                                </option>
                                <option value="Vende produtos">
                                  Vende produtos
                                </option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ramo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-primary">
                              Qual o ramo da empresa?
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Tecnologia"
                                {...field}
                                className="border border-border rounded-lg p-2 bg-input text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        onClick={onBack}
                        className="bg-accent text-accent-foreground hover:text-accent"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground"
                      >
                        {loading ? "Carregando..." : "Finalizar"}
                      </Button>
                    </div>
                  </>
                )}

                {step === 0 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-4 bg-primary text-primary-foreground"
                  >
                    Próximo
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      )}
      {showChatbot && (
        <ChatbotModal
          onClose={() => setShowChatbot(false)}
          username={formData.username}
        />
      )}
    </div>
  );
}
