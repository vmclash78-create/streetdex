# Plano de Execução: Preparação completa para produção

**Tipo:** Segurança, correção e preparação operacional  
**Complexidade:** XL  
**Impacto:** Loja, checkout, painel administrativo, banco de dados e publicação  
**Riscos:** Vazamento de pedidos, vendas sem estoque, preços adulterados e perda de dados de teste

## Fases

1. **Fechar falhas críticas de segurança**
   - Impedir leitura pública direta de pedidos, itens e dados dos clientes.
   - Restringir configurações da loja exclusivamente ao administrador.
   - Manter somente as funções públicas indispensáveis ao checkout e rastreio.
   - Desativar cadastro público e revisar permissões de arquivos.

2. **Tornar pedidos confiáveis**
   - Validar preço, quantidade e estoque no servidor ao criar o pedido.
   - Impedir compra de produto esgotado ou quantidade acima do estoque.
   - Atualizar o estoque de forma segura e atômica após cada pedido.
   - Processar cupom junto com o pedido, sem erro posterior ao cliente.

3. **Corrigir checkout e WhatsApp**
   - Validar cada etapa antes de avançar.
   - Preservar e enviar a observação digitada no carrinho.
   - Evitar bloqueio do WhatsApp e oferecer ação de reenvio na confirmação.
   - Bloquear publicação caso WhatsApp ou chave Pix ainda estejam com valores fictícios.
   - Reduzir dados pessoais persistidos no dispositivo.

4. **Revisar o painel administrativo**
   - Testar login e permissão de administrador.
   - Testar cadastro, edição, imagem, estoque, pedidos, cupons, vendas, despesas e configurações.
   - Remover integrações antigas de frete e mensagens de depuração.
   - Corrigir falhas encontradas nos fluxos administrativos.

5. **Validação final**
   - Executar testes automatizados, verificação de dependências e nova auditoria de segurança.
   - Testar loja e painel em computador e celular.
   - Confirmar um pedido completo sem cobrança real e validar atualização do estoque.

6. **Limpeza e publicação**
   - Após tudo aprovado, apagar produtos, pedidos, clientes e financeiro de teste, conforme solicitado.
   - Preservar a conta e a permissão do administrador.
   - Publicar a versão revisada e confirmar o endereço público.

## Critérios de conclusão

- [ ] Nenhum dado de cliente pode ser listado publicamente.
- [ ] Nenhum pedido aceita preço adulterado ou estoque insuficiente.
- [ ] Checkout, WhatsApp e rastreio têm recuperação contra falhas.
- [ ] Todas as áreas principais do painel funcionam sem erros.
- [ ] Testes e auditoria de segurança passam sem bloqueios críticos.
- [ ] Dados de teste são apagados somente na etapa final.
- [ ] Site é publicado após a validação completa.
