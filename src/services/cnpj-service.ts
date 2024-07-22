import axios from "axios";

export async function fetchCnpjData(cnpj: string | undefined) {
  try {
    const response = await axios.get(
      `https://a7be-177-37-184-198.ngrok-free.app/cnpj/${cnpj}`
    );
    const data = response.data;

    return [
      {
        cnpj: data.estabelecimento.cnpj,
        razao_social: data.razao_social || "",
        nome_fantasia: data.estabelecimento?.nome_fantasia || "",
        cnae: `${data.estabelecimento.atividade_principal.codigo} - ${data.estabelecimento.atividade_principal.descricao}`,
        endereco: `${data.estabelecimento.logradouro || ""}, ${
          data.estabelecimento.numero || ""
        } - ${data.estabelecimento.bairro || ""}, ${
          data.estabelecimento.cidade.nome || ""
        } - ${data.estabelecimento.estado.sigla || ""}, ${
          data.estabelecimento.cep || ""
        }`,
        telefone: data.estabelecimento.telefone1 || "",
        email: data.estabelecimento.email || null,
      },
    ];
  } catch (error) {
    throw new Error("Erro ao buscar dados do CNPJ");
  }
}
