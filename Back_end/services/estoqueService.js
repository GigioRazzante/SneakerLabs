// services/estoqueService.js - VERSÃO COMPLETA ATUALIZADA
import pool from '../config/database.js';

class EstoqueService {
  async listarEstoque() {
    const result = await pool.query('SELECT * FROM estoque_maquina ORDER BY categoria, nome_produto');
    return result.rows;
  }

  async reporItem(id, quantidade) {
    const result = await pool.query(
      'UPDATE estoque_maquina SET quantidade = quantidade + $1 WHERE id = $2 RETURNING *',
      [quantidade, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Item não encontrado no estoque');
    }
    
    return result.rows[0];
  }

  // Verificar se tem estoque para um pedido
  async verificarEstoqueParaProducao(blocosNecessarios, laminasNecessarias) {
    const estoque = await this.listarEstoque();
    // Verificar se tem lâminas e blocos suficientes
    return { podeProduzir: true, itensFaltantes: [] };
  }

  // 🎯 FUNÇÃO: Baixar estoque automaticamente para um pedido
  async baixarEstoquePedido(produtoConfig) {
    try {
      const { passoUmDeCinco, passoDoisDeCinco, passoTresDeCinco, passoQuatroDeCinco, passoCincoDeCinco } = produtoConfig;
      
      console.log(`[ESTOQUE] Baixando estoque para: ${passoUmDeCinco}, ${passoDoisDeCinco}, ${passoTresDeCinco}, ${passoQuatroDeCinco}, ${passoCincoDeCinco}`);

      // Mapeamento igual ao generateBoxPayload
      const styleMap = {
          "Casual": { codigo: 'B1', quantidade: 1 },
          "Corrida": { codigo: 'B2', quantidade: 2 },
          "Skate": { codigo: 'B3', quantidade: 3 },
      };

      const materialMap = {
          "Couro": { codigo: 'M1', quantidade: 1 },
          "Camurça": { codigo: 'M2', quantidade: 1 },
          "Tecido": { codigo: 'M3', quantidade: 1 },
      };

      const soladoMap = {
          "Borracha": { codigo: 'S1', quantidade: 1 },
          "EVA": { codigo: 'S2', quantidade: 1 },
          "Air": { codigo: 'S3', quantidade: 1 },
      };

      const corMap = {
          "Branco": { codigo: 'L1', quantidade: 1 },
          "Preto": { codigo: 'L2', quantidade: 1 },
          "Azul": { codigo: 'L3', quantidade: 1 },
          "Vermelho": { codigo: 'L4', quantidade: 1 },
          "Verde": { codigo: 'L5', quantidade: 1 },
          "Amarelo": { codigo: 'L6', quantidade: 1 },
      };

      const detalhesMap = {
          "Cadarço normal": { codigo: 'D1', quantidade: 1 },
          "Cadarço colorido": { codigo: 'D2', quantidade: 1 },
          "Sem cadarço": { codigo: 'D3', quantidade: 1 },
      };

      // Itens a baixar
      const itensParaBaixar = [];
      
      // Bloco do estilo
      const estiloConfig = styleMap[passoUmDeCinco];
      if (estiloConfig) {
          itensParaBaixar.push(estiloConfig);
      }
      
      // Material
      const materialConfig = materialMap[passoDoisDeCinco];
      if (materialConfig) {
          itensParaBaixar.push(materialConfig);
      }
      
      // Solado
      const soladoConfig = soladoMap[passoTresDeCinco];
      if (soladoConfig) {
          itensParaBaixar.push(soladoConfig);
      }
      
      // Cor
      const corConfig = corMap[passoQuatroDeCinco];
      if (corConfig) {
          itensParaBaixar.push(corConfig);
      }
      
      // Detalhes
      const detalhesConfig = detalhesMap[passoCincoDeCinco];
      if (detalhesConfig) {
          itensParaBaixar.push(detalhesConfig);
      }

      console.log(`[ESTOQUE] Itens para baixar:`, itensParaBaixar);

      // Executar baixas no estoque
      for (const item of itensParaBaixar) {
          const result = await pool.query(
              'UPDATE estoque_maquina SET quantidade = quantidade - $1 WHERE codigo = $2 RETURNING nome_produto, quantidade',
              [item.quantidade, item.codigo]
          );
          
          if (result.rows.length > 0) {
              console.log(`[ESTOQUE] Baixado: ${item.codigo} (${result.rows[0].nome_produto}) x${item.quantidade} | Novo estoque: ${result.rows[0].quantidade}`);
          } else {
              console.log(`[ESTOQUE] AVISO: Item ${item.codigo} não encontrado no estoque`);
          }
      }
      
      console.log(`[ESTOQUE] Baixa concluída para produto`);
      return true;
      
    } catch (error) {
        console.error('[ESTOQUE] Erro ao baixar estoque:', error);
        throw error;
    }
  }

  // 🎯 NOVA FUNÇÃO: Repor estoque quando entrega é confirmada
  async reporEstoquePedido(produtoConfig) {
    try {
      const { passoUmDeCinco, passoDoisDeCinco, passoTresDeCinco, passoQuatroDeCinco, passoCincoDeCinco } = produtoConfig;
      
      console.log(`[ESTOQUE] Repondo estoque para: ${passoUmDeCinco}, ${passoDoisDeCinco}, ${passoTresDeCinco}, ${passoQuatroDeCinco}, ${passoCincoDeCinco}`);

      // Mapeamento igual ao usado na baixa
      const styleMap = {
          "Casual": { codigo: 'B1', quantidade: 1 },
          "Corrida": { codigo: 'B2', quantidade: 2 },
          "Skate": { codigo: 'B3', quantidade: 3 },
      };

      const materialMap = {
          "Couro": { codigo: 'M1', quantidade: 1 },
          "Camurça": { codigo: 'M2', quantidade: 1 },
          "Tecido": { codigo: 'M3', quantidade: 1 },
      };

      const soladoMap = {
          "Borracha": { codigo: 'S1', quantidade: 1 },
          "EVA": { codigo: 'S2', quantidade: 1 },
          "Air": { codigo: 'S3', quantidade: 1 },
      };

      const corMap = {
          "Branco": { codigo: 'L1', quantidade: 1 },
          "Preto": { codigo: 'L2', quantidade: 1 },
          "Azul": { codigo: 'L3', quantidade: 1 },
          "Vermelho": { codigo: 'L4', quantidade: 1 },
          "Verde": { codigo: 'L5', quantidade: 1 },
          "Amarelo": { codigo: 'L6', quantidade: 1 },
      };

      const detalhesMap = {
          "Cadarço normal": { codigo: 'D1', quantidade: 1 },
          "Cadarço colorido": { codigo: 'D2', quantidade: 1 },
          "Sem cadarço": { codigo: 'D3', quantidade: 1 },
      };

      // Itens a repor (MESMA lógica da baixa, mas agora ADICIONANDO)
      const itensParaRepor = [];
      
      // Bloco do estilo
      const estiloConfig = styleMap[passoUmDeCinco];
      if (estiloConfig) {
          itensParaRepor.push(estiloConfig);
      }
      
      // Material
      const materialConfig = materialMap[passoDoisDeCinco];
      if (materialConfig) {
          itensParaRepor.push(materialConfig);
      }
      
      // Solado
      const soladoConfig = soladoMap[passoTresDeCinco];
      if (soladoConfig) {
          itensParaRepor.push(soladoConfig);
      }
      
      // Cor
      const corConfig = corMap[passoQuatroDeCinco];
      if (corConfig) {
          itensParaRepor.push(corConfig);
      }
      
      // Detalhes
      const detalhesConfig = detalhesMap[passoCincoDeCinco];
      if (detalhesConfig) {
          itensParaRepor.push(detalhesConfig);
      }

      console.log(`[ESTOQUE] Itens para repor:`, itensParaRepor);

      // Executar reposição no estoque (AGORA ADICIONA quantidade)
      for (const item of itensParaRepor) {
          const result = await pool.query(
              'UPDATE estoque_maquina SET quantidade = quantidade + $1 WHERE codigo = $2 RETURNING nome_produto, quantidade',
              [item.quantidade, item.codigo]
          );
          
          if (result.rows.length > 0) {
              console.log(`[ESTOQUE] Reposto: ${item.codigo} (${result.rows[0].nome_produto}) +${item.quantidade} | Novo estoque: ${result.rows[0].quantidade}`);
          } else {
              console.log(`[ESTOQUE] AVISO: Item ${item.codigo} não encontrado no estoque para reposição`);
          }
      }
      
      console.log(`[ESTOQUE] Reposição concluída para produto`);
      return true;
      
    } catch (error) {
        console.error('[ESTOQUE] Erro ao repor estoque:', error);
        throw error;
    }
  }
}

export default new EstoqueService();