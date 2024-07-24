import api from "./api";
import { SIGNUP_CNPJ } from "@/constants/api-routes";

export async function getCnpjData(cnpj: string | undefined) {
  try {
    const response = await api.get(SIGNUP_CNPJ(cnpj));
    const data = response.data;

    return {
      cnpj: data.cnpj || "",
      razao_social: data.razao_social || "",
      nome_fantasia: data.nome_fantasia || "",
      cnae: data.cnae || "",
      endereco: data.endereco || "",
      telefone: data.telefone || "",
    };
  } catch (error) {
    throw new Error("Erro ao buscar dados do CNPJ");
  }
}

export async function postCnpjData(values: any) {
  try {
    await api.post(SIGNUP_CNPJ(values.cnpj), {
      cnpj: values.cnpj,
      prestadora_servico: values.prestadora_servico,
      ramo: values.ramo,
    });
  } catch (error) {
    throw new Error("Erro ao cadastrar CNPJ");
  }
}
