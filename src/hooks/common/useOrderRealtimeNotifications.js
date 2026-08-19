import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";
/**
 * Hook para escutar novos pedidos via Realtime e disparar notificações.
 */
export const useOrderRealtimeNotifications = (onNewOrder) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const lastOrderRef = useRef(null);
    useEffect(() => {
        console.log("Configurando canal de notificações de pedidos...");
        const channel = supabase
            .channel('admin-order-notifications-v2')
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
        }, async (payload) => {
            console.log('RECEBIDO: Novo pedido no banco de dados:', payload);
            if (lastOrderRef.current === payload.new.id) {
                console.log('Ignorando notificação duplicada para o ID:', payload.new.id);
                return;
            }
            lastOrderRef.current = payload.new.id;
            toast({
                title: "🔔 NOVO PEDIDO RECEBIDO!",
                description: `Pedido #${payload.new.order_number} - ${formatPrice(payload.new.total)}`,
                duration: 10000,
            });
            // Notificação Desktop (Browser)
            if ("Notification" in window && Notification.permission === "granted") {
                try {
                    new Notification("🔔 Novo Pedido Street Dex!", {
                        body: `Pedido #${payload.new.order_number} - ${formatPrice(payload.new.total)}`,
                        tag: 'new-order',
                        requireInteraction: true
                    });
                }
                catch (err) {
                    console.error("Erro ao disparar notificação desktop:", err);
                }
            }
            if (onNewOrder)
                onNewOrder();
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order-items"] });
        })
            .subscribe((status) => {
            console.log("Status da conexão Realtime:", status);
        });
        return () => {
            console.log("Removendo canal de notificações");
            supabase.removeChannel(channel);
        };
    }, [toast, queryClient, onNewOrder]);
    return null;
};
