import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Quanto tempo leva para entregar?",
    a: "O prazo varia de acordo com a sua região e a modalidade de frete escolhida (PAC ou SEDEX). Após a confirmação do pagamento, o pedido é postado em até 2 dias úteis. Você recebe o código de rastreio por WhatsApp.",
  },
  {
    q: "Como funciona o frete?",
    a: "Calculamos o frete em tempo real pela sua região. Oferecemos PAC (mais econômico) e SEDEX (mais rápido). Compras acima de R$399,99 têm FRETE GRÁTIS para todo o Brasil.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Aceitamos PIX (com desconto extra), dinheiro na entrega (consultar região) e cartão de crédito parcelado em até 12x. O pagamento é confirmado via WhatsApp após o checkout.",
  },
  {
    q: "Como sei meu tamanho?",
    a: "Em cada página de produto você encontra a Tabela de Medidas com largura, comprimento e manga em centímetros. Nossas camisetas têm modelagem OVERSIZED — se ficar em dúvida, escolha o tamanho que você costuma usar.",
  },
  {
    q: "Posso trocar ou devolver?",
    a: "Sim! Você tem até 7 dias após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor. A peça precisa estar sem uso, com etiqueta e na embalagem original.",
  },
  {
    q: "O produto está esgotado, e agora?",
    a: "Chame a gente no WhatsApp! Avisamos assim que repor o estoque ou produzimos sob encomenda dependendo da peça.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="bg-card/30 border-y border-border/50">
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <HelpCircle size={22} className="text-primary" />
          </div>
          <p className="text-[0.65rem] text-primary font-bold tracking-[0.3em] uppercase mb-1">Tire suas dúvidas</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-wider">
            Perguntas Frequentes
          </h2>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full neon-glow" />
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border/50 rounded-lg bg-background/50 px-4 data-[state=open]:border-primary/40 data-[state=open]:bg-card/60 transition-colors"
            >
              <AccordionTrigger className="text-left text-sm md:text-base font-bold uppercase tracking-wider hover:no-underline hover:text-primary py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
