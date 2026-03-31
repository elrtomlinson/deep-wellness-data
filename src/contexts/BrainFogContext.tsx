import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface BrainFogContextType {
  brainFogMode: boolean;
  setBrainFogMode: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const BrainFogContext = createContext<BrainFogContextType>({
  brainFogMode: false,
  setBrainFogMode: () => {},
});

export function BrainFogProvider({ children }: { children: ReactNode }) {
  const [brainFogMode, setBrainFogMode] = useLocalStorage('brain-fog-mode', false);

  return (
    <BrainFogContext.Provider value={{ brainFogMode, setBrainFogMode }}>
      {children}
    </BrainFogContext.Provider>
  );
}

export function useBrainFog() {
  return useContext(BrainFogContext);
}
