export function exportarParaCSV(dados: any[], nomeArquivo: string) {
  if (!dados || !dados.length) {
    alert("Não há dados para exportar.");
    return;
  }

  // 1. Extrair os cabeçalhos (chaves do primeiro objeto)
  const cabecalhos = Object.keys(dados[0]);

  // 2. Mapear as linhas de dados, escapando vírgulas e aspas para não quebrar o CSV
  const linhas = dados.map((linha) =>
    cabecalhos
      .map((cabecalho) => {
        let valor =
          linha[cabecalho] === null || linha[cabecalho] === undefined
            ? ""
            : linha[cabecalho];
        valor = String(valor).replace(/"/g, '""'); // Escapa aspas duplas
        return "${valor}"; // Envolve em aspas para proteger vírgulas internas
      })
      .join(","),
  );

  // 3. Juntar cabeçalhos e linhas
  const csvContent = [cabecalhos.join(","), ...linhas].join("\n");

  // 4. Adicionar BOM (Byte Order Mark) para o Excel reconhecer os acentos do Português (UTF-8)
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // 5. Forçar o download criando um link temporário
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${nomeArquivo}_${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
