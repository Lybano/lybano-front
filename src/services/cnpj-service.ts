export async function fetchCnpjData(cnpj: string | undefined) {
  const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados do CNPJ");
  }
  const data = await response.json();
  return {
    number_cnpj: data.estabelecimento.cnpj,
    razaoSocial: data.razao_social || "",
    nomeFantasia: data.estabelecimento?.nome_fantasia || "",
    // cnae: data.atividade_principal ? data.atividade_principal[0].descricao : "",
    cnae: data.estabelecimento.atividade_principal.descricao,
    proprietarios: data.socios
      ? data.socios.map((owner: any) => owner.nome)
      : [],
    endereco: `${data.estabelecimento.logradouro || ""}, ${
      data.estabelecimento.numero || ""
    } - ${data.estabelecimento.bairro || ""}, ${
      data.estabelecimento.cidade.nome || ""
    } - ${data.estabelecimento.estado.sigla || ""}, ${
      data.estabelecimento.cep || ""
    }`,
    telefone: data.estabelecimento.telefone1 || "",
    email: data.estabelecimento.email || "",
  };
}
