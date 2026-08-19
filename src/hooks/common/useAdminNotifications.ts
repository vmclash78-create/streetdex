import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { 
  unlockAudioContext, 
  playNotificationSound, 
  normalizePresetId, 
  isLegacyUrlValue,
  type SoundPresetId 
} from "@/lib/notification-sounds";
import { useStoreSettings } from "@/hooks/useStoreData";
import { useToast } from "@/hooks/use-toast";
import { AUDIO_CONFIG } from "@/constants/admin";

/**
 * Hook para gerenciar notificações sonoras e visuais no painel administrativo.
 */
export const useAdminNotifications = () => {
  const { toast } = useToast();
  const { data: settings } = useStoreSettings();
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const audioUnlockedRef = useRef(false);

  const selectedPreset: SoundPresetId = useMemo(() => {
    const raw = settings?.notification_sound;
    if (!raw || isLegacyUrlValue(raw)) return AUDIO_CONFIG.DEFAULT_PRESET;
    return normalizePresetId(raw);
  }, [settings?.notification_sound]);

  const notificationVolume = useMemo(() => {
    const raw = settings?.notification_volume;
    const n = typeof raw === "string" ? parseFloat(raw) : Number(raw ?? AUDIO_CONFIG.DEFAULT_VOLUME);
    if (!Number.isFinite(n)) return AUDIO_CONFIG.DEFAULT_VOLUME;
    return Math.max(0, Math.min(1, n));
  }, [settings?.notification_volume]);

  const presetRef = useRef<SoundPresetId>(selectedPreset);
  const volumeRef = useRef<number>(notificationVolume);

  useEffect(() => { presetRef.current = selectedPreset; }, [selectedPreset]);
  useEffect(() => { volumeRef.current = notificationVolume; }, [notificationVolume]);

  const handleUnlockAudio = useCallback(async () => {
    if (audioUnlockedRef.current) return true;
    const success = await unlockAudioContext();
    if (success) {
      audioUnlockedRef.current = true;
      setIsAudioUnlocked(true);
    }
    return success;
  }, []);

  const playNotification = useCallback(async (presetOverride?: SoundPresetId) => {
    const preset = presetOverride ?? presetRef.current;
    const success = await playNotificationSound(preset, volumeRef.current);
    if (!success) {
      audioUnlockedRef.current = false;
      setIsAudioUnlocked(false);
    }
    return success;
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notificações Ativadas",
          description: "Você receberá alertas sonoros e visuais de novos pedidos.",
        });
      }
      return permission;
    }
    return Notification.permission;
  }, [toast]);

  return {
    isAudioUnlocked,
    selectedPreset,
    notificationVolume,
    handleUnlockAudio,
    playNotification,
    requestBrowserPermission,
  };
};
