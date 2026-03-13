import type { RunRuntimeVO } from '../../types/vo/RunRuntimeVO';

interface RunningTaskCardProps {
    runtime: RunRuntimeVO;
    onCancel: () => void;
  }
  